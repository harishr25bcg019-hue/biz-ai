import type {
  ActivityLog,
  Agent,
  Customer,
  KbArticle,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  WorkspaceSettings,
} from '../types/support';

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  workspaceName: 'Northstar Studio',
  workspaceCode: 'NS-804-STU',
  autoBalancerEnabled: true,
  urgentSlaMinutes: 30,
  highSlaMinutes: 240,
  standardSlaMinutes: 720,
  displayName: 'Alex Morgan',
  role: 'Administrator',
  email: 'alex.morgan@northstar.studio',
};

export const SEED_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Maya Chen',
    initials: 'MC',
    role: 'Senior Support Specialist',
    email: 'maya.chen@northstar.studio',
    status: 'Available',
    activeCount: 2,
  },
  {
    id: 2,
    name: 'David Vance',
    initials: 'DV',
    role: 'Technical Support Engineer',
    email: 'david.vance@northstar.studio',
    status: 'Available',
    activeCount: 1,
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    initials: 'SJ',
    role: 'Billing Specialist',
    email: 'sarah.jenkins@northstar.studio',
    status: 'Available',
    activeCount: 0,
  },
  {
    id: 4,
    name: 'James Wilson',
    initials: 'JW',
    role: 'Tier 2 Support',
    email: 'james.wilson@northstar.studio',
    status: 'Available',
    activeCount: 0,
  },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Olivia Bennett', initials: 'OB', company: 'Acme Corp', email: 'olivia.bennett@acmecorp.io', plan: 'Enterprise' },
  { id: 2, name: 'Noah Williams', initials: 'NW', company: 'FinScale Ltd', email: 'noah@finscale.co', plan: 'Studio Pro' },
  { id: 3, name: 'Ava Patel', initials: 'AP', company: 'DataStream', email: 'ava.patel@datastream.ai', plan: 'Studio Pro' },
  { id: 4, name: 'Marcus Brody', initials: 'MB', company: 'Vector Global', email: 'mbrody@vectorglobal.com', plan: 'Enterprise' },
  { id: 5, name: 'Elena Rostova', initials: 'ER', company: 'Nexus Health', email: 'erostova@nexushealth.org', plan: 'Studio Pro' },
  { id: 6, name: 'Liam Thorne', initials: 'LT', company: 'ApexPay', email: 'liam@apexpay.dev', plan: 'Growth' },
  { id: 7, name: 'Sophia Ramirez', initials: 'SR', company: 'CloudStack', email: 'sophia@cloudstack.net', plan: 'Studio Pro' },
  { id: 8, name: 'Ethan Park', initials: 'EP', company: 'Lumina Labs', email: 'ethan@luminalabs.io', plan: 'Growth' },
];

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

