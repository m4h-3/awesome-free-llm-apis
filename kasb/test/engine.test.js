// Kasb Co. engine tests — runs under `node --test` and `deno test`.
import assert from 'node:assert/strict';

const runner =
  typeof globalThis.Deno !== 'undefined' && typeof globalThis.Deno.test === 'function'
    ? globalThis.Deno.test
    : (await import('node:test')).test;

// Isolate tests: no state writes, no network.
// (Deno runs with no permissions — env assignment may throw, hence the guard.)
try {
  globalThis.process = globalThis.process || {};
  globalThis.process.env = globalThis.process.env || {};
  process.env.KASB_NO_PERSIST = '1';
  process.env.KASB_NO_NET = '1';
} catch { /* isolation flags unavailable — engine failures are non-fatal */ }

const { freshState, tick, snapshot } = await import('../lib/engine.js');
const { generateIdea, scoreOpportunity, buildPlan, slugify } = await import('../lib/market.js');
const { AGENTS, onShift, pickAgent } = await import('../lib/agents.js');
const { brainStatus, providerDirectory } = await import('../lib/brain.js');
const { env } = await import('../lib/env.js');

runner('market: generated ideas are well-formed and deduplicated', () => {
  const state = freshState();
  const titles = new Set();
  for (let i = 0; i < 50; i++) {
    const idea = generateIdea(Math.random, state, 'local');
    assert.ok(idea, 'idea generated');
    assert.ok(idea.title.length > 8, 'has a title');
    assert.ok(idea.capitalSar > 0, 'has startup cost');
    assert.ok(idea.potentialDailySar > 0, 'has revenue potential');
    assert.ok(['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO'].includes(idea.countryId));
    assert.equal(idea.status, 'scout');
    assert.ok(!titles.has(idea.title), `unique title: ${idea.title}`);
    titles.add(idea.title);
    state.ideas.push(idea);
  }
});

runner('market: scoring is bounded and fully weighted', () => {
  const state = freshState();
  for (let i = 0; i < 30; i++) {
    const idea = generateIdea(Math.random, state, 'local');
    const score = scoreOpportunity(idea, state);
    assert.ok(score.total >= 0 && score.total <= 100, `score in range: ${score.total}`);
    assert.equal(score.parts.length, 5, 'five components');
    const weightSum = score.parts.reduce((s, p) => s + p.weight, 0);
    assert.ok(Math.abs(weightSum - 1) < 1e-9, 'weights sum to 1');
    assert.ok(score.notes.length >= 3, 'explains itself');
  }
});

runner('market: plan builder produces executable steps and risks', () => {
  const state = freshState();
  const idea = generateIdea(Math.random, state, 'local');
  const plan = buildPlan(idea);
  assert.ok(plan.summary.length > 40, 'has summary');
  assert.ok(plan.steps.length >= 6, 'six steps');
  assert.ok(plan.risks.length >= 3, 'three risks');
  assert.ok(slugify(idea.title).length > 0, 'slug works');
});

runner('workforce: 24/7 coverage — every hour has staff on shift', () => {
  for (let hour = 0; hour < 24; hour++) {
    assert.ok(onShift(hour).length > 0, `hour ${hour} covered`);
  }
  assert.equal(AGENTS.length, 8, 'eight AI employees');
  // Every duty has a qualified agent.
  const duties = ['discover', 'signal-scan', 'score', 'risk-check', 'plan', 'launch', 'operate', 'ledger', 'capital', 'pipeline-boost'];
  for (const duty of duties) {
    const { agent } = pickAgent(duty, 3);
    assert.ok(agent, `duty ${duty} staffed`);
    assert.ok(agent.duties.includes(duty), `${agent.name} qualified for ${duty}`);
  }
});

runner('brain: reports local mode without keys, exposes provider directory', () => {
  const status = brainStatus();
  assert.ok(['local', 'live-llm'].includes(status.mode));
  if (!env('KASB_LLM_API_KEY')) assert.equal(status.mode, 'local');
  const providers = providerDirectory();
  if (providers.length > 0) {
    // (Under a permission-less `deno test`, data.json can't be read — skip deep asserts.)
    assert.ok(providers.length >= 10, 'reads repo data.json');
    assert.ok(providers.some((p) => p.baseUrl), 'providers expose base urls');
  }
});

runner('engine: a full work cycle discovers, scores, plans and launches', async () => {
  const state = freshState();
  for (let i = 0; i < 40; i++) await tick(state);

  assert.ok(state.cycle === 40, 'cycle counter advanced');
  assert.ok(state.stats.discovered > 0, 'scouts found ideas');
  assert.ok(state.stats.scored > 0 || state.stats.rejected > 0, 'analyst scored ideas');
  assert.ok(state.stats.planned > 0, 'strategist wrote plans');
  assert.ok(state.stats.launched > 0, 'operator launched a venture');
  assert.ok(state.ventures.length > 0, 'venture exists');

  const spent = state.ventures.reduce((s, v) => s + v.capitalSar, 0);
  assert.ok(Math.abs(state.treasury.totalSpent - spent) < 1, 'capex booked');

  // Revenue accrual: launched ventures earn over cycles.
  for (let i = 0; i < 20; i++) await tick(state);
  assert.ok(state.treasury.totalEarned > 0, 'company earned money');
  assert.ok(state.treasury.balance > 0, 'treasury stayed solvent');
});

runner('engine: snapshot shape feeds the dashboard', async () => {
  const state = freshState();
  for (let i = 0; i < 25; i++) await tick(state);
  const snap = snapshot(state);

  assert.equal(snap.company.name, 'Kasb Co.');
  assert.ok(snap.company.employeesOnShift.length > 0, 'shift is populated');
  assert.ok(snap.treasury.balance > 0);
  assert.equal(snap.agents.length, 8);
  assert.ok(Array.isArray(snap.events), 'event feed present');
  assert.ok(snap.ideas.counts, 'pipeline counts present');
  assert.ok(snap.brain.mode, 'brain status present');
  // Events reference known agents and carry text.
  for (const ev of snap.events.slice(0, 15)) {
    assert.ok(AGENTS.some((a) => a.id === ev.agentId), 'agent id valid');
    assert.ok(ev.text.length > 5, 'event has content');
  }
});
