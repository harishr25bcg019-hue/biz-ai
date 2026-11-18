import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAgentWorkloads,
  computeOverviewMetrics,
  computePriorityDistribution,
  filterTickets,
  formatWaitDuration,
  getAttentionBuckets,
  sortTickets,
  ticketsToCsv,
} from './supportLogic';
import { SEED_AGENTS, SEED_TICKETS } from '../data/seedData';

test('computeOverviewMetrics matches seeded 56-ticket distribution', () => {
  const metrics = computeOverviewMetrics(SEED_TICKETS);
  assert.equal(metrics.total, 56);
  assert.equal(metrics.open, 9);
  assert.equal(metrics.inProgress, 3);
  assert.equal(metrics.resolved, 43);
  assert.equal(metrics.closed, 1);
  assert.equal(metrics.urgentAction, 3);
  assert.equal(metrics.unassigned, 9);
});

test('computePriorityDistribution totals 56 tickets with exact counts', () => {
  const dist = computePriorityDistribution(SEED_TICKETS);
  const byPriority = Object.fromEntries(dist.map((d) => [d.priority, d.count]));
  assert.equal(byPriority.Urgent, 6);
  assert.equal(byPriority.High, 14);
  assert.equal(byPriority.Medium, 22);
  assert.equal(byPriority.Low, 14);
});

test('filterTickets filters by search query, category, priority, and unassigned agent', () => {
  const authUnassigned = filterTickets(SEED_TICKETS, {
    search: 'SSO',
    status: 'Open',
    priority: 'Urgent',
    category: 'Authentication',
    agent: 'Unassigned',
  });
  assert.equal(authUnassigned.length, 1);
  assert.equal(authUnassigned[0].refId, 'RD-1048');
});

test('getAttentionBuckets identifies critical SLA breach and unassigned backlog items', () => {
  const buckets = getAttentionBuckets(SEED_TICKETS);
  assert.equal(buckets.all.length, 3);
  assert.equal(buckets.unassignedOver4h.length, 2);
  assert.equal(buckets.slaBreachUnder1h.length, 1);
  assert.equal(buckets.slaBreachUnder1h[0].refId, 'RD-1048');
  assert.equal(buckets.awaitingStaffOver2h.length, 1);
  assert.equal(buckets.awaitingStaffOver2h[0].refId, 'RD-1047');
});

test('computeAgentWorkloads accurately sums active Open and In progress assignments', () => {
  const workloads = computeAgentWorkloads(SEED_AGENTS, SEED_TICKETS);
  const byName = Object.fromEntries(workloads.map((a) => [a.name, a.activeCount]));
  assert.equal(byName['Maya Chen'], 2);
  assert.equal(byName['David Vance'], 1);
  assert.equal(byName['Sarah Jenkins'], 0);
  assert.equal(byName['James Wilson'], 0);
});

test('sortTickets orders by SLA ascending and formatWaitDuration formats hours/minutes', () => {
  const sorted = sortTickets(SEED_TICKETS.slice(0, 3), 'sla', 'asc');
  assert.equal(sorted[0].refId, 'RD-1048');
  assert.equal(formatWaitDuration(554), '9h 14m');
  assert.equal(formatWaitDuration(45), '45m');
});

test('ticketsToCsv produces valid CSV header and escaped rows', () => {
  const csv = ticketsToCsv(SEED_TICKETS.slice(0, 2));
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[1].includes('RD-1048'));
  assert.ok(lines[1].includes('Unassigned'));
});
