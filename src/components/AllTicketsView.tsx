import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Table as TableIcon,
} from 'lucide-react';
import type {
  Agent,
  Ticket,
  TicketCategory,
  TicketFilters,
  TicketPriority,
  TicketStatus,
} from '../types/support';
import {
  computeOverviewMetrics,
  filterTickets,
  sortTickets,
  ticketsToCsv,
} from '../utils/supportLogic';
import { AvatarChip, PriorityBadge, StatusBadge } from './Badges';

interface AllTicketsViewProps {
  workspaceName: string;
  workspaceCode: string;
  tickets: Ticket[];
  agents: Agent[];
  liveRefresh: boolean;
  onToggleLiveRefresh: () => void;
  onOpenNewTicket: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateTicket: (
    ticketId: number,
    patch: { status?: TicketStatus; assignedAgentId?: number | null }
  ) => void;
}

export function AllTicketsView({
  workspaceName,
  workspaceCode,
  tickets,
  agents,
  liveRefresh,
  onToggleLiveRefresh,
  onOpenNewTicket,
  onSelectTicket,
  onUpdateTicket,
}: AllTicketsViewProps) {
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: 'All',
    priority: 'All',
    category: 'All',
    agent: 'All',
  });
  const [sortBy, setSortBy] = useState<'refId' | 'subject' | 'priority' | 'status'>('refId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [layoutMode, setLayoutMode] = useState<'table' | 'compact' | 'board'>('table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showInsight, setShowInsight] = useState(true);

  const metrics = useMemo(() => computeOverviewMetrics(tickets), [tickets]);

  const filtered = useMemo(() => {
    const f = filterTickets(tickets, filters);
    return sortTickets(f, sortBy, sortDir);
  }, [tickets, filters, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageTickets = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const authCorrelatedCount = useMemo(
    () => tickets.filter((t) => t.category === 'Authentication' && t.status === 'Open').length,
    [tickets]
  );

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleExportCsv = () => {
    const csv = ticketsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resolvedesk-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    const pageIds = pageTickets.map((t) => t.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      priority: 'All',
      category: 'All',
      agent: 'All',
    });
    setPage(1);
  };

  return (
    <div className="bg-[#f4fbf4]">
      {/* Operational Status Strip */}
      <div className="bg-white border-b border-[#dce4de] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[#404945]">
        <div className="flex flex-wrap items-center gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1d5344]" />
            <span>
              SLA Health: <strong className="text-[#161d19]">{metrics.slaHealthPercent}%</strong>
            </span>
          </span>
          <span className="text-[#c0c9c3]">·</span>
          <span>
            Avg Response Time: <strong className="text-[#161d19]">{metrics.avgResponseMinutes}m</strong>
          </span>
          <span className="text-[#c0c9c3]">·</span>
          <span>
            Open Backlog: <strong className="text-[#161d19]">{metrics.open + metrics.inProgress} tickets</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono-code text-[11px] text-[#5c6962]">
          <span>WORKSPACE ID: {workspaceCode}</span>
          <span className="text-[#c0c9c3]">|</span>
          <button
            type="button"
            onClick={onToggleLiveRefresh}
            className="hover:text-[#1d5344] transition-colors font-medium"
          >
            LIVE REFRESH: {liveRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-[#1d5344] uppercase mb-1">
              Operational Desk
            </div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-[#161d19]">
              All Tickets
            </h1>
            <p className="text-[13px] text-[#5c6962] mt-0.5 tabular-nums">
              {metrics.total} total tickets across {workspaceName} ·{' '}
              <span className="italic">Customer support, thoughtfully managed.</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewTicket}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New ticket</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              label: 'URGENT ACTION',
              value: metrics.urgentAction,
              tone: 'text-[#b54747]',
              filterStatus: 'Open' as const,
            },
            {
              label: 'IN PROGRESS',
              value: metrics.inProgress,
              tone: 'text-[#161d19]',
              filterStatus: 'In progress' as const,
            },
            {
              label: 'UNASSIGNED',
              value: metrics.unassigned,
              tone: 'text-[#161d19]',
              filterStatus: 'All' as const,
            },
            {
              label: 'RESOLVED TODAY',
              value: metrics.resolvedToday,
              tone: 'text-[#1d5344]',
              filterStatus: 'Resolved' as const,
            },
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => {
                if (card.label === 'UNASSIGNED') {
                  setFilters((f) => ({ ...f, agent: 'Unassigned', status: 'All' }));
                } else {
                  setFilters((f) => ({ ...f, status: card.filterStatus, agent: 'All' }));
                }
                setPage(1);
              }}
              className="bg-white border border-[#dce4de] rounded-xl px-4 py-3.5 text-left hover:border-[#b9c7bd] transition-colors"
            >
              <div className="text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                {card.label}
              </div>
              <div className={`font-display text-[24px] font-semibold tabular-nums mt-1 ${card.tone}`}>
                {card.value}
              </div>
            </button>
          ))}
        </div>

        {/* Filter Bar Card */}
        <div className="bg-white border border-[#dce4de] rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
            <div className="lg:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-[#707975] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, search: e.target.value }));
                  setPage(1);
                }}
                placeholder="Search by subject, customer name, or ticket ref..."
                aria-label="Search tickets"
                className="w-full h-9 pl-8 pr-3 rounded-md bg-[#f8faf8] border border-[#dce4de] text-[12.5px] text-[#161d19] placeholder:text-[#707975] focus:outline-none focus:border-[#1d5344]"
              />
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                aria-label="Filter by status"
                value={filters.status}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, status: e.target.value as 'All' | TicketStatus }));
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12px] text-[#161d19] focus:outline-none focus:border-[#1d5344]"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="In progress">In progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                aria-label="Filter by priority"
                value={filters.priority}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, priority: e.target.value as 'All' | TicketPriority }));
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12px] text-[#161d19] focus:outline-none focus:border-[#1d5344]"
              >
                <option value="All">All priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                aria-label="Filter by category"
                value={filters.category}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, category: e.target.value as 'All' | TicketCategory }));
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12px] text-[#161d19] focus:outline-none focus:border-[#1d5344]"
              >
                <option value="All">All categories</option>
                <option value="Authentication">Authentication</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Product">Product</option>
              </select>

              <select
                aria-label="Filter by assigned agent"
                value={filters.agent}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, agent: e.target.value }));
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12px] text-[#161d19] focus:outline-none focus:border-[#1d5344]"
              >
                <option value="All">All agents</option>
                <option value="Unassigned">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
            <div className="flex items-center gap-3 text-[#5c6962]">
              <span className="tabular-nums">
                Showing{' '}
                <strong className="text-[#161d19]">
                  {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filtered.length)}
                </strong>{' '}
                of <strong className="text-[#161d19]">{filtered.length}</strong> tickets
              </span>
              {(filters.search ||
                filters.status !== 'All' ||
                filters.priority !== 'All' ||
                filters.category !== 'All' ||
                filters.agent !== 'All') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#1d5344] font-medium hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mr-2 px-2.5 py-1 rounded bg-[#eaf2ed] text-[#1d5344] text-[11.5px]">
                  <span className="font-semibold tabular-nums">{selectedIds.length} selected</span>
                  <button
                    type="button"
                    onClick={() => {
                      selectedIds.forEach((id) => onUpdateTicket(id, { status: 'Resolved' }));
                      setSelectedIds([]);
                    }}
                    className="underline font-medium"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}

              <span className="text-[11px] font-semibold tracking-wider text-[#5c6962] uppercase">
                Layout
              </span>
              <div className="inline-flex items-center rounded-md border border-[#dce4de] bg-[#f8faf8] p-0.5">
                <button
                  type="button"
                  onClick={() => setLayoutMode('table')}
                  aria-label="Table layout"
                  className={`p-1.5 rounded ${layoutMode === 'table' ? 'bg-white text-[#1d5344] shadow-xs' : 'text-[#5c6962]'}`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('compact')}
                  aria-label="Compact list layout"
                  className={`p-1.5 rounded ${layoutMode === 'compact' ? 'bg-white text-[#1d5344] shadow-xs' : 'text-[#5c6962]'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('board')}
                  aria-label="Board layout"
                  className={`p-1.5 rounded ${layoutMode === 'board' ? 'bg-white text-[#1d5344] shadow-xs' : 'text-[#5c6962]'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Table / Compact / Board */}
        {layoutMode === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {(['Open', 'In progress', 'Resolved', 'Closed'] as TicketStatus[]).map((statusCol) => {
              const colTickets = filtered.filter((t) => t.status === statusCol).slice(0, 8);
              return (
                <div key={statusCol} className="bg-white border border-[#dce4de] rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#edf1ee]">
                    <span className="text-[12px] font-semibold text-[#161d19]">{statusCol}</span>
                    <span className="text-[11px] font-semibold text-[#5c6962] tabular-nums">
                      {filtered.filter((t) => t.status === statusCol).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {colTickets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTicket(t)}
                        className="w-full text-left p-2.5 rounded-lg bg-[#f8faf8] border border-[#e5e9e5] hover:border-[#1d5344] transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-code text-[11px] text-[#1d5344] font-medium">
                            {t.refId}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <div className="text-[12.5px] font-semibold text-[#161d19] line-clamp-2">
                          {t.subject}
                        </div>
                        <div className="text-[11px] text-[#5c6962] truncate">
                          {t.customerName} · {t.customerCompany}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#dce4de] rounded-xl overflow-hidden">
            {pageTickets.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-[14px] font-medium text-[#161d19]">
                  No tickets match your active filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-1.5 rounded-md bg-[#eaf2ed] text-[#1d5344] text-[12.5px] font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e9e5] bg-[#f8faf8] text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                      <th className="py-3 pl-4 pr-2 w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all visible tickets"
                          checked={
                            pageTickets.length > 0 &&
                            pageTickets.every((t) => selectedIds.includes(t.id))
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-[#c0c9c3] accent-[#1d5344]"
                        />
                      </th>
                      <th className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('refId')}
                          className="inline-flex items-center gap-1 hover:text-[#161d19]"
                        >
                          <span>REF ID</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('subject')}
                          className="inline-flex items-center gap-1 hover:text-[#161d19]"
                        >
                          <span>SUBJECT</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-3">CUSTOMER</th>
                      <th className="py-3 px-3">CATEGORY</th>
                      <th className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('priority')}
                          className="inline-flex items-center gap-1 hover:text-[#161d19]"
                        >
                          <span>PRIORITY</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('status')}
                          className="inline-flex items-center gap-1 hover:text-[#161d19]"
                        >
                          <span>STATUS</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4">ASSIGNED AGENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1ee] text-[13px]">
                    {pageTickets.map((ticket) => {
                      const rowPad = layoutMode === 'compact' ? 'py-2' : 'py-3.5';
                      return (
                        <tr
                          key={ticket.id}
                          className="hover:bg-[#f8faf8] transition-colors group"
                        >
                          <td className={`${rowPad} pl-4 pr-2`}>
                            <input
                              type="checkbox"
                              aria-label={`Select ticket ${ticket.refId}`}
                              checked={selectedIds.includes(ticket.id)}
                              onChange={() => toggleRow(ticket.id)}
                              className="rounded border-[#c0c9c3] accent-[#1d5344]"
                            />
                          </td>
                          <td className={`${rowPad} px-3 whitespace-nowrap`}>
                            <button
                              type="button"
                              onClick={() => onSelectTicket(ticket)}
                              className="font-mono-code text-[11.5px] font-medium px-2 py-1 rounded bg-[#eaf2ed] text-[#1d5344] hover:bg-[#dcebe2]"
                            >
                              {ticket.refId}
                            </button>
                          </td>
                          <td className={`${rowPad} px-3 max-w-[300px]`}>
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectTicket(ticket)}
                                className="font-semibold text-[#161d19] hover:text-[#1d5344] text-left leading-snug"
                              >
                                {ticket.subject}
                              </button>
                              {ticket.slaMinutesRemaining !== null &&
                                ticket.slaMinutesRemaining !== undefined &&
                                ticket.slaMinutesRemaining <= 30 &&
                                ticket.status !== 'Resolved' && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#fdf2f2] border border-[#b54747]/20 text-[10px] font-semibold text-[#b54747] tabular-nums whitespace-nowrap">
                                    BREACH IN {ticket.slaMinutesRemaining}M
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className={`${rowPad} px-3 whitespace-nowrap`}>
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-[#e8f0e9] text-[#404945] text-[10.5px] font-semibold flex items-center justify-center shrink-0">
                                {ticket.customerInitials}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-medium text-[#161d19]">
                                  {ticket.customerName}
                                </div>
                                <div className="text-[11px] text-[#5c6962]">
                                  {ticket.customerCompany}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`${rowPad} px-3 text-[12px] text-[#404945] whitespace-nowrap`}>
                            {ticket.category}
                          </td>
                          <td className={`${rowPad} px-3 whitespace-nowrap`}>
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className={`${rowPad} px-3 whitespace-nowrap`}>
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className={`${rowPad} px-4 whitespace-nowrap`}>
                            <AvatarChip
                              initials={ticket.assignedAgentInitials}
                              name={ticket.assignedAgentName}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#e5e9e5] bg-[#fcfdfc] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#5c6962]">
              <span className="tabular-nums">
                Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} tickets
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-[#dce4de] bg-white text-[#404945] disabled:opacity-40 hover:bg-[#f8faf8]"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 6) }, (_, idx) => idx + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-7 h-7 rounded text-[12px] font-medium tabular-nums ${
                      safePage === num
                        ? 'bg-[#1d5344] text-white'
                        : 'bg-white border border-[#dce4de] text-[#404945] hover:bg-[#f8faf8]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-[#dce4de] bg-white text-[#404945] disabled:opacity-40 hover:bg-[#f8faf8]"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select
                  aria-label="Items per page"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 px-2 rounded border border-[#dce4de] bg-white text-[#161d19] tabular-nums"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Batch Insight Card */}
        {showInsight && authCorrelatedCount > 0 && (
          <div className="bg-white border border-[#dce4de] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-[#eaf2ed] text-[#1d5344] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                  Generated Batch Insight
                </div>
                <p className="text-[13px] text-[#161d19] mt-0.5">
                  {authCorrelatedCount} open authentication tickets correlate with the identity provider v2.4 rollout at 08:00 UTC. Recommended action: publish advisory macro.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowInsight(false)}
                className="px-3 py-1.5 rounded-md bg-[#f2f6f3] text-[12px] font-medium text-[#404945] hover:bg-[#e5ede7] transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters((f) => ({ ...f, category: 'Authentication', status: 'Open' }));
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-md bg-white border border-[#dce4de] text-[12px] font-semibold text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
              >
                View Correlated Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
