import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  activityLogs,
  agents,
  customers,
  kbArticles,
  ticketMessages,
  tickets,
  users,
} from './schema.ts';
import {
  SEED_ACTIVITY,
  SEED_AGENTS,
  SEED_CUSTOMERS,
  SEED_KB_ARTICLES,
  SEED_TICKETS,
} from '../data/seedData.ts';

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const cleanName = displayName && displayName.trim().length > 0 ? displayName.trim() : 'Alex Morgan';
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: cleanName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function ensureWorkspaceSeeded(ownerUid: string) {
  try {
    const existingAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.ownerUid, ownerUid))
      .limit(1);

    if (existingAgents.length > 0) {
      return;
    }

    const insertedAgents = await db
      .insert(agents)
      .values(
        SEED_AGENTS.map((a) => ({
          ownerUid,
          name: a.name,
          initials: a.initials,
          role: a.role,
          email: a.email,
          status: a.status,
          activeCount: a.activeCount,
        }))
      )
      .returning();

    const insertedCustomers = await db
      .insert(customers)
      .values(
        SEED_CUSTOMERS.map((c) => ({
          ownerUid,
          name: c.name,
          initials: c.initials,
          company: c.company,
          email: c.email,
          plan: c.plan,
        }))
      )
      .returning();

    const agentMap = new Map(insertedAgents.map((a) => [a.name, a]));
    const customerMap = new Map(insertedCustomers.map((c) => [c.name, c]));

    const insertedTickets = await db
      .insert(tickets)
      .values(
        SEED_TICKETS.map((t) => {
          const matchedAgent = t.assignedAgentName ? agentMap.get(t.assignedAgentName) : undefined;
          const matchedCustomer = customerMap.get(t.customerName);
          return {
            ownerUid,
            refId: t.refId,
            subject: t.subject,
            description: t.description,
            customerId: matchedCustomer?.id ?? null,
            customerName: t.customerName,
            customerInitials: t.customerInitials,
            customerCompany: t.customerCompany,
            category: t.category,
            priority: t.priority,
            status: t.status,
            assignedAgentId: matchedAgent?.id ?? null,
            assignedAgentName: t.assignedAgentName ?? null,
            assignedAgentInitials: t.assignedAgentInitials ?? null,
            waitMinutes: t.waitMinutes,
            slaMinutesRemaining: t.slaMinutesRemaining ?? null,
            attentionReason: t.attentionReason ?? null,
            aiDraftReply: t.aiDraftReply ?? null,
            needsAttention: t.needsAttention,
            dismissedFromQueue: t.dismissedFromQueue,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          };
        })
      )
      .returning();

    const ticketRefMap = new Map(insertedTickets.map((t) => [t.refId, t.id]));
    const seedMessageValues: Array<{
      ownerUid: string;
      ticketId: number;
      senderName: string;
      senderType: string;
      body: string;
      isInternal: boolean;
      createdAt: Date;
    }> = [];

    for (const seedT of SEED_TICKETS) {
      const dbTicketId = ticketRefMap.get(seedT.refId);
      if (!dbTicketId || !seedT.messages) continue;
      for (const m of seedT.messages) {
        seedMessageValues.push({
          ownerUid,
          ticketId: dbTicketId,
          senderName: m.senderName,
          senderType: m.senderType,
          body: m.body,
          isInternal: m.isInternal,
          createdAt: new Date(m.createdAt),
        });
      }
    }

    if (seedMessageValues.length > 0) {
      await db.insert(ticketMessages).values(seedMessageValues);
    }

    await db.insert(activityLogs).values(
      SEED_ACTIVITY.map((log) => ({
        ownerUid,
        actor: log.actor,
        action: log.action,
        ticketRef: log.ticketRef ?? null,
        detail: log.detail ?? null,
        createdAt: new Date(log.createdAt),
      }))
    );

    await db.insert(kbArticles).values(
      SEED_KB_ARTICLES.map((art) => ({
        ownerUid,
        title: art.title,
        category: art.category,
        summary: art.summary,
        content: art.content,
        views: art.views,
        updatedAt: new Date(art.updatedAt),
      }))
    );
  } catch (error) {
    console.error('Database error in ensureWorkspaceSeeded:', error);
    throw new Error('Failed to initialize workspace dataset.', { cause: error });
  }
}

