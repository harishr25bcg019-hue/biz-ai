import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Clock,
  Download,
  FileEdit,
  RefreshCw,
  Scale,
  ShieldCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import type { Agent, Ticket, WorkspaceSettings } from '../types/support';
import {
  formatWaitDuration,
  getAttentionBuckets,
  sortTickets,
  ticketsToCsv,
} from '../utils/supportLogic';
import { AvatarChip, PriorityBadge } from './Badges';

interface AttentionQueueViewProps {
  workspaceName: string;
  tickets: Ticket[];
  agents: Agent[];
  settings: WorkspaceSettings;
  onAssignTicket: (ticketId: number, agentId: number) => void;
  onDismissTickets: (ticketIds: number[]) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onToggleAutoBalancer: () => void;
  onRefreshQueue: () => void;
}

export function AttentionQueueView({
  workspaceName,
  tickets,
  agents,
  settings,
  onAssignTicket,
  onDismissTickets,
  onSelectTicket,
  onToggleAutoBalancer,
  onRefreshQueue,
}: AttentionQueueViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'breach' | 'unassigned' | 'followups'>('all');
  const [sortMode, setSortMode] = useState<'sla' | 'priority'>('sla');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [focusedTicketId, setFocusedTicketId] = useState<number | null>(null);
  const [assignDropdownId, setAssignDropdownId] = useState<number | null>(null);
  const [diagnosticsMessage, setDiagnosticsMessage] = useState<string | null>(null);

  const buckets = useMemo(() => getAttentionBuckets(tickets), [tickets]);

  const displayedItems = useMemo(() => {
    let base = buckets.all;
    if (activeTab === 'breach') base = buckets.slaBreachUnder1h;
    else if (activeTab === 'unassigned') base = buckets.unassignedOver4h;
    else if (activeTab === 'followups') base = buckets.awaitingStaffOver2h;
    return sortTickets(base, sortMode, sortMode === 'sla' ? 'asc' : 'asc');
  }, [buckets, activeTab, sortMode]);

  const targetTicketForQuickAssign = useMemo(() => {
    if (focusedTicketId) {
      const found = displayedItems.find((t) => t.id === focusedTicketId);
      if (found) return found;
    }
    return displayedItems.find((t) => !t.assignedAgentName) ?? displayedItems[0] ?? null;
  }, [displayedItems, focusedTicketId]);

  const handleBatchAssign = () => {
    const unassigned = buckets.all.filter((t) => !t.assignedAgentName);
    if (unassigned.length === 0 || agents.length === 0) return;
    const available = agents.filter((a) => a.status === 'Available');
    const pool = available.length > 0 ? available : agents;
    unassigned.forEach((ticket, i) => {
      const agent = pool[i % pool.length];
      onAssignTicket(ticket.id, agent.id);
    });
    setDiagnosticsMessage(`Batch assigned ${unassigned.length} ticket(s) across ${pool.length} available staff.`);
  };

  const handleRunDiagnostics = () => {
    onRefreshQueue();
    setDiagnosticsMessage(
      `SLA diagnostics verified: ${buckets.slaBreachUnder1h.length} critical breach risk, ${buckets.unassignedOver4h.length} unassigned > 4h.`
    );
  };

  const handleExportTriage = () => {
    const csv = ticketsToCsv(buckets.all);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attention-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="text-[12px] text-[#5c6962] mb-1">
            {workspaceName} <span className="text-[#c0c9c3]">/</span>{' '}
            <span className="font-semibold text-[#161d19]">Attention Queue</span>
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-[#161d19]">
            Attention Queue
          </h1>
          <p className="text-[13px] text-[#5c6962] mt-0.5">
            Items requiring immediate triage, assignment, or SLA breach prevention across {workspaceName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRunDiagnostics}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5c6962]" />
            <span>Re-run SLA diagnostics</span>
          </button>
          <button
            type="button"
            onClick={handleBatchAssign}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#5c6962]" />
            <span>Batch assign</span>
          </button>
          <button
            type="button"
            onClick={handleExportTriage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#5c6962]" />
            <span>Export triage report</span>
          </button>
        </div>
      </div>

      {diagnosticsMessage && (
        <div className="px-4 py-2.5 rounded-lg bg-[#eaf2ed] border border-[#1d5344]/20 text-[12.5px] text-[#1d5344] flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{diagnosticsMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setDiagnosticsMessage(null)}
            className="text-[11.5px] font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Unassigned > 4h */}
        <div className="bg-white border border-[#dce4de] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
              Unassigned &gt; 4h
            </span>
            <span className="px-2 py-0.5 rounded bg-[#f1f5f3] text-[#404945] text-[11px] font-medium">
              Warning
            </span>
          </div>
          <div className="flex items-center justify-between my-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[28px] font-semibold text-[#161d19] tabular-nums">
                {buckets.unassignedOver4h.length}
              </span>
              <span className="text-[12.5px] text-[#5c6962]">tickets awaiting owner</span>
            </div>
            <UserX className="w-4 h-4 text-[#707975]" />
          </div>
          <div className="px-3 py-1.5 rounded bg-[#f4f7f5] flex items-center justify-between text-[11.5px]">
            <span className="font-mono-code text-[#404945] truncate">
              {buckets.unassignedOver4h.map((t) => t.refId).join(', ') || 'None'}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('unassigned')}
              className="font-semibold text-[#1d5344] hover:underline shrink-0 ml-2"
            >
              View both
            </button>
          </div>
        </div>

        {/* Card 2: SLA Breach in < 1h */}
        <div className="bg-white border border-[#dce4de] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-semibold tracking-wider text-[#b54747] uppercase">
              SLA Breach in &lt; 1h
            </span>
            <span className="px-2 py-0.5 rounded bg-[#fdf2f2] text-[#b54747] text-[11px] font-semibold">
              Critical
            </span>
          </div>
          <div className="flex items-center justify-between my-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[28px] font-semibold text-[#b54747] tabular-nums">
                {buckets.slaBreachUnder1h.length}
              </span>
              <span className="text-[12.5px] text-[#5c6962]">ticket at immediate risk</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-[#b54747]" />
          </div>
          <div className="px-3 py-1.5 rounded bg-[#fdf2f2] flex items-center justify-between text-[11.5px]">
            <span className="font-mono-code text-[#b54747] truncate">
              {buckets.slaBreachUnder1h[0]
                ? `${buckets.slaBreachUnder1h[0].refId} (Breach in ${buckets.slaBreachUnder1h[0].slaMinutesRemaining}m)`
                : 'No immediate risk'}
            </span>
            {buckets.slaBreachUnder1h[0] && (
              <button
                type="button"
                onClick={() => onSelectTicket(buckets.slaBreachUnder1h[0])}
                className="font-semibold text-[#b54747] hover:underline shrink-0 ml-2"
              >
                Triage now
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Awaiting Staff Response > 2h */}
        <div className="bg-white border border-[#dce4de] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
              Awaiting Staff Response &gt; 2h
            </span>
            <span className="px-2 py-0.5 rounded bg-[#f1f5f3] text-[#404945] text-[11px] font-medium">
              Pending
            </span>
          </div>
          <div className="flex items-center justify-between my-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[28px] font-semibold text-[#161d19] tabular-nums">
                {buckets.awaitingStaffOver2h.length}
              </span>
              <span className="text-[12.5px] text-[#5c6962]">customer waiting reply</span>
            </div>
            <Clock className="w-4 h-4 text-[#707975]" />
          </div>
          <div className="px-3 py-1.5 rounded bg-[#f4f7f5] flex items-center justify-between text-[11.5px]">
            <span className="font-mono-code text-[#404945] truncate">
              {buckets.awaitingStaffOver2h[0]
                ? `${buckets.awaitingStaffOver2h[0].refId} (Waited ${formatWaitDuration(
                    buckets.awaitingStaffOver2h[0].waitMinutes
                  )})`
                : 'All replies sent'}
            </span>
            {buckets.awaitingStaffOver2h[0] && (
              <button
                type="button"
                onClick={() => onSelectTicket(buckets.awaitingStaffOver2h[0])}
                className="font-semibold text-[#1d5344] hover:underline shrink-0 ml-2"
              >
                Open draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Split: Triage Queue Table + Right Staff Availability Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Triage Table */}
        <div className="lg:col-span-9 bg-white border border-[#dce4de] rounded-xl overflow-hidden">
          {/* Tabs & Sort */}
          <div className="px-4 py-2.5 border-b border-[#e5e9e5] bg-[#f8faf8] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: `All Needs Attention (${buckets.all.length})` },
                { id: 'breach', label: `Urgent & Breach Risk (${buckets.slaBreachUnder1h.length})` },
                { id: 'unassigned', label: `Unassigned Backlog (${buckets.unassignedOver4h.length})` },
                { id: 'followups', label: `Customer Follow-ups (${buckets.awaitingStaffOver2h.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors whitespace-nowrap tabular-nums ${
                    activeTab === tab.id
                      ? 'bg-white text-[#161d19] border border-[#dce4de] shadow-xs font-semibold'
                      : 'text-[#5c6962] hover:text-[#161d19]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSortMode((s) => (s === 'sla' ? 'priority' : 'sla'))}
              className="inline-flex items-center gap-1.5 text-[12px] text-[#404945] hover:text-[#1d5344]"
            >
              <span className="text-[#5c6962]">Sorted by:</span>
              <span className="font-semibold">
                {sortMode === 'sla' ? 'SLA Proximity' : 'Priority'}
              </span>
              <ArrowDownUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {displayedItems.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#5c6962]">
              No urgent triage items in this filter bucket.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e9e5] bg-[#fcfdfc] text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                    <th className="py-2.5 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all queue items"
                        checked={
                          displayedItems.length > 0 &&
                          displayedItems.every((t) => selectedIds.includes(t.id))
                        }
                        onChange={() => {
                          const ids = displayedItems.map((t) => t.id);
                          const all = ids.every((id) => selectedIds.includes(id));
                          setSelectedIds(all ? [] : ids);
                        }}
                        className="rounded border-[#c0c9c3] accent-[#1d5344]"
                      />
                    </th>
                    <th className="py-2.5 px-3">Ref &amp; Subject</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Urgency Driver</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Handler</th>
                    <th className="py-2.5 px-4 text-right">Suggested Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ee] text-[12.5px]">
                  {displayedItems.map((ticket, rowIdx) => {
                    const isCritical =
                      ticket.slaMinutesRemaining !== null &&
                      ticket.slaMinutesRemaining !== undefined &&
                      ticket.slaMinutesRemaining <= 30;
                    const isFocused = targetTicketForQuickAssign?.id === ticket.id;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => setFocusedTicketId(ticket.id)}
                        className={`transition-colors ${
                          isCritical
                            ? 'bg-[#fdf5f5] hover:bg-[#fbeeee]'
                            : isFocused
                            ? 'bg-[#f4f9f6]'
                            : 'hover:bg-[#f8faf8]'
                        }`}
                      >
                        <td className="py-3.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Select queue ticket ${ticket.refId}`}
                            checked={selectedIds.includes(ticket.id)}
                            onChange={() =>
                              setSelectedIds((prev) =>
                                prev.includes(ticket.id)
                                  ? prev.filter((id) => id !== ticket.id)
                                  : [...prev, ticket.id]
                              )
                            }
                            className="rounded border-[#c0c9c3] accent-[#1d5344]"
                          />
                        </td>
                        <td className="py-3.5 px-3 max-w-[230px]">
                          <div className="flex items-center gap-1.5 font-mono-code text-[11px]">
                            <span className={isCritical ? 'text-[#b54747] font-semibold' : 'text-[#5c6962]'}>
                              {ticket.refId}
                            </span>
                            {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-[#b54747]" />}
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectTicket(ticket)}
                            className="font-semibold text-[#161d19] hover:text-[#1d5344] text-left truncate block w-full mt-0.5"
                          >
                            {ticket.subject}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-[#161d19]">{ticket.customerName}</div>
                          <div className="text-[11px] text-[#5c6962]">{ticket.customerCompany}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          {isCritical ? (
                            <div>
                              <div className="font-semibold text-[#b54747]">
                                SLA breach in {ticket.slaMinutesRemaining}m
                              </div>
                              <div className="text-[11px] text-[#5c6962]">
                                Unassigned for {formatWaitDuration(ticket.waitMinutes)} · {ticket.category}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-[#161d19]">
                                {ticket.assignedAgentName
                                  ? `Customer waiting for ${formatWaitDuration(ticket.waitMinutes)}`
                                  : `Unassigned for ${formatWaitDuration(ticket.waitMinutes)}`}
                              </div>
                              <div className="text-[11px] text-[#5c6962]">
                                {ticket.attentionReason || 'Requires immediate owner'}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {ticket.assignedAgentName ? (
                            <AvatarChip
                              initials={ticket.assignedAgentInitials}
                              name={ticket.assignedAgentName}
                            />
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#f1f5f3] text-[#5c6962] text-[11px] font-medium">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                          {ticket.assignedAgentName ? (
                            <button
                              type="button"
                              onClick={() => onSelectTicket(ticket)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#f2f6f3] border border-[#dce4de] text-[12px] font-medium text-[#161d19] hover:bg-[#eaf2ed]"
                            >
                              <FileEdit className="w-3.5 h-3.5 text-[#1d5344]" />
                              <span>Review draft reply</span>
                            </button>
                          ) : (
                            <div className="inline-block relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignDropdownId(assignDropdownId === ticket.id ? null : ticket.id)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1d5344] text-white text-[12px] font-medium hover:bg-[#154034]"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Assign...</span>
                              </button>
                              {assignDropdownId === ticket.id && (
                                <div
                                  className={`absolute right-0 w-48 bg-white border border-[#dce4de] rounded-md shadow-lg p-1.5 z-40 text-left ${
                                    rowIdx >= displayedItems.length - 1 && displayedItems.length > 1
                                      ? 'bottom-full mb-1'
                                      : 'mt-1'
                                  }`}
                                >
                                  {agents.map((a) => (
                                    <button
                                      key={a.id}
                                      type="button"
                                      onClick={() => {
                                        onAssignTicket(ticket.id, a.id);
                                        setAssignDropdownId(null);
                                      }}
                                      className="w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] hover:bg-[#eaf2ed] text-[#161d19]"
                                    >
                                      <span>{a.name}</span>
                                      <span className="text-[10.5px] text-[#5c6962] tabular-nums">
                                        {a.activeCount} active
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="px-4 py-3 border-t border-[#e5e9e5] bg-[#fcfdfc] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#5c6962]">
            <span className="tabular-nums">
              Showing {displayedItems.length} urgent triage items requiring staff action
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  onDismissTickets(selectedIds);
                  setSelectedIds([]);
                }}
                className="text-[#404945] hover:text-[#161d19] disabled:opacity-40"
              >
                Dismiss selected
              </button>
              <button
                type="button"
                onClick={handleRunDiagnostics}
                className="px-3 py-1.5 rounded-md bg-white border border-[#dce4de] text-[#161d19] font-medium hover:bg-[#f8faf8]"
              >
                Refresh queue
              </button>
            </div>
          </div>
        </div>

        {/* Right Rail: Staff Availability & SLA Targets */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#dce4de] rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[14.5px] font-semibold text-[#161d19]">
                Staff Availability
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#eaf2ed] text-[#1d5344] text-[11px] font-semibold">
                Live
              </span>
            </div>
            <p className="text-[12px] text-[#5c6962] leading-snug">
              Assign unresolved attention tickets directly to team members with free throughput.
              {targetTicketForQuickAssign && (
                <span className="block mt-1 font-mono-code text-[11px] text-[#1d5344]">
                  Target: {targetTicketForQuickAssign.refId}
                </span>
              )}
            </p>

            <div className="space-y-2.5">
              {agents.map((agent) => {
                const isOptimal = agent.activeCount <= 1;
                return (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#f8faf8] border border-[#e5e9e5]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#e8f0e9] text-[#1d5344] text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {agent.initials}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[#161d19] truncate">
                          {agent.name}
                        </div>
                        <div className="text-[11px] text-[#5c6962] truncate tabular-nums">
                          {agent.activeCount} active · {agent.activeCount === 0 ? 'Available' : agent.status}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!targetTicketForQuickAssign}
                      onClick={() => {
                        if (targetTicketForQuickAssign) {
                          onAssignTicket(targetTicketForQuickAssign.id, agent.id);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded text-[11.5px] font-medium whitespace-nowrap shrink-0 transition-colors disabled:opacity-40 ${
                        isOptimal
                          ? 'bg-[#1d5344] text-white hover:bg-[#154034]'
                          : 'bg-white border border-[#dce4de] text-[#161d19] hover:bg-[#eaf2ed]'
                      }`}
                    >
                      {isOptimal ? 'Quick 1-Click' : 'Assign'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Auto-balancer toggle card */}
            <button
              type="button"
              onClick={onToggleAutoBalancer}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                settings.autoBalancerEnabled
                  ? 'bg-[#eaf2ed] border-[#1d5344]/20'
                  : 'bg-[#f8faf8] border-[#dce4de]'
              }`}
            >
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1d5344]">
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Auto-balancer {settings.autoBalancerEnabled ? 'active' : 'paused'}
                </span>
              </div>
              <p className="text-[11px] text-[#404945] mt-1 leading-snug">
                New incoming tier-1 tickets distribute to Sarah Jenkins and James Wilson.
              </p>
            </button>
          </div>

          {/* SLA Targets */}
          <div className="bg-white border border-[#dce4de] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#5c6962] uppercase">
              <span>SLA Targets (Studio Pro)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1d5344]" />
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#404945]">Urgent First Response</span>
                <span className="font-mono-code font-semibold text-[#161d19] tabular-nums">
                  &lt; {settings.urgentSlaMinutes}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#404945]">High Priority Resolution</span>
                <span className="font-mono-code font-semibold text-[#161d19] tabular-nums">
                  &lt; {Math.round(settings.highSlaMinutes / 60)}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#404945]">Standard Response Time</span>
                <span className="font-mono-code font-semibold text-[#161d19] tabular-nums">
                  &lt; {Math.round(settings.standardSlaMinutes / 60)}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
