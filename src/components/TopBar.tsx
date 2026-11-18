import React, { useState } from 'react';
import {
  Bell,
  HelpCircle,
  KeyRound,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
} from 'lucide-react';
import type { ActivityLog, NavSection } from '../types/support';
import { formatRelativeTime } from '../utils/supportLogic';

interface TopBarProps {
  workspaceName: string;
  activeNav: NavSection;
  onOpenCommandPalette: () => void;
  onOpenMobileNav: () => void;
  onOpenRecovery: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isSignedIn: boolean;
  dbSynced: boolean;
  userEmail: string;
  activity: ActivityLog[];
}

const SECTION_TITLES: Record<NavSection, string> = {
  overview: 'Overview',
  'all-tickets': 'All Tickets',
  'attention-queue': 'Attention Queue',
  customers: 'Customers',
  'support-team': 'Support Team',
  'knowledge-base': 'Knowledge Base',
  reports: 'Reports',
  settings: 'Settings',
};

export function TopBar({
  workspaceName,
  activeNav,
  onOpenCommandPalette,
  onOpenMobileNav,
  onOpenRecovery,
  onSignIn,
  onSignOut,
  isSignedIn,
  dbSynced,
  userEmail,
  activity,
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#dce4de] px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 relative z-30">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-md text-[#404945] hover:bg-[#eaf2ed]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-[13px] whitespace-nowrap truncate">
          <span className="text-[#5c6962] font-medium">{workspaceName}</span>
          <span className="text-[#c0c9c3]">/</span>
          <span className="font-semibold text-[#161d19]">{SECTION_TITLES[activeNav]}</span>
        </div>
      </div>

      {/* Right: Search + Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center justify-between w-64 md:w-80 h-9 px-3 rounded-md bg-[#f5f8f6] border border-[#dce4de] text-[12.5px] text-[#5c6962] hover:border-[#b9c7bd] transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#707975] shrink-0" />
            <span className="truncate">Search tickets, customers, or refs...</span>
          </span>
          <kbd className="font-mono-code text-[10.5px] bg-[#eaf2ed] text-[#404945] px-1.5 py-0.5 rounded border border-[#dce4de] shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowGuide(false);
              setShowProfileMenu(false);
            }}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-md flex items-center justify-center text-[#404945] hover:bg-[#eaf2ed] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#b54747]" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#dce4de] rounded-lg shadow-lg p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5e9e5]">
                <span className="text-[12.5px] font-semibold text-[#161d19]">Recent Alerts</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-[#5c6962] hover:text-[#161d19]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="text-[12px] leading-snug">
                    <span className="font-semibold text-[#161d19]">{item.actor}</span>{' '}
                    <span className="text-[#404945]">{item.action}</span>
                    <div className="text-[11px] text-[#707975] mt-0.5">{formatRelativeTime(item.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guide */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowGuide((v) => !v);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md text-[12.5px] font-medium text-[#404945] hover:bg-[#eaf2ed] transition-colors whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-[#5c6962]" />
            <span>Guide</span>
          </button>
          {showGuide && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#dce4de] rounded-lg shadow-lg p-3.5 z-50 text-[12px] text-[#404945] space-y-2">
              <div className="font-semibold text-[#161d19]">ResolveDesk Quick Guide</div>
              <p>Press <kbd className="font-mono-code px-1 py-0.5 bg-[#eaf2ed] rounded">⌘K</kbd> anytime to search tickets or jump between views.</p>
              <p>Use <strong>Attention Queue</strong> for 1-click assignment on SLA-risk tickets.</p>
              <p>Sign in with Google to persist workspace updates to Cloud SQL in real time.</p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full mt-1 py-1.5 rounded bg-[#eaf2ed] text-[#1d5344] font-medium"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        {/* Account Avatar Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((v) => !v);
              setShowNotifications(false);
              setShowGuide(false);
            }}
            aria-label="Account menu"
            className="w-9 h-9 rounded-full bg-[#1d5344] text-white flex items-center justify-center hover:bg-[#154034] transition-colors"
          >
            <UserIcon className="w-4 h-4" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#dce4de] rounded-lg shadow-lg p-2 z-50">
              <div className="px-2.5 py-2 border-b border-[#e5e9e5] mb-1">
                <div className="text-[12.5px] font-semibold text-[#161d19] truncate">{userEmail}</div>
                <div className="text-[11px] text-[#5c6962] mt-0.5">
                  {dbSynced ? 'Cloud SQL Synced · Real-time SSE' : 'Workspace Preview Mode'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenRecovery();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12.5px] text-[#161d19] hover:bg-[#eaf2ed] text-left"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#1d5344]" />
                <span>Account Recovery & Security</span>
              </button>
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12.5px] text-[#b54747] hover:bg-[#fdf2f2] text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignIn();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12.5px] text-[#1d5344] font-medium hover:bg-[#eaf2ed] text-left"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