export async function getWorkspaceSnapshot(ownerUid: string) {
  try {
    const [userRows, agentRows, customerRows, ticketRows, messageRows, activityRows, kbRows] =
      await Promise.all([
        db.select().from(users).where(eq(users.uid, ownerUid)).limit(1),
        db.select().from(agents).where(eq(agents.ownerUid, ownerUid)).orderBy(agents.id),
        db.select().from(customers).where(eq(customers.ownerUid, ownerUid)).orderBy(customers.id),
        db
          .select()
          .from(tickets)
          .where(eq(tickets.ownerUid, ownerUid))
          .orderBy(desc(tickets.id)),
        db
          .select()
          .from(ticketMessages)
          .where(eq(ticketMessages.ownerUid, ownerUid))
          .orderBy(ticketMessages.createdAt),
        db
          .select()
          .from(activityLogs)
          .where(eq(activityLogs.ownerUid, ownerUid))
          .orderBy(desc(activityLogs.createdAt))
          .limit(30),
        db
          .select()
          .from(kbArticles)
          .where(eq(kbArticles.ownerUid, ownerUid))
          .orderBy(desc(kbArticles.views)),
      ]);

    const messagesByTicket = new Map<number, typeof messageRows>();
    for (const msg of messageRows) {
      const list = messagesByTicket.get(msg.ticketId) ?? [];
      list.push(msg);
      messagesByTicket.set(msg.ticketId, list);
    }

    const hydratedTickets = ticketRows.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      messages: (messagesByTicket.get(t.id) ?? []).map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));

    return {
      settings: userRows[0] ?? null,
      agents: agentRows,
      customers: customerRows,
      tickets: hydratedTickets,
      activity: activityRows.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      kbArticles: kbRows.map((k) => ({
        ...k,
        updatedAt: k.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Database error in getWorkspaceSnapshot:', error);
    throw new Error('Failed to load workspace data.', { cause: error });
  }
}

export async function createTicketRecord(
  ownerUid: string,
  actorName: string,
  input: {
    subject: string;
    description: string;
    customerName: string;
    customerCompany: string;
    category: string;
    priority: string;
    assignedAgentId?: number | null;
  }
) {
  try {
    const existing = await db
      .select({ refId: tickets.refId })
      .from(tickets)
      .where(eq(tickets.ownerUid, ownerUid));

    let maxRef = 1048;
    for (const row of existing) {
      const parsed = parseInt(row.refId.replace(/\D/g, ''), 10);
      if (!Number.isNaN(parsed) && parsed > maxRef) maxRef = parsed;
    }
    const nextRefId = `RD-${maxRef + 1}`;

    let assignedAgent: typeof agents.$inferSelect | undefined;
    if (input.assignedAgentId) {
      const found = await db
        .select()
        .from(agents)
        .where(and(eq(agents.id, input.assignedAgentId), eq(agents.ownerUid, ownerUid)))
        .limit(1);
      assignedAgent = found[0];
    }

    const isUrgentOrHigh = input.priority === 'Urgent' || input.priority === 'High';
    const slaMinutes = input.priority === 'Urgent' ? 30 : input.priority === 'High' ? 240 : 720;

    const inserted = await db
      .insert(tickets)
      .values({
        ownerUid,
        refId: nextRefId,
        subject: input.subject.trim(),
        description: input.description.trim(),
        customerName: input.customerName.trim(),
        customerInitials: computeInitials(input.customerName),
        customerCompany: input.customerCompany.trim(),
        category: input.category,
        priority: input.priority,
        status: 'Open',
        assignedAgentId: assignedAgent?.id ?? null,
        assignedAgentName: assignedAgent?.name ?? null,
        assignedAgentInitials: assignedAgent?.initials ?? null,
        waitMinutes: 1,
        slaMinutesRemaining: slaMinutes,
        attentionReason: isUrgentOrHigh && !assignedAgent ? `${input.priority} priority unassigned` : null,
        aiDraftReply: `Hi ${input.customerName.split(' ')[0]}, thank you for reaching out regarding "${input.subject}". Our ${input.category.toLowerCase()} engineering specialist is reviewing your request now.`,
        needsAttention: isUrgentOrHigh && !assignedAgent,
        dismissedFromQueue: false,
      })
      .returning();

    const created = inserted[0];

    await db.insert(ticketMessages).values({
      ownerUid,
      ticketId: created.id,
      senderName: input.customerName.trim(),
      senderType: 'customer',
      body: input.description.trim(),
      isInternal: false,
    });

    await db.insert(activityLogs).values({
      ownerUid,
      actor: actorName,
      action: `created ticket ${nextRefId} (${input.priority})`,
      ticketRef: nextRefId,
      detail: input.subject.trim(),
    });

    return created;
  } catch (error) {
    console.error('Database error in createTicketRecord:', error);
    throw new Error('Failed to create ticket.', { cause: error });
  }
}

export async function updateTicketRecord(
  ownerUid: string,
  ticketId: number,
  actorName: string,
  patch: {
    status?: string;
    priority?: string;
    assignedAgentId?: number | null;
    dismissedFromQueue?: boolean;
    needsAttention?: boolean;
  }
) {
  try {
    const existingRows = await db
      .select()
      .from(tickets)
      .where(and(eq(tickets.id, ticketId), eq(tickets.ownerUid, ownerUid)))
      .limit(1);

    if (existingRows.length === 0) {
      return null;
    }
    const existing = existingRows[0];

    let nextAgentName = existing.assignedAgentName;
    let nextAgentInitials = existing.assignedAgentInitials;
    let nextAgentId = existing.assignedAgentId;

    if (patch.assignedAgentId !== undefined) {
      if (patch.assignedAgentId === null) {
        nextAgentId = null;
        nextAgentName = null;
        nextAgentInitials = null;
      } else {
        const agentRows = await db
          .select()
          .from(agents)
          .where(and(eq(agents.id, patch.assignedAgentId), eq(agents.ownerUid, ownerUid)))
          .limit(1);
        if (agentRows[0]) {
          nextAgentId = agentRows[0].id;
          nextAgentName = agentRows[0].name;
          nextAgentInitials = agentRows[0].initials;
        }
      }
    }

    const nextStatus = patch.status ?? existing.status;
    const nextNeedsAttention =
      patch.needsAttention !== undefined
        ? patch.needsAttention
        : nextStatus === 'Resolved' || nextStatus === 'Closed'
        ? false
        : existing.needsAttention;

    const updated = await db
      .update(tickets)
      .set({
        status: nextStatus,
        priority: patch.priority ?? existing.priority,
        assignedAgentId: nextAgentId,
        assignedAgentName: nextAgentName,
        assignedAgentInitials: nextAgentInitials,
        dismissedFromQueue: patch.dismissedFromQueue ?? existing.dismissedFromQueue,
        needsAttention: nextNeedsAttention,
        updatedAt: new Date(),
      })
      .where(and(eq(tickets.id, ticketId), eq(tickets.ownerUid, ownerUid)))
      .returning();

    const actionParts: string[] = [];
    if (patch.assignedAgentId !== undefined) {
      actionParts.push(
        nextAgentName ? `assigned ${existing.refId} to ${nextAgentName}` : `unassigned ${existing.refId}`
      );
    }
    if (patch.status && patch.status !== existing.status) {
      actionParts.push(`changed ${existing.refId} status to ${patch.status}`);
    }
    if (patch.priority && patch.priority !== existing.priority) {
      actionParts.push(`set ${existing.refId} priority to ${patch.priority}`);
    }

    if (actionParts.length > 0) {
      await db.insert(activityLogs).values({
        ownerUid,
        actor: actorName,
        action: actionParts.join(' & '),
        ticketRef: existing.refId,
        detail: existing.subject,
      });
    }

    return updated[0];
  } catch (error) {
    console.error('Database error in updateTicketRecord:', error);
    throw new Error('Failed to update ticket.', { cause: error });
  }
}

export async function addTicketMessageRecord(
  ownerUid: string,
  ticketId: number,
  senderName: string,
  body: string,
  isInternal: boolean
) {
  try {
    const ticketRows = await db
      .select()
      .from(tickets)
      .where(and(eq(tickets.id, ticketId), eq(tickets.ownerUid, ownerUid)))
      .limit(1);
    if (ticketRows.length === 0) return null;

    const inserted = await db
      .insert(ticketMessages)
      .values({
        ownerUid,
        ticketId,
        senderName,
        senderType: 'agent',
        body: body.trim(),
        isInternal,
      })
      .returning();

    await db
      .update(tickets)
      .set({
        updatedAt: new Date(),
        status: ticketRows[0].status === 'Open' && !isInternal ? 'In progress' : ticketRows[0].status,
        needsAttention: !isInternal ? false : ticketRows[0].needsAttention,
      })
      .where(and(eq(tickets.id, ticketId), eq(tickets.ownerUid, ownerUid)));

    await db.insert(activityLogs).values({
      ownerUid,
      actor: senderName,
      action: `${isInternal ? 'added internal note on' : 'replied to'} ${ticketRows[0].refId}`,
      ticketRef: ticketRows[0].refId,
      detail: body.trim().slice(0, 100),
    });

    return inserted[0];
  } catch (error) {
    console.error('Database error in addTicketMessageRecord:', error);
    throw new Error('Failed to post ticket message.', { cause: error });
  }
}

export async function updateAgentStatusRecord(ownerUid: string, agentId: number, status: string) {
  try {
    const updated = await db
      .update(agents)
      .set({ status })
      .where(and(eq(agents.id, agentId), eq(agents.ownerUid, ownerUid)))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Database error in updateAgentStatusRecord:', error);
    throw new Error('Failed to update agent status.', { cause: error });
  }
}

export async function createCustomerRecord(
  ownerUid: string,
  input: { name: string; company: string; email: string; plan: string }
) {
  try {
    const inserted = await db
      .insert(customers)
      .values({
        ownerUid,
        name: input.name.trim(),
        initials: computeInitials(input.name),
        company: input.company.trim(),
        email: input.email.trim(),
        plan: input.plan,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in createCustomerRecord:', error);
    throw new Error('Failed to create customer.', { cause: error });
  }
}

export async function createKbArticleRecord(
  ownerUid: string,
  input: { title: string; category: string; summary: string; content: string }
) {
  try {
    const inserted = await db
      .insert(kbArticles)
      .values({
        ownerUid,
        title: input.title.trim(),
        category: input.category,
        summary: input.summary.trim(),
        content: input.content.trim(),
        views: 1,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in createKbArticleRecord:', error);
    throw new Error('Failed to publish knowledge base article.', { cause: error });
  }
}

export async function updateWorkspaceSettingsRecord(
  ownerUid: string,
  patch: {
    workspaceName?: string;
    autoBalancerEnabled?: boolean;
    urgentSlaMinutes?: number;
    highSlaMinutes?: number;
    standardSlaMinutes?: number;
  }
) {
  try {
    const updated = await db
      .update(users)
      .set(patch)
      .where(eq(users.uid, ownerUid))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Database error in updateWorkspaceSettingsRecord:', error);
    throw new Error('Failed to update workspace settings.', { cause: error });
  }
}