function buildRemainingTickets(): Ticket[] {
  // We already define RD-1048 down to RD-1041 (8 tickets) explicitly.
  // Remaining 48 tickets (RD-1040 down to RD-993) balance exact counts:
  // Target Totals: Total=56, Open=9, In progress=3, Resolved=43, Closed=1
  // Priority Totals: Urgent=6, High=14, Medium=22, Low=14
  const explicit: Ticket[] = [
    {
      id: 1,
      refId: 'RD-1048',
      subject: 'Unable to access workspace after SSO update',
      description: 'Multiple Acme Corp admins receive SAML Assertion validation error (IDP v2.4) after rotating our Okta signing certificate this morning.',
      customerId: 1,
      customerName: 'Olivia Bennett',
      customerInitials: 'OB',
      customerCompany: 'Acme Corp',
      category: 'Authentication',
      priority: 'Urgent',
      status: 'Open',
      assignedAgentId: null,
      assignedAgentName: null,
      assignedAgentInitials: null,
      waitMinutes: 554,
      slaMinutesRemaining: 22,
      attentionReason: 'Unassigned for 9h',
      aiDraftReply: 'Hi Olivia — we confirmed your workspace SAML metadata still references the prior SHA-256 fingerprint from before the v2.4 rollout. I have refreshed your ACS validation cache; please re-upload the new Okta XML metadata under Security -> SAML SSO and test an incognito sign-in.',
      needsAttention: true,
      dismissedFromQueue: false,
      createdAt: minsAgo(554),
      updatedAt: minsAgo(12),
      messages: [
        {
          id: 1,
          ticketId: 1,
          senderName: 'Olivia Bennett',
          senderType: 'customer',
          body: 'After updating our Okta SSO app metadata for v2.4, our entire support org is locked out with ERR_SAML_AUDIENCE_MISMATCH.',
          isInternal: false,
          createdAt: minsAgo(554),
        },
        {
          id: 2,
          ticketId: 1,
          senderName: 'System',
          senderType: 'system',
          body: 'Correlated with identity provider v2.4 rollout at 08:00 UTC. Escalated to Urgent SLA tier.',
          isInternal: true,
          createdAt: minsAgo(12),
        },
      ],
    },
    {
      id: 2,
      refId: 'RD-1047',
      subject: 'Duplicate charge on November invoice',
      description: 'Our finance team noticed two identical $1,480 charges on November 12th for FinScale Ltd workspace renewal.',
      customerId: 2,
      customerName: 'Noah Williams',
      customerInitials: 'NW',
      customerCompany: 'FinScale Ltd',
      category: 'Billing',
      priority: 'High',
      status: 'In progress',
      assignedAgentId: 1,
      assignedAgentName: 'Maya Chen',
      assignedAgentInitials: 'MC',
      waitMinutes: 262,
      slaMinutesRemaining: 115,
      attentionReason: 'Customer awaiting reply',
      aiDraftReply: 'Hi Noah, thank you for flagging this and attaching the invoice PDF. I have confirmed the duplicate Stripe payment intent (pi_3Qx8L2...) and initiated a full refund of $1,480 back to your ending-4242 Visa. It will settle within 3-5 business days.',
      needsAttention: true,
      dismissedFromQueue: false,
      createdAt: minsAgo(320),
      updatedAt: minsAgo(18),
      messages: [
        {
          id: 3,
          ticketId: 2,
          senderName: 'Noah Williams',
          senderType: 'customer',
          body: 'Attached our November bank statement PDF showing two charges of $1,480 on Nov 12.',
          isInternal: false,
          createdAt: minsAgo(320),
        },
        {
          id: 4,
          ticketId: 2,
          senderName: 'Maya Chen',
          senderType: 'agent',
          body: 'Checking Stripe webhook logs now — looks like an idempotency retry triggered a second capture.',
          isInternal: true,
          createdAt: minsAgo(18),
        },
      ],
    },
    {
      id: 3,
      refId: 'RD-1046',
      subject: 'Scheduled exports are failing',
      description: 'Nightly CSV/Parquet export jobs for DataStream failed with HTTP 502 payload timeout at 02:00 UTC.',
      customerId: 3,
      customerName: 'Ava Patel',
      customerInitials: 'AP',
      customerCompany: 'DataStream',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      assignedAgentId: null,
      assignedAgentName: null,
      assignedAgentInitials: null,
      waitMinutes: 410,
      slaMinutesRemaining: 95,
      attentionReason: 'High priority unassigned',
      aiDraftReply: 'Hi Ava, our telemetry indicates your scheduled export exceeded the 128MB single-part stream threshold. Switching your export cadence to chunked Parquet parts resolves the 502 timeout immediately.',
      needsAttention: true,
      dismissedFromQueue: false,
      createdAt: minsAgo(410),
      updatedAt: minsAgo(45),
      messages: [
        {
          id: 5,
          ticketId: 3,
          senderName: 'Ava Patel',
          senderType: 'customer',
          body: 'Our 02:00 UTC scheduled export keeps failing with a 502 Bad Gateway after ~90 seconds.',
          isInternal: false,
          createdAt: minsAgo(410),
        },
      ],
    },
    {
      id: 4,
      refId: 'RD-1045',
      subject: 'Custom domain SSL certificate renewal issue',
      description: 'ACME DNS-01 verification challenge is timing out for support.vectorglobal.com.',
      customerId: 4,
      customerName: 'Marcus Brody',
      customerInitials: 'MB',
      customerCompany: 'Vector Global',
      category: 'Technical',
      priority: 'Medium',
      status: 'In progress',
      assignedAgentId: 2,
      assignedAgentName: 'David Vance',
      assignedAgentInitials: 'DV',
      waitMinutes: 48,
      slaMinutesRemaining: 420,
      attentionReason: null,
      aiDraftReply: 'Hi Marcus, we verified the CNAME propagation on _acme-challenge.support.vectorglobal.com and re-queued your TLS 1.3 certificate issuance.',
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(180),
      updatedAt: minsAgo(60),
      messages: [
        {
          id: 6,
          ticketId: 4,
          senderName: 'Marcus Brody',
          senderType: 'customer',
          body: 'Our TLS cert expires in 48 hours and auto-renewal says TXT record pending.',
          isInternal: false,
          createdAt: minsAgo(180),
        },
      ],
    },
    {
      id: 5,
      refId: 'RD-1044',
      subject: 'Request to add 15 additional seats to team tier',
      description: 'Onboarding a new regional support pod next Monday and need 15 Studio Pro seats provisioned.',
      customerId: 5,
      customerName: 'Elena Rostova',
      customerInitials: 'ER',
      customerCompany: 'Nexus Health',
      category: 'Billing',
      priority: 'Low',
      status: 'Resolved',
      assignedAgentId: 1,
      assignedAgentName: 'Maya Chen',
      assignedAgentInitials: 'MC',
      waitMinutes: 15,
      slaMinutesRemaining: null,
      attentionReason: null,
      aiDraftReply: 'Hi Elena, your 15 additional seats are now active in your Nexus Health workspace.',
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(420),
      updatedAt: minsAgo(180),
      messages: [
        {
          id: 7,
          ticketId: 5,
          senderName: 'Elena Rostova',
          senderType: 'customer',
          body: 'Please add 15 additional seats to our Studio Pro plan starting today.',
          isInternal: false,
          createdAt: minsAgo(420),
        },
        {
          id: 8,
          ticketId: 5,
          senderName: 'Maya Chen',
          senderType: 'agent',
          body: 'All 15 seats have been provisioned and prorated on your current billing cycle.',
          isInternal: false,
          createdAt: minsAgo(180),
        },
      ],
    },
    {
      id: 6,
      refId: 'RD-1043',
      subject: 'Webhook payload missing timestamp attribute',
      description: 'ticket.resolved webhook events are omitting event_ts in ISO-8601 format.',
      customerId: 6,
      customerName: 'Liam Thorne',
      customerInitials: 'LT',
      customerCompany: 'ApexPay',
      category: 'Technical',
      priority: 'Medium',
      status: 'Resolved',
      assignedAgentId: 2,
      assignedAgentName: 'David Vance',
      assignedAgentInitials: 'DV',
      waitMinutes: 20,
      slaMinutesRemaining: null,
      attentionReason: null,
      aiDraftReply: null,
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(510),
      updatedAt: minsAgo(240),
      messages: [],
    },
    {
      id: 7,
      refId: 'RD-1042',
      subject: 'User permissions error when editing knowledge docs',
      description: 'Editor role receives 403 Forbidden when publishing Knowledge Base drafts.',
      customerId: 7,
      customerName: 'Sophia Ramirez',
      customerInitials: 'SR',
      customerCompany: 'CloudStack',
      category: 'Authentication',
      priority: 'Low',
      status: 'Closed',
      assignedAgentId: 1,
      assignedAgentName: 'Maya Chen',
      assignedAgentInitials: 'MC',
      waitMinutes: 10,
      slaMinutesRemaining: null,
      attentionReason: null,
      aiDraftReply: null,
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(700),
      updatedAt: minsAgo(360),
      messages: [],
    },
    {
      id: 8,
      refId: 'RD-1041',
      subject: 'SCIM directory sync failing for Okta group mappings',
      description: 'Okta push groups return 422 invalid externalId after identity provider v2.4 update.',
      customerId: 8,
      customerName: 'Ethan Park',
      customerInitials: 'EP',
      customerCompany: 'Lumina Labs',
      category: 'Authentication',
      priority: 'Urgent',
      status: 'In progress',
      assignedAgentId: 1,
      assignedAgentName: 'Maya Chen',
      assignedAgentInitials: 'MC',
      waitMinutes: 45,
      slaMinutesRemaining: 140,
      attentionReason: null,
      aiDraftReply: null,
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(220),
      updatedAt: minsAgo(55),
      messages: [],
    },
  ];

  // Current counts in explicit (8 tickets):
  // Status: Open=2 (RD-1048, RD-1046), In progress=3 (RD-1047, RD-1045, RD-1041), Resolved=2 (RD-1044, RD-1043), Closed=1 (RD-1042)
  // Priority: Urgent=2, High=2, Medium=2, Low=2
  // Need 48 more tickets to reach:
  // Status: Open=+7 (total 9), In progress=+0 (total 3), Resolved=+41 (total 43), Closed=+0 (total 1)
  // Priority: Urgent=+4 (total 6), High=+12 (total 14), Medium=+20 (total 22), Low=+12 (total 14)

  const subjectsByCategory: Record<TicketCategory, string[]> = {
    Authentication: [
      'Okta v2.4 IdP metadata refresh required',
      'OAuth callback URI mismatch on staging portal',
      'MFA recovery token expired prematurely',
      'Session persistence timeout for SAML users',
      'API bearer token rotation failing in CLI',
      'Role-based access check blocking export view',
    ],
    Billing: [
      'Update VAT tax ID on monthly PDF receipts',
      'Annual enterprise invoice PO number amendment',
      'Prorated seat credit missing on downgrade',
      'ACH direct debit mandate verification pending',
      'Billing contact email transfer request',
      'Usage overage alert threshold adjustment',
    ],
    Technical: [
      'Webhook retry backoff exceeding 30s window',
      'GraphQL cursor pagination skipping last record',
      'Bulk JSON import stalled at 85% validation',
      'Rate limit headers missing on 429 responses',
      'Audit log stream lag in EU-West cluster',
      'Custom SLA rule trigger delay on weekend shifts',
    ],
    Product: [
      'Add keyboard shortcut for internal note toggle',
      'Custom report column ordering not saved',
      'Dark theme contrast on SLA countdown badge',
      'Macro variable interpolation for customer tier',
      'Support CSV export with ISO-8601 timestamps',
      'Saved view sharing across support pods',
    ],
  };

  const categories: TicketCategory[] = ['Authentication', 'Billing', 'Technical', 'Product'];
  const statuses: TicketStatus[] = [
    ...Array(7).fill('Open'),
    ...Array(41).fill('Resolved'),
  ];
  const priorities: TicketPriority[] = [
    ...Array(4).fill('Urgent'),
    ...Array(12).fill('High'),
    ...Array(20).fill('Medium'),
    ...Array(12).fill('Low'),
  ];

  const extra: Ticket[] = [];
  for (let i = 0; i < 48; i++) {
    const refNum = 1040 - i;
    const customer = SEED_CUSTOMERS[i % SEED_CUSTOMERS.length];
    // Ensure at least 2 more Open Authentication tickets in the first few slots to match batch insight!
    const category: TicketCategory = i < 2 ? 'Authentication' : categories[i % categories.length];
    const status = statuses[i];
    const priority = priorities[i];
    const subjectPool = subjectsByCategory[category];
    const subject = subjectPool[i % subjectPool.length];
    const assignedAgent =
      status === 'Open'
        ? null
        : SEED_AGENTS[i % SEED_AGENTS.length];

    const ageMinutes = 400 + i * 115;
    extra.push({
      id: 9 + i,
      refId: `RD-${refNum}`,
      subject,
      description: `${subject} reported by ${customer.name} (${customer.company}).`,
      customerId: customer.id,
      customerName: customer.name,
      customerInitials: customer.initials,
      customerCompany: customer.company,
      category,
      priority,
      status,
      assignedAgentId: assignedAgent?.id ?? null,
      assignedAgentName: assignedAgent?.name ?? null,
      assignedAgentInitials: assignedAgent?.initials ?? null,
      waitMinutes: status === 'Open' ? 35 + i * 12 : 15,
      slaMinutesRemaining: status === 'Open' ? 180 : null,
      attentionReason: null,
      aiDraftReply: null,
      needsAttention: false,
      dismissedFromQueue: false,
      createdAt: minsAgo(ageMinutes),
      updatedAt: minsAgo(Math.max(120, ageMinutes - 60)),
      messages: [],
    });
  }

  return [...explicit, ...extra];
}

