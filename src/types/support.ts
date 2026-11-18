export type TicketCategory = 'Authentication' | 'Billing' | 'Technical' | 'Product';
export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In progress' | 'Resolved' | 'Closed';
export type AgentStatus = 'Available' | 'Busy' | 'Offline';

export type NavSection =
  | 'overview'
  | 'all-tickets'
  | 'attention-queue'
  | 'customers'
  | 'support-team'
  | 'knowledge-base'
  | 'reports'
  | 'settings';

export interface Agent {
  id: number;
  name: string;
  initials: string;
  role: string;
  email: string;
  status: AgentStatus;
  activeCount: number;
}

export interface Customer {
  id: number;
  name: string;
  initials: string;
  company: string;
  email: string;
  plan: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  refId: string;
  subject: string;
  description: string;
  customerId?: number | null;
  customerName: string;
  customerInitials: string;
  customerCompany: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: number | null;
  assignedAgentName?: string | null;
  assignedAgentInitials?: string | null;
  waitMinutes: number;
  slaMinutesRemaining?: number | null;
  attentionReason?: string | null;
  aiDraftReply?: string | null;
  needsAttention: boolean;
  dismissedFromQueue: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export interface ActivityLog {
  id: number;
  actor: string;
  action: string;
  ticketRef?: string | null;
  detail?: string | null;
  createdAt: string;
}

export interface KbArticle {
  id: number;
  title: string;
  category: TicketCategory | 'Security';
  summary: string;
  content: string;
  views: number;
  updatedAt: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  workspaceCode: string;
  autoBalancerEnabled: boolean;
  urgentSlaMinutes: number;
  highSlaMinutes: number;
  standardSlaMinutes: number;
  displayName: string;
  role: string;
  email: string;
}

export interface TicketFilters {
  search: string;
  status: 'All' | TicketStatus;
  priority: 'All' | TicketPriority;
  category: 'All' | TicketCategory;
  agent: 'All' | 'Unassigned' | string;
}
