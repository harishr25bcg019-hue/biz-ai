import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  DEFAULT_WORKSPACE_SETTINGS,
  SEED_ACTIVITY,
  SEED_AGENTS,
  SEED_CUSTOMERS,
  SEED_KB_ARTICLES,
  SEED_TICKETS,
} from '../data/seedData';
import type {
  ActivityLog,
  Agent,
  AgentStatus,
  Customer,
  KbArticle,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  WorkspaceSettings,
} from '../types/support';
import { computeAgentWorkloads } from '../utils/supportLogic';

export function useResolveDeskStore() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbSynced, setDbSynced] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveRefresh, setLiveRefresh] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [agents, setAgents] = useState<Agent[]>(SEED_AGENTS);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [activity, setActivity] = useState<ActivityLog[]>(SEED_ACTIVITY);
  const [kbArticles, setKbArticles] = useState<KbArticle[]>(SEED_KB_ARTICLES);
  const [settings, setSettings] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS);

  const sseAbortRef = useRef<AbortController | null>(null);

  const fetchWorkspace = useCallback(async (firebaseUser: User) => {
    try {
      setSyncError(null);
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/workspace', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to load Cloud SQL workspace');
      }
      const data = await res.json();
      if (Array.isArray(data.tickets)) setTickets(data.tickets);
      if (Array.isArray(data.agents)) setAgents(data.agents);
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (Array.isArray(data.activity)) setActivity(data.activity);
      if (Array.isArray(data.kbArticles)) setKbArticles(data.kbArticles);
      if (data.settings) {
        setSettings({
          workspaceName: data.settings.workspaceName,
          workspaceCode: data.settings.workspaceCode,
          autoBalancerEnabled: data.settings.autoBalancerEnabled,
          urgentSlaMinutes: data.settings.urgentSlaMinutes,
          highSlaMinutes: data.settings.highSlaMinutes,
          standardSlaMinutes: data.settings.standardSlaMinutes,
          displayName: data.settings.displayName,
          role: data.settings.role,
          email: data.settings.email,
        });
      }
      setDbSynced(true);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Unable to sync with Cloud SQL');
    }
  }, []);

  // Connect authenticated SSE stream for real-time Cloud SQL updates
  useEffect(() => {
    if (!user || !liveRefresh) {
      sseAbortRef.current?.abort();
      setLiveConnected(false);
      return;
    }

    const controller = new AbortController();
    sseAbortRef.current = controller;

    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/events', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        setLiveConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? '';
          for (const block of blocks) {
            if (block.includes('event: workspace')) {
              await fetchWorkspace(user);
            }
          }
        }
      } catch {
        setLiveConnected(false);
      }
    })();

    return () => {
      controller.abort();
      setLiveConnected(false);
    };
  }, [user, liveRefresh, fetchWorkspace]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (firebaseUser) {
        await fetchWorkspace(firebaseUser);
      } else {
        setDbSynced(false);
      }
    });
    return () => unsub();
  }, [fetchWorkspace]);

  const signInWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    setTickets(SEED_TICKETS);
    setAgents(SEED_AGENTS);
    setCustomers(SEED_CUSTOMERS);
    setActivity(SEED_ACTIVITY);
    setKbArticles(SEED_KB_ARTICLES);
    setSettings(DEFAULT_WORKSPACE_SETTINGS);
    setDbSynced(false);
  }, []);

  const hydratedAgents = useMemo(() => computeAgentWorkloads(agents, tickets), [agents, tickets]);

  const authedFetch = useCallback(
    async (url: string, options: RequestInit) => {
      if (!user) return null;
      const token = await user.getIdToken();
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Database request failed');
      }
      return res.json();
    },
    [user]
  );

  const createTicket = useCallback(
    async (input: {
      subject: string;
      description: string;
      customerName: string;
      customerCompany: string;
      category: TicketCategory;
      priority: TicketPriority;
      assignedAgentId?: number | null;
    }) => {
      if (user) {
        const created = await authedFetch('/api/tickets', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        await fetchWorkspace(user);
        return created;
      }

      const maxNum = tickets.reduce((max, t) => {
        const n = parseInt(t.refId.replace(/\D/g, ''), 10) || 1000;
        return Math.max(max, n);
      }, 1048);
      const nextRef = `RD-${maxNum + 1}`;
      const matchedAgent = input.assignedAgentId
        ? agents.find((a) => a.id === input.assignedAgentId)
        : undefined;
      const initials = input.customerName
        .trim()
        .split(/\s+/)
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const nowIso = new Date().toISOString();
      const isUrgentOrHigh = input.priority === 'Urgent' || input.priority === 'High';
      const newTicket: Ticket = {
        id: Date.now(),
        refId: nextRef,
        subject: input.subject.trim(),
        description: input.description.trim() || input.subject.trim(),
        customerName: input.customerName.trim(),
        customerInitials: initials || 'CU',
        customerCompany: input.customerCompany.trim() || 'Enterprise Account',
        category: input.category,
        priority: input.priority,
        status: 'Open',
        assignedAgentId: matchedAgent?.id ?? null,
        assignedAgentName: matchedAgent?.name ?? null,
        assignedAgentInitials: matchedAgent?.initials ?? null,
        waitMinutes: 1,
        slaMinutesRemaining: input.priority === 'Urgent' ? 30 : input.priority === 'High' ? 240 : 720,
        attentionReason: isUrgentOrHigh && !matchedAgent ? `${input.priority} priority unassigned` : null,
        aiDraftReply: `Hi ${input.customerName.split(' ')[0]}, thanks for contacting Northstar Studio regarding "${input.subject}". We are investigating now.`,
        needsAttention: isUrgentOrHigh && !matchedAgent,
        dismissedFromQueue: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        messages: [
          {
            id: Date.now() + 1,
            ticketId: Date.now(),
            senderName: input.customerName.trim(),
            senderType: 'customer',
            body: input.description.trim() || input.subject.trim(),
            isInternal: false,
            createdAt: nowIso,
          },
        ],
      };

      setTickets((prev) => [newTicket, ...prev]);
      setActivity((prev) => [
        {
          id: Date.now() + 2,
          actor: settings.displayName,
          action: `created ticket ${nextRef} (${input.priority})`,
          ticketRef: nextRef,
          detail: input.subject.trim(),
          createdAt: nowIso,
        },
        ...prev,
      ]);
      return newTicket;
    },
    [user, authedFetch, fetchWorkspace, tickets, agents, settings.displayName]
  );

  const updateTicket = useCallback(
    async (
      ticketId: number,
      patch: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedAgentId?: number | null;
        dismissedFromQueue?: boolean;
        needsAttention?: boolean;
      }
    ) => {
      if (user) {
        await authedFetch(`/api/tickets/${ticketId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
        await fetchWorkspace(user);
        return;
      }

      const nowIso = new Date().toISOString();
      const matchedAgent =
        patch.assignedAgentId !== undefined && patch.assignedAgentId !== null
          ? agents.find((a) => a.id === patch.assignedAgentId)
          : undefined;

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          const nextStatus = patch.status ?? t.status;
          return {
            ...t,
            status: nextStatus,
            priority: patch.priority ?? t.priority,
            assignedAgentId:
              patch.assignedAgentId === null
                ? null
                : matchedAgent
                ? matchedAgent.id
                : t.assignedAgentId,
            assignedAgentName:
              patch.assignedAgentId === null
                ? null
                : matchedAgent
                ? matchedAgent.name
                : t.assignedAgentName,
            assignedAgentInitials:
              patch.assignedAgentId === null
                ? null
                : matchedAgent
                ? matchedAgent.initials
                : t.assignedAgentInitials,
            dismissedFromQueue: patch.dismissedFromQueue ?? t.dismissedFromQueue,
            needsAttention:
              patch.needsAttention !== undefined
                ? patch.needsAttention
                : nextStatus === 'Resolved' || nextStatus === 'Closed'
                ? false
                : t.needsAttention,
            updatedAt: nowIso,
          };
        })
      );

      const target = tickets.find((t) => t.id === ticketId);
      if (target) {
        const desc = matchedAgent
          ? `assigned ${target.refId} to ${matchedAgent.name}`
          : patch.status
          ? `updated ${target.refId} to ${patch.status}`
          : `updated ${target.refId}`;
        setActivity((prev) => [
          {
            id: Date.now(),
            actor: settings.displayName,
            action: desc,
            ticketRef: target.refId,
            detail: target.subject,
            createdAt: nowIso,
          },
          ...prev,
        ]);
      }
    },
    [user, authedFetch, fetchWorkspace, agents, tickets, settings.displayName]
  );

  const addTicketMessage = useCallback(
    async (ticketId: number, body: string, isInternal: boolean) => {
      if (!body.trim()) return;
      if (user) {
        await authedFetch(`/api/tickets/${ticketId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body, isInternal }),
        });
        await fetchWorkspace(user);
        return;
      }

      const nowIso = new Date().toISOString();
      const target = tickets.find((t) => t.id === ticketId);
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          return {
            ...t,
            status: t.status === 'Open' && !isInternal ? 'In progress' : t.status,
            needsAttention: !isInternal ? false : t.needsAttention,
            updatedAt: nowIso,
            messages: [
              ...(t.messages || []),
              {
                id: Date.now(),
                ticketId,
                senderName: settings.displayName,
                senderType: 'agent',
                body: body.trim(),
                isInternal,
                createdAt: nowIso,
              },
            ],
          };
        })
      );
      if (target) {
        setActivity((prev) => [
          {
            id: Date.now() + 1,
            actor: settings.displayName,
            action: `${isInternal ? 'added internal note on' : 'replied to'} ${target.refId}`,
            ticketRef: target.refId,
            detail: body.trim().slice(0, 90),
            createdAt: nowIso,
          },
          ...prev,
        ]);
      }
    },
    [user, authedFetch, fetchWorkspace, tickets, settings.displayName]
  );

  const updateAgentStatus = useCallback(
    async (agentId: number, status: AgentStatus) => {
      if (user) {
        await authedFetch(`/api/agents/${agentId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        await fetchWorkspace(user);
        return;
      }
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, status } : a)));
    },
    [user, authedFetch, fetchWorkspace]
  );

  const addCustomer = useCallback(
    async (input: { name: string; company: string; email: string; plan: string }) => {
      if (user) {
        await authedFetch('/api/customers', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        await fetchWorkspace(user);
        return;
      }
      const initials = input.name
        .trim()
        .split(/\s+/)
        .map((p) => p[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
      setCustomers((prev) => [
        {
          id: Date.now(),
          name: input.name.trim(),
          initials: initials || 'CU',
          company: input.company.trim(),
          email: input.email.trim(),
          plan: input.plan,
        },
        ...prev,
      ]);
    },
    [user, authedFetch, fetchWorkspace]
  );

  const addKbArticle = useCallback(
    async (input: { title: string; category: TicketCategory | 'Security'; summary: string; content: string }) => {
      if (user) {
        await authedFetch('/api/kb', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        await fetchWorkspace(user);
        return;
      }
      setKbArticles((prev) => [
        {
          id: Date.now(),
          title: input.title.trim(),
          category: input.category,
          summary: input.summary.trim() || input.content.trim().slice(0, 120),
          content: input.content.trim(),
          views: 1,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [user, authedFetch, fetchWorkspace]
  );

  const updateSettings = useCallback(
    async (patch: Partial<WorkspaceSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      if (user) {
        await authedFetch('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      }
    },
    [user, authedFetch]
  );

  const refreshNow = useCallback(async () => {
    if (user) {
      await fetchWorkspace(user);
    }
  }, [user, fetchWorkspace]);

  return {
    user,
    authReady,
    authLoading,
    authError,
    dbSynced,
    liveConnected,
    liveRefresh,
    setLiveRefresh,
    syncError,
    tickets,
    agents: hydratedAgents,
    customers,
    activity,
    kbArticles,
    settings,
    signInWithGoogle,
    signOutUser,
    createTicket,
    updateTicket,
    addTicketMessage,
    updateAgentStatus,
    addCustomer,
    addKbArticle,
    updateSettings,
    refreshNow,
  };
}
