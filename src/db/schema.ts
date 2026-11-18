import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default('Alex Morgan'),
  role: text('role').notNull().default('Administrator'),
  workspaceName: text('workspace_name').notNull().default('Northstar Studio'),
  workspaceCode: text('workspace_code').notNull().default('NS-804-STU'),
  autoBalancerEnabled: boolean('auto_balancer_enabled').notNull().default(true),
  urgentSlaMinutes: integer('urgent_sla_minutes').notNull().default(30),
  highSlaMinutes: integer('high_sla_minutes').notNull().default(240),
  standardSlaMinutes: integer('standard_sla_minutes').notNull().default(720),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull(),
  status: text('status').notNull().default('Available'),
  activeCount: integer('active_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull(),
  plan: text('plan').notNull().default('Studio Pro'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  refId: text('ref_id').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  customerName: text('customer_name').notNull(),
  customerInitials: text('customer_initials').notNull(),
  customerCompany: text('customer_company').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  assignedAgentId: integer('assigned_agent_id').references(() => agents.id),
  assignedAgentName: text('assigned_agent_name'),
  assignedAgentInitials: text('assigned_agent_initials'),
  waitMinutes: integer('wait_minutes').notNull().default(0),
  slaMinutesRemaining: integer('sla_minutes_remaining'),
  attentionReason: text('attention_reason'),
  aiDraftReply: text('ai_draft_reply'),
  needsAttention: boolean('needs_attention').notNull().default(false),
  dismissedFromQueue: boolean('dismissed_from_queue').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketMessages = pgTable('ticket_messages', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  ticketId: integer('ticket_id')
    .references(() => tickets.id, { onDelete: 'cascade' })
    .notNull(),
  senderName: text('sender_name').notNull(),
  senderType: text('sender_type').notNull(),
  body: text('body').notNull(),
  isInternal: boolean('is_internal').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  ticketRef: text('ticket_ref'),
  detail: text('detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const kbArticles = pgTable('kb_articles', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  views: integer('views').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  assignedAgent: one(agents, {
    fields: [tickets.assignedAgentId],
    references: [agents.id],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));
