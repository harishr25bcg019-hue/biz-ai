import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import type { ActivityLog, Agent, NavSection, Ticket } from '../types/support';
import {
  computeOverviewMetrics,
  computePriorityDistribution,
  formatRelativeTime,
  formatWaitDuration,
} from '../utils/supportLogic';
import { AvatarChip, PriorityBadge, StatusBadge } from './Badges';

interface OverviewViewProps {
  userName: string;
  workspaceName: string;
  tickets: Ticket[];
  agents: Agent[];
  activity: ActivityLog[];
  onNavigate: (nav: NavSection) => void;
  onOpenNewTicket: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: number, agentId: number) => void;
}

const CHART_SERIES: Record<
  '7d' | '30d' | 'quarter',
  { labels: string[]; created: number[]; resolved: number[] }
> = {
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    created: [8, 11, 14, 12, 18, 15, 17],
    resolved: [6, 8, 12, 11, 14, 16, 15],
  },
  '30d': {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    created: [42, 51, 48, 56],
    resolved: [38, 46, 44, 52],
  },
  quarter: {
    labels: ['Sep', 'Oct', 'Nov'],
    created: [148, 172, 189],
    resolved: [141, 166, 178],
  },
};

export function OverviewView({
  userName,
  workspaceName,
  tickets,
  agents,
  activity,
  onNavigate,
  onOpenNewTicket,
  onSelectTicket,
  onAssignTicket,
}: OverviewViewProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'quarter'>('7d');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [recentFilterOpen, setRecentFilterOpen] = useState<'All' | 'Open' | 'In progress' | 'Resolved'>('All');
  const [assignPickerTicketId, setAssignPickerTicketId] = useState<number | null>(null);

  const firstName = userName.split(' ')[0] || 'Alex';
  const metrics = useMemo(() => computeOverviewMetrics(tickets), [tickets]);
  const priorityBuckets = useMemo(() => computePriorityDistribution(tickets), [tickets]);

  const attentionItems = useMemo(
    () =>
      tickets
        .filter((t) => t.needsAttention && !t.dismissedFromQueue && t.status !== 'Resolved' && t.status !== 'Closed')
        .slice(0, 4),
    [tickets]
  );

  const recentTickets = useMemo(() => {
    const base =
      recentFilterOpen === 'All'
        ? tickets
        : tickets.filter((t) => t.status === recentFilterOpen);
    return base.slice(0, 5);
  }, [tickets, recentFilterOpen]);

  // SVG Line Chart geometry
  const series = CHART_SERIES[timeframe];
  const chartW = 540;
  const chartH = 190;
  const padL = 32;
  const padR = 16;
  const padT = 16;
  const padB = 26;
  const maxVal = Math.max(...series.created, ...series.resolved, 20);
  const yMax = Math.ceil(maxVal / 5) * 5;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const getX = (idx: number) =>
    series.labels.length === 1 ? padL + plotW / 2 : padL + (idx / (series.labels.length - 1)) * plotW;
  const getY = (val: number) => padT + plotH - (val / yMax) * plotH;

  const createdPoints = series.created.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
  const resolvedPoints = series.resolved.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
  const areaPath = `M ${getX(0)},${padT + plotH} L ${series.created
    .map((v, i) => `${getX(i)},${getY(v)}`)
    .join(' L ')} L ${getX(series.created.length - 1)},${padT + plotH} Z`;

  // Donut Chart geometry
  const donutColors: Record<string, string> = {
    Urgent: '#b54747',
    High: '#b7791f',
    Medium: '#3f5048',
    Low: '#7d8a83',
  };
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] sm:text-[28px] font-semibold tracking-tight text-[#161d19]">
            Good morning, {firstName}.
          </h1>
          <p className="text-[13px] text-[#5c6962] mt-0.5">
            Here&apos;s what needs your attention today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('all-tickets')}
            className="px-3.5 py-2 rounded-md bg-white border border-[#dce4de] text-[12.5px] font-medium text-[#161d19] hover:bg-[#f8faf8] transition-colors whitespace-nowrap"
          >
            View tickets
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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'TOTAL TICKETS',
            value: metrics.total,
            desc: `All active & closed records across ${workspaceName}`,
          },
          {
            label: 'OPEN TICKETS',
            value: metrics.open,
            desc: 'Awaiting first response or triaging',
          },
          {
            label: 'IN PROGRESS',
            value: metrics.inProgress,
            desc: 'Currently actively being worked on by staff',
          },
          {
            label: 'RESOLVED TICKETS',
            value: metrics.resolved,
            desc: 'Successfully closed this billing period',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#dce4de] rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="text-[11px] font-semibold tracking-wider text-[#5c6962] uppercase">
              {kpi.label}
            </div>
            <div className="font-display text-[30px] font-semibold text-[#161d19] tabular-nums my-2">
              {kpi.value}
            </div>
            <div className="text-[12px] text-[#5c6962] leading-snug">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Middle Row: Ticket Activity (2/3) + Priority Distribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Ticket Activity Chart */}
        <section className="lg:col-span-8 bg-white border border-[#dce4de] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-5">
              <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
                Ticket activity
              </h2>
              <div className="flex items-center gap-4 text-[12px] text-[#5c6962]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d5344]" />
                  <span>Created</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5c6962]" />
                  <span>Resolved</span>
                </span>
              </div>
            </div>
            <div className="inline-flex items-center p-0.5 rounded-md bg-[#f2f6f3] border border-[#dce4de]">
              {(
                [
                  { id: '7d', label: 'Last 7 days' },
                  { id: '30d', label: 'Last 30 days' },
                  { id: 'quarter', label: 'This quarter' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeframe(tab.id)}
                  className={`px-2.5 py-1 text-[11.5px] font-medium rounded transition-colors whitespace-nowrap ${
                    timeframe === tab.id
                      ? 'bg-white text-[#161d19] shadow-xs border border-[#dce4de]'
                      : 'text-[#5c6962] hover:text-[#161d19]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52 overflow-visible" role="img" aria-label="Ticket activity chart">
              <defs>
                <linearGradient id="rdAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d5344" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1d5344" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padT + plotH * (1 - ratio);
                const label = Math.round(yMax * ratio);
                return (
                  <g key={ratio}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#edf1ee" strokeWidth="1" />
                    <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-[#707975] text-[10px] tabular-nums">
                      {label}
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#rdAreaGrad)" />
              <polyline
                fill="none"
                stroke="#4b5a52"
                strokeWidth="1.75"
                strokeDasharray="4 4"
                points={resolvedPoints}
              />
              <polyline
                fill="none"
                stroke="#1d5344"
                strokeWidth="2.25"
                points={createdPoints}
              />
              {series.labels.map((lbl, idx) => {
                const cx = getX(idx);
                const cyCreated = getY(series.created[idx]);
                const cyResolved = getY(series.resolved[idx]);
                return (
                  <g
                    key={lbl}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    <rect x={cx - 24} y={padT} width={48} height={plotH} fill="transparent" />
                    <circle cx={cx} cy={cyResolved} r={hoveredIdx === idx ? 4.5 : 3} fill="#ffffff" stroke="#4b5a52" strokeWidth="1.75" />
                    <circle cx={cx} cy={cyCreated} r={hoveredIdx === idx ? 5 : 3.5} fill="#1d5344" />
                    <text x={cx} y={chartH - 4} textAnchor="middle" className="fill-[#707975] text-[10.5px]">
                      {lbl}
                    </text>
                  </g>
                );
              })}
            </svg>
            {hoveredIdx !== null && (
              <div className="absolute top-1 right-2 px-2.5 py-1.5 rounded-md bg-[#161d19] text-white text-[11px] tabular-nums pointer-events-none">
                {series.labels[hoveredIdx]}: Created {series.created[hoveredIdx]} · Resolved {series.resolved[hoveredIdx]}
              </div>
            )}
          </div>
        </section>

        {/* Priority Distribution Donut */}
        <section className="lg:col-span-4 bg-white border border-[#dce4de] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
              Priority distribution
            </h2>
            <span className="text-[12px] text-[#5c6962] tabular-nums">{metrics.total} tickets</span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90" role="img" aria-label="Priority distribution donut chart">
                {priorityBuckets.map((bucket) => {
                  const sliceLen = (bucket.count / Math.max(metrics.total, 1)) * circumference;
                  const dashArray = `${Math.max(sliceLen - 2, 0)} ${circumference}`;
                  const dashOffset = -offset;
                  offset += sliceLen;
                  return (
                    <circle
                      key={bucket.priority}
                      cx="65"
                      cy="65"
                      r={radius}
                      fill="transparent"
                      stroke={donutColors[bucket.priority]}
                      strokeWidth="16"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-[22px] font-semibold text-[#161d19] tabular-nums leading-none">
                  {metrics.total}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#5c6962] uppercase mt-1">
                  Total
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {priorityBuckets.map((bucket) => (
              <div
                key={bucket.priority}
                className="flex items-center justify-between px-2.5 py-2 rounded-md bg-[#f8faf8] border border-[#e5e9e5] text-[11.5px]"
              >
                <span className="flex items-center gap-1.5 text-[#404945]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: donutColors[bucket.priority] }}
                  />
                  <span>{bucket.priority}</span>
                </span>
                <span className="tabular-nums font-semibold text-[#161d19]">
                  {bucket.count} <span className="font-normal text-[#5c6962]">({bucket.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lower-Middle Row: Needs Attention (2/3) + Recent Activity (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <section className="lg:col-span-8 bg-white border border-[#dce4de] rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
                Needs attention
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#fdf2f2] text-[#b54747] tabular-nums">
                {attentionItems.length} urgent items
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('attention-queue')}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1d5344] hover:underline whitespace-nowrap"
            >
              <span>Queue details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {attentionItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#5c6962]">
              All urgent items have been triaged. Zero SLA blockers remaining.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e9e5] bg-[#f8faf8] text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                    <th className="py-2.5 px-3">Ticket &amp; Subject</th>
                    <th className="py-2.5 px-2.5">Ref</th>
                    <th className="py-2.5 px-2.5">Priority</th>
                    <th className="py-2.5 px-2.5">Wait Time</th>
                    <th className="py-2.5 px-2.5">Reason</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ee] text-[12.5px]">
                  {attentionItems.map((ticket, rowIdx) => (
                    <tr key={ticket.id} className="hover:bg-[#f8faf8] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#161d19] max-w-[230px]">
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket)}
                          className="text-left hover:text-[#1d5344] truncate block w-full"
                        >
                          {ticket.subject}
                        </button>
                      </td>
                      <td className="py-3 px-2.5 font-mono-code text-[11.5px] text-[#5c6962] whitespace-nowrap">
                        {ticket.refId}
                      </td>
                      <td className="py-3 px-2.5">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="py-3 px-2.5 tabular-nums text-[#404945] whitespace-nowrap">
                        {formatWaitDuration(ticket.waitMinutes)}
                      </td>
                      <td className="py-3 px-2.5 text-[#5c6962]">
                        {ticket.attentionReason || 'SLA watch'}
                      </td>
                      <td className="py-3 px-3 text-right relative whitespace-nowrap">
                        {ticket.assignedAgentName ? (
                          <button
                            type="button"
                            onClick={() => onSelectTicket(ticket)}
                            className="text-[12px] font-semibold text-[#1d5344] hover:underline"
                          >
                            Review reply
                          </button>
                        ) : (
                          <div className="inline-block relative">
                            <button
                              type="button"
                              onClick={() =>
                                setAssignPickerTicketId(
                                  assignPickerTicketId === ticket.id ? null : ticket.id
                                )
                              }
                              className="text-[12px] font-semibold text-[#1d5344] hover:underline"
                            >
                              Assign agent
                            </button>
                            {assignPickerTicketId === ticket.id && (
                              <div
                                className={`absolute right-0 w-48 bg-white border border-[#dce4de] rounded-md shadow-lg p-1.5 z-40 text-left ${
                                  rowIdx >= attentionItems.length - 1 && attentionItems.length > 1
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
                                      setAssignPickerTicketId(null);
                                    }}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] hover:bg-[#eaf2ed] text-[#161d19]"
                                  >
                                    <span>{a.name}</span>
                                    <span className="text-[10.5px] text-[#5c6962] tabular-nums">
                                      {a.activeCount}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-4 bg-white border border-[#dce4de] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
                Recent activity
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-[12px] text-[#5c6962] hover:text-[#161d19]"
              >
                Audit log
              </button>
            </div>
            <ul className="space-y-3.5">
              {activity.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-[12px] leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d5344] mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#404945]">
                      <span className="font-semibold text-[#161d19]">{item.actor}</span>{' '}
                      {item.action}
                    </p>
                    <span className="text-[11px] text-[#707975]">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Bottom Row: Recently Updated Tickets (2/3) + Agent Workload (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <section className="lg:col-span-8 bg-white border border-[#dce4de] rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
              Recently updated tickets
            </h2>
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5c6962]" />
              <select
                aria-label="Filter recently updated tickets by status"
                value={recentFilterOpen}
                onChange={(e) => setRecentFilterOpen(e.target.value as typeof recentFilterOpen)}
                className="text-[12px] text-[#404945] bg-[#f8faf8] border border-[#dce4de] rounded px-2 py-1 focus:outline-none focus:border-[#1d5344]"
              >
                <option value="All">Filter: All</option>
                <option value="Open">Open</option>
                <option value="In progress">In progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e9e5] bg-[#f8faf8] text-[10.5px] font-semibold tracking-wider text-[#5c6962] uppercase">
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ee] text-[12.5px]">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-[#f8faf8] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono-code text-[12px] text-[#161d19] font-medium whitespace-nowrap">
                      {ticket.refId}
                    </td>
                    <td className="py-2.5 px-3 text-[#404945] whitespace-nowrap">
                      {ticket.customerName}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <AvatarChip
                        initials={ticket.assignedAgentInitials}
                        name={ticket.assignedAgentName}
                        muted
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#5c6962] whitespace-nowrap">
                      {formatRelativeTime(ticket.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Agent Workload */}
        <section className="lg:col-span-4 bg-white border border-[#dce4de] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[15px] font-semibold text-[#161d19]">
                Agent workload
              </h2>
              <span className="text-[11.5px] text-[#5c6962]">Active assignment counts</span>
            </div>
            <div className="space-y-4">
              {agents.map((agent) => {
                const pct = Math.min(100, agent.activeCount * 25);
                const assignedRefs = tickets
                  .filter(
                    (t) =>
                      t.assignedAgentName === agent.name &&
                      (t.status === 'Open' || t.status === 'In progress')
                  )
                  .map((t) => t.refId)
                  .slice(0, 3)
                  .join(', ');
                return (
                  <div key={agent.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[#161d19] truncate">
                          {agent.name}
                        </div>
                        <div className="text-[11px] text-[#5c6962] truncate">{agent.role}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-semibold text-[#161d19] tabular-nums">
                          {agent.activeCount > 0 ? `${agent.activeCount} active` : agent.status}
                        </div>
                        <div className="text-[10.5px] text-[#707975] font-mono-code tabular-nums">
                          {agent.activeCount > 0 ? assignedRefs : '0 active'}
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#eaf2ed] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1d5344] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('support-team')}
            className="mt-5 pt-3 border-t border-[#edf1ee] flex items-center justify-between text-[12px] font-medium text-[#404945] hover:text-[#1d5344] transition-colors"
          >
            <span>Manage team assignments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
}