export const SEED_TICKETS: Ticket[] = buildRemainingTickets();

export const SEED_ACTIVITY: ActivityLog[] = [
  {
    id: 1,
    actor: 'Maya Chen',
    action: 'replied to RD-1047 (Duplicate charge)',
    ticketRef: 'RD-1047',
    detail: 'Confirmed duplicate Stripe payment intent and drafted refund notice.',
    createdAt: minsAgo(18),
  },
  {
    id: 2,
    actor: 'Olivia Bennett',
    action: 'submitted ticket RD-1048 via Okta SSO',
    ticketRef: 'RD-1048',
    detail: 'Workspace access failure after Okta IdP v2.4 metadata update.',
    createdAt: minsAgo(60),
  },
  {
    id: 3,
    actor: 'Noah Williams',
    action: 'attached invoice PDF to RD-1047',
    ticketRef: 'RD-1047',
    detail: 'Uploaded November statement PDF for duplicate billing review.',
    createdAt: minsAgo(120),
  },
  {
    id: 4,
    actor: 'System',
    action: 'flagged RD-1046 as High priority based on payload errors',
    ticketRef: 'RD-1046',
    detail: 'Automated SLA detector escalated 502 export timeout.',
    createdAt: minsAgo(240),
  },
  {
    id: 5,
    actor: 'Alex Morgan',
    action: 'assigned RD-1045 to David Vance',
    ticketRef: 'RD-1045',
    detail: 'Routed TLS DNS-01 certificate issue to Technical Support.',
    createdAt: minsAgo(300),
  },
];

