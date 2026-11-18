import React, { useMemo, useState } from 'react';
import { ArrowRight, Plus, Search, ShieldCheck, X } from 'lucide-react';
import type { NavSection, Ticket } from '../types/support';
import { PriorityBadge } from './Badges';

interface CommandPaletteProps {
  open: boolean;
  tickets: Ticket[];
  onClose: () => void;
  onNavigate: (nav: NavSection) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenNewTicket: () => void;
  onOpenRecovery: () => void;
}

export function CommandPalette({
  open,
  tickets,
  onClose,
  onNavigate,
  onSelectTicket,
  onOpenNewTicket,
  onOpenRecovery,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  const matchingTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets.slice(0, 5);
    return tickets
      .filter((t) =>
        `${t.refId} ${t.subject} ${t.customerName} ${t.customerCompany}`.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [tickets, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-[#161d19]/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick command palette"
        className="relative z-10 w-full max-w-xl bg-white border border-[#dce4de] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#e5e9e5]">
          <Search className="w-4 h-4 text-[#5c6962]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, customers, refs, or jump to view..."
            className="flex-1 text-[13.5px] text-[#161d19] placeholder:text-[#707975] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded text-[#5c6962] hover:bg-[#eaf2ed]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          <div>
            <div className="px-2 pb-1 text-[10.5px] font-semibold tracking-wider text-[#707975] uppercase">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewTicket();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] text-[#161d19] hover:bg-[#eaf2ed] text-left"
              >
                <Plus className="w-3.5 h-3.5 text-[#1d5344]" />
                <span>Create new ticket</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecovery();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] text-[#161d19] hover:bg-[#eaf2ed] text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1d5344]" />
                <span>Account Recovery Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('attention-queue');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-md text-[12.5px] text-[#161d19] hover:bg-[#eaf2ed]"
              >
                <span>Go to Attention Queue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5c6962]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('all-tickets');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-md text-[12.5px] text-[#161d19] hover:bg-[#eaf2ed]"
              >
                <span>Go to All Tickets</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5c6962]" />
              </button>
            </div>
          </div>

          <div>
            <div className="px-2 pb-1 text-[10.5px] font-semibold tracking-wider text-[#707975] uppercase">
              Matching Tickets
            </div>
            <div className="space-y-1">
              {matchingTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTicket(t);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-[#f8faf8] text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-[11px] font-semibold text-[#1d5344]">
                        {t.refId}
                      </span>
                      <span className="text-[12.5px] font-medium text-[#161d19] truncate">
                        {t.subject}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5c6962]">
                      {t.customerName} · {t.customerCompany}
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
