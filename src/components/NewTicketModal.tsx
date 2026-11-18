import React, { useState } from 'react';
import { X } from 'lucide-react';
import type {
  Agent,
  TicketCategory,
  TicketPriority,
} from '../types/support';

interface NewTicketModalProps {
  open: boolean;
  agents: Agent[];
  onClose: () => void;
  onCreate: (input: {
    subject: string;
    description: string;
    customerName: string;
    customerCompany: string;
    category: TicketCategory;
    priority: TicketPriority;
    assignedAgentId?: number | null;
  }) => void;
}

export function NewTicketModal({ open, agents, onClose, onCreate }: NewTicketModalProps) {
  const [subject, setSubject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Technical');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !customerName.trim()) {
      setError('Subject and customer name are required.');
      return;
    }
    onCreate({
      subject: subject.trim(),
      description: description.trim() || subject.trim(),
      customerName: customerName.trim(),
      customerCompany: customerCompany.trim() || 'Enterprise Account',
      category,
      priority,
      assignedAgentId: assignedAgentId ? Number(assignedAgentId) : null,
    });
    setSubject('');
    setCustomerName('');
    setCustomerCompany('');
    setDescription('');
    setAssignedAgentId('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#161d19]/35" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-ticket-title"
        className="relative z-10 w-full max-w-lg bg-white border border-[#dce4de] rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#e5e9e5] flex items-center justify-between bg-[#fcfdfc]">
          <h2 id="new-ticket-title" className="font-display text-[17px] font-semibold text-[#161d19]">
            Create New Ticket
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-[#5c6962] hover:bg-[#eaf2ed]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px]">
          {error && (
            <div className="px-3 py-2 rounded-md bg-[#fdf2f2] border border-[#b54747]/20 text-[#b54747] text-[12px]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="ticket-subject" className="block font-medium text-[#161d19] mb-1">
              Subject <span className="text-[#b54747]">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., SAML certificate mismatch on SSO login"
              className="w-full h-9 px-3 rounded-md border border-[#dce4de] focus:outline-none focus:border-[#1d5344]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ticket-customer" className="block font-medium text-[#161d19] mb-1">
                Customer Name <span className="text-[#b54747]">*</span>
              </label>
              <input
                id="ticket-customer"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Claire Donovan"
                className="w-full h-9 px-3 rounded-md border border-[#dce4de] focus:outline-none focus:border-[#1d5344]"
              />
            </div>
            <div>
              <label htmlFor="ticket-company" className="block font-medium text-[#161d19] mb-1">
                Company
              </label>
              <input
                id="ticket-company"
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g., Horizon AI"
                className="w-full h-9 px-3 rounded-md border border-[#dce4de] focus:outline-none focus:border-[#1d5344]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="ticket-category" className="block font-medium text-[#161d19] mb-1">
                Category
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full h-9 px-2.5 rounded-md border border-[#dce4de] bg-white"
              >
                <option value="Authentication">Authentication</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Product">Product</option>
              </select>
            </div>
            <div>
              <label htmlFor="ticket-priority" className="block font-medium text-[#161d19] mb-1">
                Priority
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full h-9 px-2.5 rounded-md border border-[#dce4de] bg-white"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="ticket-agent" className="block font-medium text-[#161d19] mb-1">
                Assign To
              </label>
              <select
                id="ticket-agent"
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-md border border-[#dce4de] bg-white"
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

          <div>
            <label htmlFor="ticket-desc" className="block font-medium text-[#161d19] mb-1">
              Details
            </label>
            <textarea
              id="ticket-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include reproduction steps, invoice ref, or error payload..."
              className="w-full p-3 rounded-md border border-[#dce4de] focus:outline-none focus:border-[#1d5344]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-[#dce4de] bg-white text-[#404945] font-medium hover:bg-[#f8faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#1d5344] text-white font-medium hover:bg-[#154034]"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