export const SEED_KB_ARTICLES: KbArticle[] = [
  {
    id: 1,
    title: 'Identity Provider v2.4 SAML Metadata Advisory',
    category: 'Authentication',
    summary: 'Step-by-step resolution for ERR_SAML_AUDIENCE_MISMATCH following the 08:00 UTC IdP v2.4 rollout.',
    content:
      'Following the Identity Provider v2.4 rollout at 08:00 UTC, workspaces utilizing custom Okta or Azure AD SAML certificates must refresh their ACS validation cache and re-upload updated SHA-256 metadata XML under Workspace Settings -> SAML SSO.',
    views: 342,
    updatedAt: minsAgo(45),
  },
  {
    id: 2,
    title: 'Handling Duplicate Invoice Captures & Idempotency Refunds',
    category: 'Billing',
    summary: 'Verification checklist for Stripe double-capture edge cases and 3-5 day settlement SLAs.',
    content:
      'Cross-reference the customer Stripe PaymentIntent ID in Billing Ledger. When two captures share an invoice period within 60 seconds, issue an immediate full refund on the secondary capture and notify the customer using the Billing Reconciliation macro.',
    views: 198,
    updatedAt: minsAgo(180),
  },
  {
    id: 3,
    title: 'Chunked Export Streaming for >128MB Workspaces',
    category: 'Technical',
    summary: 'Preventing HTTP 502 timeouts on nightly scheduled Parquet/CSV exports.',
    content:
      'Large workspaces exporting over 128MB in a single synchronous stream should enable Multi-Part Chunked Export in Workspace Settings -> Data Exports. This splits payloads into 32MB compressed segments with automatic retry.',
    views: 164,
    updatedAt: minsAgo(420),
  },
  {
    id: 4,
    title: 'Studio Pro SLA Targets & Auto-Balancer Rules',
    category: 'Product',
    summary: 'Documentation on Urgent (<30m), High (<4h), and Standard (<12h) response windows.',
    content:
      'ResolveDesk Auto-Balancer distributes incoming Tier-1 tickets across Available agents in round-robin order based on current active ticket load.',
    views: 289,
    updatedAt: minsAgo(720),
  },
];
