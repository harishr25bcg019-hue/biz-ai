import React, { useMemo, useState } from 'react';
import { BookOpen, Check, Download, KeyRound, Plus, Search, ShieldCheck, Users } from 'lucide-react';
import type {
  Agent,
  AgentStatus,
  Customer,
  KbArticle,
  Ticket,
  TicketCategory,
  WorkspaceSettings,
} from '../types/support';
import { computeOverviewMetrics, ticketsToCsv } from '../utils/supportLogic';

export function CustomersView({
  customers,
  tickets,
  onAddCustomer,
}: {
  customers: Customer[];
  tickets: Ticket[];
  onAddCustomer: (input: { name: string; company: string; email: string; plan: string }) => void;
}) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Studio Pro');

  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [customers, search]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) return;
    onAddCustomer({ name, company, email, plan });
    setName('');
    setCompany('');
    setEmail('');
    setShowAdd(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-[#161d19]">Customers</h1>
          <p className="text-[13px] text-[#5c6962]">
            Organization contacts, subscription tiers, and active ticket volumes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#dce4de] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-[#5c6962] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Clara Chen"
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[12.5px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#5c6962] mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Vanguard Ops"
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[12.5px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#5c6962] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clara@vanguard.io"
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[12.5px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#5c6962] mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full h-9 px-2.5 rounded-md border border-[#dce4de] bg-white text-[12.5px]"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Studio Pro">Studio Pro</option>
              <option value="Growth">Growth</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034]"
          >
            Save Customer
          </button>
        </form>
      )}

      <div className="bg-white border border-[#dce4de] rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-[#e5e9e5] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#707975]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, company, or email..."
            className="flex-1 text-[13px] focus:outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e9e5] bg-[#f8faf8] text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4 text-right">Open Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ee] text-[13px]">
              {filtered.map((c) => {
                const openCount = tickets.filter(
                  (t) =>
                    t.customerName === c.name &&
                    (t.status === 'Open' || t.status === 'In progress')
                ).length;
                return (
                  <tr key={c.id} className="hover:bg-[#f8faf8]">
                    <td className="py-3 px-4 font-medium text-[#161d19] flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#e8f0e9] text-[#1d5344] text-[11px] font-semibold flex items-center justify-center">
                        {c.initials}
                      </span>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#404945]">{c.company}</td>
                    <td className="py-3 px-4 font-mono-code text-[12px] text-[#5c6962]">{c.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#eaf2ed] text-[#1d5344] text-[11px] font-medium">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#161d19]">
                      {openCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SupportTeamView({
  agents,
  tickets,
  onUpdateAgentStatus,
}: {
  agents: Agent[];
  tickets: Ticket[];
  onUpdateAgentStatus: (agentId: number, status: AgentStatus) => void;
}) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-semibold text-[#161d19]">Support Team</h1>
        <p className="text-[13px] text-[#5c6962]">
          Manage agent availability, shift coverage, and active queue assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const assigned = tickets.filter(
            (t) =>
              t.assignedAgentName === agent.name &&
              (t.status === 'Open' || t.status === 'In progress')
          );
          return (
            <div key={agent.id} className="bg-white border border-[#dce4de] rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1d5344] text-white font-semibold text-[13px] flex items-center justify-center">
                    {agent.initials}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[15px] text-[#161d19]">
                      {agent.name}
                    </div>
                    <div className="text-[12px] text-[#5c6962]">
                      {agent.role} · {agent.email}
                    </div>
                  </div>
                </div>
                <select
                  aria-label={`Availability status for ${agent.name}`}
                  value={agent.status}
                  onChange={(e) => onUpdateAgentStatus(agent.id, e.target.value as AgentStatus)}
                  className="h-8 px-2.5 rounded-md border border-[#dce4de] bg-[#f8faf8] text-[12px] font-medium text-[#161d19]"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#edf1ee] flex items-center justify-between text-[12px]">
                <span className="text-[#5c6962]">Active Queue Load</span>
                <span className="font-semibold text-[#161d19] tabular-nums">
                  {assigned.length} active ticket{assigned.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KnowledgeBaseView({
  articles,
  onAddArticle,
}: {
  articles: KbArticle[];
  onAddArticle: (input: {
    title: string;
    category: TicketCategory | 'Security';
    summary: string;
    content: string;
  }) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<KbArticle | null>(articles[0] ?? null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory | 'Security'>('Authentication');
  const [content, setContent] = useState('');

  const filtered = useMemo(
    () =>
      articles.filter((a) =>
        `${a.title} ${a.category} ${a.summary}`.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [articles, search]
  );

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddArticle({
      title,
      category,
      summary: content.slice(0, 120),
      content,
    });
    setTitle('');
    setContent('');
    setCreating(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-[#161d19]">Knowledge Base</h1>
          <p className="text-[13px] text-[#5c6962]">
            Operational runbooks, customer advisories, and reusable reply macros.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish Macro / Article</span>
        </button>
      </div>

      {creating && (
        <form onSubmit={handlePublish} className="bg-white border border-[#dce4de] rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title..."
              className="sm:col-span-2 h-9 px-3 rounded-md border border-[#dce4de] text-[13px]"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory | 'Security')}
              className="h-9 px-2.5 rounded-md border border-[#dce4de] bg-white text-[13px]"
            >
              <option value="Authentication">Authentication</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Product">Product</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the advisory or troubleshooting runbook..."
            className="w-full p-3 rounded-md border border-[#dce4de] text-[13px]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-3 py-1.5 rounded-md border border-[#dce4de] text-[12.5px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium"
            >
              Publish
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white border border-[#dce4de] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-[#e5e9e5] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#707975]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter articles..."
              className="flex-1 text-[12.5px] focus:outline-none"
            />
          </div>
          <div className="divide-y divide-[#edf1ee]">
            {filtered.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => setSelected(art)}
                className={`w-full text-left p-4 hover:bg-[#f8faf8] transition-colors ${
                  selected?.id === art.id ? 'bg-[#eaf2ed]/70' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#5c6962] mb-1">
                  <span className="font-semibold text-[#1d5344]">{art.category}</span>
                  <span className="tabular-nums">{art.views} views</span>
                </div>
                <div className="font-semibold text-[13.5px] text-[#161d19]">{art.title}</div>
                <p className="text-[12px] text-[#5c6962] mt-1 line-clamp-2">{art.summary}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#dce4de] rounded-xl p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[11.5px] text-[#5c6962]">
                <BookOpen className="w-4 h-4 text-[#1d5344]" />
                <span className="font-semibold text-[#1d5344]">{selected.category}</span>
                <span>·</span>
                <span className="tabular-nums">{selected.views} reads</span>
              </div>
              <h2 className="font-display text-[20px] font-semibold text-[#161d19]">
                {selected.title}
              </h2>
              <p className="text-[13.5px] text-[#404945] leading-relaxed whitespace-pre-line">
                {selected.content}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-[#5c6962]">Select an article to read.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportsView({ tickets }: { tickets: Ticket[] }) {
  const metrics = useMemo(() => computeOverviewMetrics(tickets), [tickets]);
  const categories: TicketCategory[] = ['Authentication', 'Billing', 'Technical', 'Product'];

  const handleExport = () => {
    const csv = ticketsToCsv(tickets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolvedesk-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-[#161d19]">Reports &amp; SLA Audit</h1>
          <p className="text-[13px] text-[#5c6962]">
            Resolution throughput, SLA compliance rates, and ticket category distribution.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Full CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dce4de] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5c6962]">
            SLA Compliance
          </div>
          <div className="font-display text-[28px] font-semibold text-[#1d5344] tabular-nums mt-1">
            {metrics.slaHealthPercent}%
          </div>
          <div className="text-[12px] text-[#5c6962] mt-1">Target threshold: 95.0%</div>
        </div>
        <div className="bg-white border border-[#dce4de] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5c6962]">
            Resolution Rate
          </div>
          <div className="font-display text-[28px] font-semibold text-[#161d19] tabular-nums mt-1">
            {Math.round(((metrics.resolved + metrics.closed) / Math.max(metrics.total, 1)) * 100)}%
          </div>
          <div className="text-[12px] text-[#5c6962] mt-1">
            {metrics.resolved + metrics.closed} of {metrics.total} tickets closed
          </div>
        </div>
        <div className="bg-white border border-[#dce4de] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5c6962]">
            Median First Response
          </div>
          <div className="font-display text-[28px] font-semibold text-[#161d19] tabular-nums mt-1">
            {metrics.avgResponseMinutes}m
          </div>
          <div className="text-[12px] text-[#5c6962] mt-1">Across Studio Pro SLA tiers</div>
        </div>
      </div>

      <div className="bg-white border border-[#dce4de] rounded-xl p-5 space-y-4">
        <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
          Volume by Category
        </h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = tickets.filter((t) => t.category === cat).length;
            const pct = Math.round((count / Math.max(tickets.length, 1)) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-medium text-[#161d19]">{cat}</span>
                  <span className="tabular-nums text-[#5c6962]">
                    {count} tickets ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#eaf2ed] overflow-hidden">
                  <div className="h-full bg-[#1d5344] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SettingsView({
  settings,
  onSaveSettings,
  onOpenRecovery,
}: {
  settings: WorkspaceSettings;
  onSaveSettings: (patch: Partial<WorkspaceSettings>) => void;
  onOpenRecovery: () => void;
}) {
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [urgentSla, setUrgentSla] = useState(settings.urgentSlaMinutes);
  const [highSla, setHighSla] = useState(settings.highSlaMinutes);
  const [autoBalancer, setAutoBalancer] = useState(settings.autoBalancerEnabled);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      workspaceName,
      urgentSlaMinutes: urgentSla,
      highSlaMinutes: highSla,
      autoBalancerEnabled: autoBalancer,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-semibold text-[#161d19]">Workspace Settings</h1>
        <p className="text-[13px] text-[#5c6962]">
          Configure SLA target thresholds, auto-balancing rules, and account security controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#dce4de] rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#161d19] mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#161d19] mb-1">
              Workspace ID
            </label>
            <input
              type="text"
              disabled
              value={settings.workspaceCode}
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] bg-[#f8faf8] font-mono-code text-[12.5px] text-[#5c6962]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#161d19] mb-1">
              Urgent First Response SLA (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={urgentSla}
              onChange={(e) => setUrgentSla(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[13px] tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#161d19] mb-1">
              High Priority Resolution SLA (minutes)
            </label>
            <input
              type="number"
              min={30}
              max={1440}
              value={highSla}
              onChange={(e) => setHighSla(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] text-[13px] tabular-nums"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-[13px] text-[#161d19] cursor-pointer">
          <input
            type="checkbox"
            checked={autoBalancer}
            onChange={(e) => setAutoBalancer(e.target.checked)}
            className="rounded accent-[#1d5344]"
          />
          <span>Enable automatic round-robin ticket distribution for Available Tier-1 agents</span>
        </label>

        <div className="flex items-center justify-between pt-3 border-t border-[#edf1ee]">
          {savedToast ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#1d5344] font-medium">
              <Check className="w-4 h-4" />
              <span>Settings saved</span>
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034]"
          >
            Save Configuration
          </button>
        </div>
      </form>

      {/* Account Recovery & Zero-Trust Security Card */}
      <div className="bg-white border border-[#dce4de] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#eaf2ed] text-[#1d5344] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
              Zero-Trust Account Recovery &amp; Password Policy
            </h2>
            <p className="text-[12.5px] text-[#5c6962] mt-0.5">
              Verify 6-digit MFA recovery codes and rotate enterprise credentials with multi-role session revocation.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenRecovery}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#dce4de] bg-[#f8faf8] text-[12.5px] font-semibold text-[#161d19] hover:bg-[#eaf2ed] whitespace-nowrap shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#1d5344]" />
          <span>Open Recovery Portal</span>
        </button>
      </div>
    </div>
  );
}
