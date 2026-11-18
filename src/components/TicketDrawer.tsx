import React, { useState } from 'react';
import { Clock, Send, Sparkles, X } from 'lucide-react';
import type {
  Agent,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../types/support';
import { formatRelativeTime, formatWaitDuration } from '../utils/supportLogic';
import { PriorityBadge, StatusBadge } from './Badges';

interface TicketDrawerProps {
  ticket: Ticket | null;
  agents: Agent[];
  onClose: () => void;
  onUpdateTicket: (
    ticketId: number,
    patch: { status?: TicketStatus; priority?: TicketPriority; assignedAgentId?: number | null }
  ) => void;
  onAddMessage: (ticketId: number, body: string, isInternal: boolean) => void;
}

export function TicketDrawer({
  ticket,
  agents,
  onClose,
  onUpdateTicket,
  onAddMessage,
}: TicketDrawerProps) {
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  if (!ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddMessage(ticket.id, replyText, isInternal);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-[#161d19]/25" onClick={onClose} />
      <aside
        aria-label={`Ticket details for ${ticket.refId}`}
        className="relative z-10 w-full max-w-2xl bg-white border-l border-[#dce4de] h-full flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e9e5] flex items-start justify-between gap-4 bg-[#fcfdfc]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-code text-[12px] font-semibold px-2 py-0.5 rounded bg-[#eaf2ed] text-[#1d5344]">
                {ticket.refId}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticket.slaMinutesRemaining !== null && ticket.slaMinutesRemaining !== undefined && (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-[#b54747] font-medium tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA: {ticket.slaMinutesRemaining}m</span>
                </span>
              )}
            </div>
            <h2 className="font-display text-[18px] font-semibold text-[#161d19] leading-snug">
              {ticket.subject}
            </h2>
            <p className="text-[12px] text-[#5c6962] mt-0.5">
              {ticket.customerName} · {ticket.customerCompany} · {ticket.category} · Waited{' '}
              {formatWaitDuration(ticket.waitMinutes)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket drawer"
            className="p-1.5 rounded-md text-[#5c6962] hover:bg-[#eaf2ed] hover:text-[#161d19]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 border-b border-[#e5e9e5] bg-[#f8faf8] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#5c6962] mb-1">
              Status
            </label>
            <select
              aria-label="Ticket status"
              value={ticket.status}
              onChange={(e) => onUpdateTicket(ticket.id, { status: e.target.value as TicketStatus })}
              className="w-full h-8 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12.5px] text-[#161d19]"
            >
              <option value="Open">Open</option>
              <option value="In progress">In progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#5c6962] mb-1">
              Priority
            </label>
            <select
              aria-label="Ticket priority"
              value={ticket.priority}
              onChange={(e) => onUpdateTicket(ticket.id, { priority: e.target.value as TicketPriority })}
              className="w-full h-8 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12.5px] text-[#161d19]"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#5c6962] mb-1">
              Assigned Agent
            </label>
            <select
              aria-label="Assigned agent"
              value={ticket.assignedAgentId ?? ''}
              onChange={(e) =>
                onUpdateTicket(ticket.id, {
                  assignedAgentId: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full h-8 px-2.5 rounded-md bg-white border border-[#dce4de] text-[12.5px] text-[#161d19]"
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Initial Description */}
          <div className="p-4 rounded-lg bg-[#f8faf8] border border-[#e5e9e5]">
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="font-semibold text-[#161d19]">{ticket.customerName}</span>
              <span className="text-[#707975]">{formatRelativeTime(ticket.createdAt)}</span>
            </div>
            <p className="text-[13px] text-[#404945] leading-relaxed">{ticket.description}</p>
          </div>

          {/* Quiet AI Assistance Draft */}
          {ticket.aiDraftReply && (
            <div className="p-4 rounded-lg bg-white border border-[#dce4de] space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5c6962] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#1d5344]" />
                  <span>Generated Draft</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsInternal(false);
                    setReplyText(ticket.aiDraftReply || '');
                  }}
                  className="px-2.5 py-1 rounded border border-[#dce4de] bg-[#f8faf8] text-[11.5px] font-medium text-[#1d5344] hover:bg-[#eaf2ed]"
                >
                  Insert Draft
                </button>
              </div>
              <p className="text-[12.5px] text-[#404945] leading-relaxed">{ticket.aiDraftReply}</p>
            </div>
          )}

          {/* Thread Messages */}
          {(ticket.messages || []).map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-lg border text-[13px] ${
                msg.isInternal
                  ? 'bg-[#fef9ee] border-[#b7791f]/25'
                  : msg.senderType === 'agent'
                  ? 'bg-[#eaf2ed]/70 border-[#1d5344]/20'
                  : 'bg-white border-[#e5e9e5]'
              }`}
            >
              <div className="flex items-center justify-between text-[11.5px] mb-1">
                <span className="font-semibold text-[#161d19]">
                  {msg.senderName}{' '}
                  {msg.isInternal && (
                    <span className="ml-1.5 text-[10.5px] font-medium text-[#b7791f]">
                      (Internal Note)
                    </span>
                  )}
                </span>
                <span className="text-[#707975]">{formatRelativeTime(msg.createdAt)}</span>
              </div>
              <p className="text-[#404945] leading-relaxed">{msg.body}</p>
            </div>
          ))}
        </div>

        {/* Reply Composer */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#e5e9e5] bg-[#fcfdfc] space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInternal(false)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium ${
                !isInternal
                  ? 'bg-[#1d5344] text-white'
                  : 'bg-[#f2f6f3] text-[#404945]'
              }`}
            >
              Public Reply
            </button>
            <button
              type="button"
              onClick={() => setIsInternal(true)}
              className={`px-2.5 py-1 rounded text-[12px] font-medium ${
                isInternal
                  ? 'bg-[#b7791f] text-white'
                  : 'bg-[#f2f6f3] text-[#404945]'
              }`}
            >
              Internal Note
            </button>
          </div>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isInternal
                ? 'Write an internal note for your support team...'
                : 'Write a thoughtful response to the customer...'
            }
            className="w-full p-3 rounded-md bg-white border border-[#dce4de] text-[13px] text-[#161d19] placeholder:text-[#707975] focus:outline-none focus:border-[#1d5344]"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1d5344] text-white text-[12.5px] font-medium hover:bg-[#154034] disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInternal ? 'Save Note' : 'Send Reply'}</span>
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
