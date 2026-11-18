import React from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  LayoutGrid,
  LogIn,
  Settings,
  ShieldCheck,
  Ticket as TicketIcon,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import type { NavSection } from '../types/support';

interface SidebarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  totalTickets: number;
  urgentCount: number;
  workspaceName: string;
  userName: string;
  userRole: string;
  isSignedIn: boolean;
  onOpenRecovery: () => void;
  onSignIn: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeNav,
  onSelectNav,
  totalTickets,
  urgentCount,
  workspaceName,
  userName,
  userRole,
  isSignedIn,
  onOpenRecovery,
  onSignIn,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const workspaceItems: Array<{ id: NavSection; label: string; icon: React.ReactNode; badge?: number; badgeTone?: 'neutral' | 'urgent' }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'all-tickets', label: 'All Tickets', icon: <TicketIcon className="w-4 h-4" />, badge: totalTickets, badgeTone: 'neutral' },
    { id: 'attention-queue', label: 'Attention Queue', icon: <AlertCircle className="w-4 h-4" />, badge: urgentCount, badgeTone: 'urgent' },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'support-team', label: 'Support Team', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const resourceItems: Array<{ id: NavSection; label: string; icon: React.ReactNode }> = [
    { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const userInitials = userName
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const content = (
    <aside className="w-[240px] h-full bg-[#fcfdfc] border-r border-[#dce4de] flex flex-col justify-between select-none shrink-0">
      <div>
        {/* Brand Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1d5344] text-white flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h4l3-7 4 14 3-7h2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-[14.5px] leading-tight text-[#161d19] truncate">
                ResolveDesk
              </div>
              <div className="text-[11px] text-[#5c6962] leading-tight truncate">
                Thoughtfully managed
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-md text-[#5c6962] hover:bg-[#eaf2ed]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={() => onSelectNav('settings')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#eaf2ed]/80 border border-[#dce4de] text-left hover:bg-[#eaf2ed] transition-colors"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#1d5344] shrink-0" />
              <span className="text-[12.5px] font-semibold text-[#161d19] truncate">{workspaceName}</span>
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#5c6962] shrink-0" />
          </button>
        </div>

        {/* Workspace Nav */}
        <div className="px-3 mb-5">
          <div className="px-2 pb-1.5 text-[10.5px] font-semibold tracking-wider text-[#707975] uppercase">
            Workspace
          </div>
          <nav aria-label="Workspace navigation" className="space-y-0.5">
            {workspaceItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#eaf2ed] text-[#1d5344] font-semibold'
                      : 'text-[#404945] hover:bg-[#f2f6f3] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={active ? 'text-[#1d5344]' : 'text-[#5c6962]'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        item.badgeTone === 'urgent' && item.badge > 0
                          ? 'bg-[#fdf2f2] text-[#b54747]'
                          : 'bg-[#eef3ef] text-[#404945]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Resources Nav */}
        <div className="px-3">
          <div className="px-2 pb-1.5 text-[10.5px] font-semibold tracking-wider text-[#707975] uppercase">
            Resources
          </div>
          <nav aria-label="Resources navigation" className="space-y-0.5">
            {resourceItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#eaf2ed] text-[#1d5344] font-semibold'
                      : 'text-[#404945] hover:bg-[#f2f6f3] font-medium'
                  }`}
                >
                  <span className={active ? 'text-[#1d5344]' : 'text-[#5c6962]'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Security Portal */}
      <div className="border-t border-[#dce4de] p-3 space-y-2 bg-[#f8faf8]">
        {!isSignedIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-[#1d5344] text-white text-[12px] font-medium hover:bg-[#154034] transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google</span>
          </button>
        )}
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1d5344] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
              {userInitials || 'AM'}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-[#161d19] truncate">{userName}</div>
              <div className="text-[11px] text-[#5c6962] truncate">{userRole}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRecovery}
            title="Account Security & Password Recovery"
            aria-label="Open Account Security and Password Recovery"
            className="p-1.5 rounded-md text-[#5c6962] hover:bg-[#eaf2ed] hover:text-[#1d5344] transition-colors shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block h-full shrink-0">{content}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#161d19]/30" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
