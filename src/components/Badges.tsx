import React from 'react';
import type { TicketPriority, TicketStatus } from '../types/support';

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    Urgent: 'bg-[#fdf2f2] text-[#b54747] border border-[#b54747]/20',
    High: 'bg-[#fef9ee] text-[#b7791f] border border-[#b7791f]/20',
    Medium: 'bg-[#f1f5f3] text-[#404945] border border-[#dce4de]',
    Low: 'bg-[#f4f7f5] text-[#5c6962] border border-[#dce4de]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded whitespace-nowrap ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    Open: 'bg-[#f5f7f6] text-[#404945] border border-[#dce4de]',
    'In progress': 'bg-[#eaf2ed] text-[#1d5344] border border-[#1d5344]/20',
    Resolved: 'bg-[#dff2e7] text-[#1d5344] border border-[#1d5344]/20',
    Closed: 'bg-[#eef1ef] text-[#5c6962] border border-[#dce4de]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}

export function AvatarChip({
  initials,
  name,
  muted = false,
}: {
  initials?: string | null;
  name?: string | null;
  muted?: boolean;
}) {
  if (!name) {
    return <span className="text-[12px] italic text-[#707975]">Unassigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-semibold shrink-0 ${
          muted
            ? 'bg-[#e8f0e9] text-[#404945]'
            : 'bg-[#1d5344] text-white'
        }`}
      >
        {initials || name.slice(0, 2).toUpperCase()}
      </span>
      <span className="text-[12.5px] text-[#161d19] truncate">{name}</span>
    </span>
  );
}
