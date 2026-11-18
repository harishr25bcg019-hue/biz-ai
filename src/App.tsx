import React, { useEffect, useMemo, useState } from 'react';
import { AccountRecoveryModal } from './components/AccountRecoveryModal';
import { AllTicketsView } from './components/AllTicketsView';
import { AttentionQueueView } from './components/AttentionQueueView';
import { CommandPalette } from './components/CommandPalette';
import { NewTicketModal } from './components/NewTicketModal';
import { OverviewView } from './components/OverviewView';
import {
  CustomersView,
  KnowledgeBaseView,
  ReportsView,
  SettingsView,
  SupportTeamView,
} from './components/SecondaryViews';
import { Sidebar } from './components/Sidebar';
import { TicketDrawer } from './components/TicketDrawer';
import { TopBar } from './components/TopBar';
import { useResolveDeskStore } from './hooks/useResolveDeskStore';
import type { NavSection, Ticket } from './types/support';
import { getAttentionBuckets } from './utils/supportLogic';

export default function App() {
  const store = useResolveDeskStore();
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('view') === 'recovery';
    }
    return false;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const attentionCount = useMemo(
    () => getAttentionBuckets(store.tickets).all.length,
    [store.tickets]
  );

  const selectedTicket: Ticket | null = useMemo(
    () => store.tickets.find((t) => t.id === selectedTicketId) ?? null,
    [store.tickets, selectedTicketId]
  );

  const displayName = store.user?.displayName || store.settings.displayName;
  const userEmail = store.user?.email || store.settings.email;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f4fbf4] text-[#161d19]">
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        totalTickets={store.tickets.length}
        urgentCount={attentionCount}
        workspaceName={store.settings.workspaceName}
        userName={displayName}
        userRole={store.settings.role}
        isSignedIn={Boolean(store.user)}
        onOpenRecovery={() => setRecoveryOpen(true)}
        onSignIn={store.signInWithGoogle}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          workspaceName={store.settings.workspaceName}
          activeNav={activeNav}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenRecovery={() => setRecoveryOpen(true)}
          onSignIn={store.signInWithGoogle}
          onSignOut={store.signOutUser}
          isSignedIn={Boolean(store.user)}
          dbSynced={store.dbSynced}
          userEmail={userEmail}
          activity={store.activity}
        />

        {(store.authError || store.syncError) && (
          <div className="bg-[#fdf2f2] border-b border-[#b54747]/20 px-6 py-2 text-[12px] text-[#b54747]">
            {store.authError || store.syncError}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {activeNav === 'overview' && (
            <OverviewView
              userName={displayName}
              workspaceName={store.settings.workspaceName}
              tickets={store.tickets}
              agents={store.agents}
              activity={store.activity}
              onNavigate={setActiveNav}
              onOpenNewTicket={() => setNewTicketOpen(true)}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onAssignTicket={(ticketId, agentId) =>
                store.updateTicket(ticketId, { assignedAgentId: agentId })
              }
            />
          )}

          {activeNav === 'all-tickets' && (
            <AllTicketsView
              workspaceName={store.settings.workspaceName}
              workspaceCode={store.settings.workspaceCode}
              tickets={store.tickets}
              agents={store.agents}
              liveRefresh={store.liveRefresh}
              onToggleLiveRefresh={() => store.setLiveRefresh((v) => !v)}
              onOpenNewTicket={() => setNewTicketOpen(true)}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onUpdateTicket={(id, patch) => store.updateTicket(id, patch)}
            />
          )}

          {activeNav === 'attention-queue' && (
            <AttentionQueueView
              workspaceName={store.settings.workspaceName}
              tickets={store.tickets}
              agents={store.agents}
              settings={store.settings}
              onAssignTicket={(ticketId, agentId) =>
                store.updateTicket(ticketId, { assignedAgentId: agentId })
              }
              onDismissTickets={(ids) =>
                ids.forEach((id) => store.updateTicket(id, { dismissedFromQueue: true }))
              }
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onToggleAutoBalancer={() =>
                store.updateSettings({
                  autoBalancerEnabled: !store.settings.autoBalancerEnabled,
                })
              }
              onRefreshQueue={store.refreshNow}
            />
          )}

          {activeNav === 'customers' && (
            <CustomersView
              customers={store.customers}
              tickets={store.tickets}
              onAddCustomer={store.addCustomer}
            />
          )}

          {activeNav === 'support-team' && (
            <SupportTeamView
              agents={store.agents}
              tickets={store.tickets}
              onUpdateAgentStatus={store.updateAgentStatus}
            />
          )}

          {activeNav === 'knowledge-base' && (
            <KnowledgeBaseView
              articles={store.kbArticles}
              onAddArticle={store.addKbArticle}
            />
          )}

          {activeNav === 'reports' && <ReportsView tickets={store.tickets} />}

          {activeNav === 'settings' && (
            <SettingsView
              settings={store.settings}
              onSaveSettings={store.updateSettings}
              onOpenRecovery={() => setRecoveryOpen(true)}
            />
          )}
        </main>
      </div>

      <TicketDrawer
        ticket={selectedTicket}
        agents={store.agents}
        onClose={() => setSelectedTicketId(null)}
        onUpdateTicket={(id, patch) => store.updateTicket(id, patch)}
        onAddMessage={(ticketId, body, isInternal) =>
          store.addTicketMessage(ticketId, body, isInternal)
        }
      />

      <NewTicketModal
        open={newTicketOpen}
        agents={store.agents}
        onClose={() => setNewTicketOpen(false)}
        onCreate={(input) => store.createTicket(input)}
      />

      <CommandPalette
        open={commandOpen}
        tickets={store.tickets}
        onClose={() => setCommandOpen(false)}
        onNavigate={setActiveNav}
        onSelectTicket={(t) => setSelectedTicketId(t.id)}
        onOpenNewTicket={() => setNewTicketOpen(true)}
        onOpenRecovery={() => setRecoveryOpen(true)}
      />

      <AccountRecoveryModal
        open={recoveryOpen}
        defaultEmail={userEmail}
        defaultName={displayName}
        onClose={() => setRecoveryOpen(false)}
      />
    </div>
  );
}
