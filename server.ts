import express, { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  addTicketMessageRecord,
  createCustomerRecord,
  createKbArticleRecord,
  createTicketRecord,
  ensureWorkspaceSeeded,
  getOrCreateUser,
  getWorkspaceSnapshot,
  updateAgentStatusRecord,
  updateTicketRecord,
  updateWorkspaceSettingsRecord,
} from './src/db/repository.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Real-time SSE subscriber registry keyed by Firebase Auth UID
const sseClients = new Map<string, Set<Response>>();

function broadcastWorkspaceEvent(uid: string, eventType: string, payload?: unknown) {
  const clients = sseClients.get(uid);
  if (!clients || clients.size === 0) return;
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  for (const res of clients) {
    res.write(`event: workspace\ndata: ${data}\n\n`);
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'resolvedesk' });
});

// Real-time SSE stream for live database updates (secured by Firebase ID token)
app.get('/api/events', requireAuth, (req: AuthRequest, res) => {
  const uid = req.user!.uid;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let set = sseClients.get(uid);
  if (!set) {
    set = new Set();
    sseClients.set(uid, set);
  }
  set.add(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ uid, live: true })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    set?.delete(res);
    if (set && set.size === 0) {
      sseClients.delete(uid);
    }
  });
});

// Bootstrap authenticated user + seed Cloud SQL workspace if first sign-in
app.get('/api/workspace', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || 'user@resolvedesk.app';
    const name = typeof req.user!.name === 'string' ? req.user!.name : 'Alex Morgan';

    await getOrCreateUser(uid, email, name);
    await ensureWorkspaceSeeded(uid);
    const snapshot = await getWorkspaceSnapshot(uid);
    res.json(snapshot);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load workspace';
    res.status(500).json({ error: message });
  }
});

app.post('/api/tickets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const actor = typeof req.user!.name === 'string' ? req.user!.name : req.user!.email || 'Alex Morgan';
    const { subject, description, customerName, customerCompany, category, priority, assignedAgentId } = req.body ?? {};
    if (!subject || !customerName || !category || !priority) {
      return res.status(400).json({ error: 'Missing required ticket fields.' });
    }
    const created = await createTicketRecord(uid, actor, {
      subject: String(subject),
      description: String(description || subject),
      customerName: String(customerName),
      customerCompany: String(customerCompany || 'Enterprise Account'),
      category: String(category),
      priority: String(priority),
      assignedAgentId: assignedAgentId ? Number(assignedAgentId) : null,
    });
    broadcastWorkspaceEvent(uid, 'ticket_created', { id: created.id, refId: created.refId });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/tickets/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const ticketId = Number(req.params.id);
    if (Number.isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID.' });
    }
    const actor = typeof req.user!.name === 'string' ? req.user!.name : req.user!.email || 'Alex Morgan';
    const updated = await updateTicketRecord(uid, ticketId, actor, req.body ?? {});
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    broadcastWorkspaceEvent(uid, 'ticket_updated', { id: updated.id, refId: updated.refId });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket';
    res.status(500).json({ error: message });
  }
});

app.post('/api/tickets/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const ticketId = Number(req.params.id);
    const { body, isInternal } = req.body ?? {};
    if (Number.isNaN(ticketId) || !body || !String(body).trim()) {
      return res.status(400).json({ error: 'Message body is required.' });
    }
    const sender = typeof req.user!.name === 'string' ? req.user!.name : req.user!.email || 'Alex Morgan';
    const message = await addTicketMessageRecord(uid, ticketId, sender, String(body), Boolean(isInternal));
    if (!message) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    broadcastWorkspaceEvent(uid, 'message_added', { ticketId });
    res.status(201).json(message);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to post reply';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/agents/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const agentId = Number(req.params.id);
    const { status } = req.body ?? {};
    if (Number.isNaN(agentId) || !status) {
      return res.status(400).json({ error: 'Valid agent ID and status required.' });
    }
    const updated = await updateAgentStatusRecord(uid, agentId, String(status));
    if (!updated) return res.status(404).json({ error: 'Agent not found.' });
    broadcastWorkspaceEvent(uid, 'agent_updated', { id: updated.id });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update agent';
    res.status(500).json({ error: message });
  }
});

app.post('/api/customers', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { name, company, email, plan } = req.body ?? {};
    if (!name || !company || !email) {
      return res.status(400).json({ error: 'Name, company, and email are required.' });
    }
    const created = await createCustomerRecord(uid, {
      name: String(name),
      company: String(company),
      email: String(email),
      plan: String(plan || 'Studio Pro'),
    });
    broadcastWorkspaceEvent(uid, 'customer_created', { id: created.id });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add customer';
    res.status(500).json({ error: message });
  }
});

app.post('/api/kb', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { title, category, summary, content } = req.body ?? {};
    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required.' });
    }
    const created = await createKbArticleRecord(uid, {
      title: String(title),
      category: String(category),
      summary: String(summary || String(content).slice(0, 120)),
      content: String(content),
    });
    broadcastWorkspaceEvent(uid, 'kb_created', { id: created.id });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish article';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const updated = await updateWorkspaceSettingsRecord(uid, req.body ?? {});
    broadcastWorkspaceEvent(uid, 'settings_updated', {});
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResolveDesk server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
