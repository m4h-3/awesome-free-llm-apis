// Kasb Co. — the operating engine.
// Every cycle, an employee on shift picks up the most valuable duty in the
// pipeline: discover → score → risk-check → plan → launch → operate → book.
// Revenue from launched ventures accrues into the treasury each cycle, so
// the company compounds while nobody watches.

import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS, pickAgent, onShift, agentById } from './agents.js';
import { env } from './env.js';
import { generateIdea, scoreOpportunity, buildPlan, slugify, COUNTRIES, SECTORS, PLAYBOOKS } from './market.js';
import { ask, brainStatus } from './brain.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = path.join(HERE, '..', '.state');
const STATE_PATH = path.join(STATE_DIR, 'company.json');
const DELIVERABLES_DIR = path.join(HERE, '..', 'deliverables');

const MAX_EVENTS = 400;
const MAX_ACTIVE_IDEAS = 10;
const MAX_VENTURES = 10;
const LAUNCH_RESERVE_SAR = 50_000;
const START_TREASURY_SAR = 500_000;

function freshState() {
  return {
    version: 1,
    createdAt: Date.now(),
    cycle: 0,
    treasury: {
      balance: START_TREASURY_SAR,
      startBalance: START_TREASURY_SAR,
      totalEarned: 0,
      totalSpent: 0,
      heldForCapital: 0,
    },
    ideas: [],
    ventures: [],
    events: [],
    stats: { discovered: 0, scored: 0, rejected: 0, riskFailed: 0, planned: 0, launched: 0, closed: 0, earnedByVenture: {} },
    lastSaveCycle: 0,
  };
}

function loadState() {
  try {
    if (existsSync(STATE_PATH)) {
      const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
      if (parsed && parsed.version === 1) return parsed;
    }
  } catch {
    /* corrupted state — start fresh rather than die */
  }
  return freshState();
}

function saveState(state) {
  if (env('KASB_NO_PERSIST') === '1') return; // tests & dry runs
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    const tmp = `${STATE_PATH}.tmp`;
    writeFileSync(tmp, JSON.stringify(state, null, 2));
    // Atomic-ish swap: write temp first, then rename into place.
    renameSync(tmp, STATE_PATH);
  } catch {
    /* never let persistence crash the work cycle */
  }
}

let EVENT_SEQ = 0;

function logEvent(state, agentId, duty, text, tone = 'info') {
  state.events.push({
    id: `ev-${state.cycle}-${EVENT_SEQ++}`,
    cycle: state.cycle,
    ts: Date.now(),
    hour: new Date().getHours(),
    agentId,
    duty,
    text,
    tone,
  });
  if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
}

function activeIdeas(state) {
  return state.ideas.filter((i) => i.status !== 'launched' && i.status !== 'rejected');
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

// --- Local-brain phrasing ---------------------------------------------------

const DISCOVERY_LINES = [
  (o) => `${o.flag} Found gap: ${o.angle} in ${o.country} — “${o.title}”`,
  (o) => `${o.flag} New lead for ${o.playbook.toLowerCase()} play: ${o.title}`,
  (o) => `${o.flag} Demand signal “${o.signal}” → pitch: ${o.title}`,
];
const SCORE_PASS = (o, s) => `Scored “${o.title}” at ${s.total}/100 — ${s.total >= 60 ? 'advancing to compliance' : 'below the bar, shelving'}`;
const SCORE_FAIL = (o, s) => `Rejected “${o.title}” (${s.total}/100). ${s.notes.find((n) => n.startsWith('⚠')) || 'Weak unit economics for our markets.'}`;
const RISK_PASS = (o) => `Cleared “${o.title}”: licensing path confirmed for ${o.country} (PDPL/data residency noted)`;
const RISK_FAIL = (o) => `Blocked “${o.title}” — needs a local licence partner in ${o.country}; reworked as referral model`;
const PLAN_DONE = (o) => `Published 90-day plan for “${o.title}” → deliverables/${slugify(o.title)}.md`;
const LAUNCH = (o) => `Deployed SAR ${fmt(o.capitalSar)} → launched “${o.title}” (${o.country})`;
const HOLD = (o) => `“${o.title}” queued: treasury below launch threshold, waiting for yield to compound`;

// --- LLM-backed duties (best effort, local fallback always available) -------

async function llmDiscover(state) {
  const { agent } = pickAgent('discover', new Date().getHours());
  const used = state.ideas.map((i) => i.title).join('; ');
  const prompt =
    'Propose ONE concrete, currently-valid money-making opportunity in the Middle East as JSON: ' +
    '{"title": str, "countryId": "SA|AE|QA|KW|BH|OM|EG|JO", "sectorId": from our list, ' +
    '"playbookId": "agency|saas|marketplace|d2c|content|service|trade|ops", "angle": str, "why_now": str}. ' +
    `Sectors: ${SECTORS.map((s) => s.id).join(',')}. Avoid these already-known ideas: ${used.slice(0, 500)}`;
  const raw = await ask(agent, prompt, { json: true });
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?|```$/gm, '').trim());
    const country = COUNTRIES.find((c) => c.id === parsed.countryId);
    const sector = SECTORS.find((s) => s.id === parsed.sectorId);
    const playbook = PLAYBOOKS.find((p) => p.id === parsed.playbookId);
    if (!country || !sector || !playbook || !parsed.title) return null;
    const idea = generateIdea(Math.random, { ...state, signalBoosts: state.signalBoosts || {} }, 'llm');
    if (!idea) return null;
    Object.assign(idea, {
      title: String(parsed.title).slice(0, 140),
      country: country.name, countryId: country.id, flag: country.flag,
      sector: sector.name, sectorId: sector.id, sectorIcon: sector.icon,
      playbook: playbook.name, playbookId: playbook.id, playbookIcon: playbook.icon,
      angle: String(parsed.angle || idea.angle).slice(0, 120),
      description: String(parsed.why_now || idea.description).slice(0, 400) + ` — proposed by ${agent.name} (live LLM).`,
      source: 'llm',
    });
    return idea;
  } catch {
    return null;
  }
}

async function llmPlan(opp) {
  const { agent } = pickAgent('plan', new Date().getHours());
  const raw = await ask(agent,
    `Write the 90-day execution plan for this venture as JSON {"summary": str, "steps": [6 strings], "risks": [3 strings]}: ` +
    `${opp.title} | ${opp.country} | ${opp.playbook} | capital SAR ${opp.capitalSar} | potential SAR ${opp.potentialDailySar}/day`,
    { json: true });
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.replace(/^```(?:json)?|```$/gm, '').trim());
    if (!parsed.summary || !Array.isArray(parsed.steps) || parsed.steps.length < 3) return null;
    return {
      summary: String(parsed.summary).slice(0, 600),
      steps: parsed.steps.slice(0, 8).map(String),
      risks: (Array.isArray(parsed.risks) ? parsed.risks : []).slice(0, 5).map(String),
      builtAt: Date.now(),
      source: 'llm',
    };
  } catch {
    return null;
  }
}

// --- Duties -----------------------------------------------------------------

async function dutyDiscover(state) {
  if (activeIdeas(state).length >= MAX_ACTIVE_IDEAS) return false;
  let idea = await llmDiscover(state);
  if (!idea) idea = generateIdea(Math.random, state, brainStatus().mode === 'live-llm' ? 'llm-fallback' : 'local');
  if (!idea) return false;
  state.ideas.push(idea);
  state.stats.discovered++;
  const { agent, onShift: shifted } = pickAgent('discover', new Date().getHours());
  const line = DISCOVERY_LINES[Math.floor(Math.random() * DISCOVERY_LINES.length)](idea);
  logEvent(state, agent.id, 'discover', `${line}${shifted ? '' : ' [off-shift crunch]'}`, 'discover');
  return true;
}

function dutyScore(state) {
  const idea = state.ideas.find((i) => i.status === 'scout');
  if (!idea) return false;
  const score = scoreOpportunity(idea, state);
  idea.score = score;
  idea.updatedAt = Date.now();
  const { agent, onShift: shifted } = pickAgent('score', new Date().getHours());
  if (score.total >= 60) {
    idea.status = 'scored';
    state.stats.scored++;
    logEvent(state, agent.id, 'score', SCORE_PASS(idea, score) + (shifted ? '' : ' [off-shift crunch]'), 'score');
  } else {
    idea.status = 'rejected';
    state.stats.rejected++;
    logEvent(state, agent.id, 'score', SCORE_FAIL(idea, score), 'reject');
  }
  return true;
}

async function dutyRiskCheck(state) {
  const idea = state.ideas.find((i) => i.status === 'scored');
  if (!idea) return false;
  const { agent, onShift: shifted } = pickAgent('risk-check', new Date().getHours());
  // Light LLM consult when live: compliance verdict in one line.
  const verdict = await ask(agent, `Verdict for this venture (PASS or BLOCK + one-line reason): ${idea.title} | ${idea.country} | ${idea.playbook}`);
  const blocked = verdict ? /^\s*block/i.test(verdict) : Math.random() < 0.15;
  if (blocked) {
    // Second chance: compliance rework (agent converts block into a fix and re-queues once).
    if (!idea.reworked) {
      idea.reworked = true;
      idea.status = 'scored';
      logEvent(state, agent.id, 'risk-check', RISK_FAIL(idea) + (shifted ? '' : ' [off-shift crunch]'), 'risk');
    } else {
      idea.status = 'rejected';
      state.stats.riskFailed++;
      logEvent(state, agent.id, 'risk-check', `Compliance still unsatisfied on “${idea.title}” — shut down.`, 'reject');
    }
  } else {
    idea.status = 'cleared';
    logEvent(state, agent.id, 'risk-check', RISK_PASS(idea) + (shifted ? '' : ' [off-shift crunch]'), 'risk');
  }
  return true;
}

async function dutyPlan(state) {
  const idea = state.ideas.find((i) => i.status === 'cleared');
  if (!idea) return false;
  let plan = await llmPlan(idea);
  if (!plan) plan = buildPlan(idea);
  idea.plan = plan;
  idea.status = 'planned';
  idea.updatedAt = Date.now();
  state.stats.planned++;
  const { agent } = pickAgent('plan', new Date().getHours());
  // Real artifact on disk: the plan file is inventory the company can sell/execute.
  try {
    mkdirSync(DELIVERABLES_DIR, { recursive: true });
    const file = path.join(DELIVERABLES_DIR, `${slugify(idea.title)}.md`);
    const md = [
      `# ${idea.title}`,
      '',
      `**Market:** ${idea.flag} ${idea.country} · **Sector:** ${idea.sectorIcon} ${idea.sector} · **Playbook:** ${idea.playbook}`,
      `**Signal:** ${idea.signal}`,
      `**Capital required:** SAR ${fmt(idea.capitalSar)} · **Potential:** SAR ${fmt(idea.potentialDailySar)}/day · **Score:** ${idea.score?.total ?? '—'}/100`,
      `**Prepared by:** ${agent.name} (${agent.role}) — cycle ${state.cycle}`,
      '',
      '## Summary',
      plan.summary,
      '',
      '## 90-day execution steps',
      ...plan.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      '## Risks & controls',
      ...plan.risks.map((r) => `- ${r}`),
      '',
      '---',
      '_Generated autonomously by Kasb Co. Review before real-world execution._',
      '',
    ].join('\n');
    writeFileSync(file, md);
  } catch { /* disk issues must not stall the pipeline */ }
  logEvent(state, agent.id, 'plan', PLAN_DONE(idea), 'plan');
  return true;
}

function dutyLaunch(state) {
  const idea = state.ideas
    .filter((i) => i.status === 'planned')
    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
    .find((i) => i.capitalSar + LAUNCH_RESERVE_SAR <= state.treasury.balance && state.ventures.filter((v) => v.status === 'live').length < MAX_VENTURES);

  if (!idea) {
    const waiting = state.ideas.find((i) => i.status === 'planned');
    if (waiting && Math.random() < 0.35) {
      state.treasury.heldForCapital++;
      logEvent(state, 'noura', 'capital', HOLD(waiting), 'hold');
    }
    return false;
  }

  const { agent } = pickAgent('launch', new Date().getHours());
  state.treasury.balance -= idea.capitalSar;
  state.treasury.totalSpent += idea.capitalSar;
  idea.status = 'launched';
  idea.launchedAt = Date.now();

  // Realistic ramp: launch revenue is a fraction of theoretical potential.
  const conversion = 0.25 + Math.random() * 0.45;
  const venture = {
    id: `vt-${state.cycle}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    ideaId: idea.id,
    title: idea.title,
    flag: idea.flag,
    country: idea.country,
    sectorIcon: idea.sectorIcon,
    playbook: idea.playbook,
    score: idea.score?.total ?? 0,
    capitalSar: idea.capitalSar,
    baseDailySar: Math.max(10, Math.round(idea.potentialDailySar * conversion)),
    multiplier: 1,
    status: 'live',
    dailySar: 0,
    totalEarned: 0,
    cyclesLive: 0,
    launchedAt: Date.now(),
  };
  venture.dailySar = Math.round(venture.baseDailySar * venture.multiplier);
  state.ventures.push(venture);
  state.stats.launched++;
  logEvent(state, agent.id, 'launch', LAUNCH(idea), 'launch');
  logEvent(state, 'noura', 'ledger', `Booked capex SAR ${fmt(idea.capitalSar)} — runway SAR ${fmt(state.treasury.balance)}`, 'ledger');
  return true;
}

function dutyOperate(state) {
  const live = state.ventures.filter((v) => v.status === 'live');
  if (!live.length) return false;

  let earned = 0;
  const closings = [];

  for (const v of live) {
    v.cyclesLive++;
    // Drift: mild upward bias, occasional setbacks.
    const drift = (Math.random() - 0.42) * 0.10;
    v.multiplier = Math.max(0.05, Math.min(1.9, v.multiplier * (1 + drift)));

    // Growth plays from Yousef/Zahra every so often.
    if (v.cyclesLive % 7 === Math.floor(Math.random() * 7) && v.multiplier < 1.8) {
      const boost = 0.06 + Math.random() * 0.16;
      v.multiplier = Math.min(1.9, v.multiplier * (1 + boost));
      const { agent } = pickAgent(v.cyclesLive % 14 === 0 ? 'pipeline-boost' : 'operate', new Date().getHours());
      logEvent(state, agent.id, 'operate',
        `${agent.id === 'zahra' ? 'Demand play' : 'Growth move'} on “${v.title}”: +${Math.round(boost * 100)}% run-rate → SAR ${fmt(v.baseDailySar * v.multiplier)}/day`,
        'grow');
    }

    v.dailySar = Math.round(v.baseDailySar * v.multiplier);
    const take = Math.max(1, Math.round(v.dailySar * (0.75 + Math.random() * 0.25)));
    v.totalEarned += take;
    state.stats.earnedByVenture[v.id] = (state.stats.earnedByVenture[v.id] || 0) + take;
    state.treasury.balance += take;
    state.treasury.totalEarned += take;
    earned += take;

    if (v.multiplier <= 0.06) closings.push(v);
  }

  if (earned > 0) {
    const { agent } = pickAgent('ledger', new Date().getHours());
    logEvent(state, agent.id, 'ledger',
      `Revenue booked: +SAR ${fmt(earned)} from ${live.length} venture${live.length > 1 ? 's' : ''} · treasury SAR ${fmt(state.treasury.balance)}`,
      'revenue');
  }

  for (const v of closings) {
    v.status = 'closed';
    v.closedAt = Date.now();
    state.stats.closed++;
    logEvent(state, 'yousef', 'operate',
      `Shut down “${v.title}” — run-rate never recovered after ${v.cyclesLive} cycles (totalled SAR ${fmt(v.totalEarned)}). Capital recycled.`, 'reject');
  }
  return earned > 0;
}

async function dutySignalScan(state) {
  // Optional real-world scan: GitHub public search for rising demand signals.
  // Non-fatal on rate limits or offline — local knowledge base carries on.
  if (env('KASB_NO_NET') === '1') return false;
  const queries = ['saudi arabia startup', 'uae ecommerce trend', 'vision 2030', 'middle east ai saas'];
  const q = queries[state.cycle % queries.length];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&per_page=3`,
      { headers: { accept: 'application/vnd.github+json', 'user-agent': 'kasb-co-agent' }, signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const top = (data.items || [])[Math.floor(Math.random() * (data.items || []).length)];
    if (top) {
      const { agent } = pickAgent('signal-scan', new Date().getHours());
      logEvent(state, agent.id, 'signal-scan',
        `Live signal via GitHub: rising activity around “${q}” — ${top.full_name} (${top.stargazers_count}★) queued as market intel for the scout desk.`, 'signal');
      // Map the raw query to a knowledge-base signal id so scoring can feel it.
      const BOOST_MAP = {
        'saudi arabia startup': 'giga',
        'uae ecommerce trend': 'codshift',
        'vision 2030': 'vision2030',
        'middle east ai saas': 'smewave',
      };
      const sigId = BOOST_MAP[q];
      if (sigId) {
        state.signalBoosts = state.signalBoosts || {};
        state.signalBoosts[sigId] = (state.signalBoosts[sigId] || 0) + 0.3;
      }
      return true;
    }
  } catch {
    const { agent } = pickAgent('signal-scan', new Date().getHours());
    if (state.cycle % 9 === 0) {
      logEvent(state, agent.id, 'signal-scan', 'External signal feed unreachable this cycle — continued from internal knowledge base.', 'signal');
    }
  }
  return false;
}

function dutyShiftHandoff(state) {
  const hour = new Date().getHours();
  const working = onShift(hour);
  if (!working.length) return false;
  const names = working.map((a) => a.name.split(' ')[0]).join(', ');
  logEvent(state, working[0].id, 'handoff',
    `Shift ${String(hour).padStart(2, '0')}:00 — on the clock: ${names}. The company runs 24/7; nobody waits for morning.`, 'shift');
  return true;
}

// --- The cycle --------------------------------------------------------------

export async function tick(state) {
  state.cycle++;

  // 1. Revenue accrual happens first — the company earns while it works.
  dutyOperate(state);

  // 2. Pick the most valuable open duty for this cycle.
  const has = (status) => state.ideas.some((i) => i.status === status);
  let acted = false;

  if (has('scout')) acted = await dutyScore(state);
  else if (has('scored')) acted = await dutyRiskCheck(state);
  else if (has('cleared')) acted = await dutyPlan(state);
  else if (has('planned')) acted = await dutyLaunch(state);
  else acted = await dutyDiscover(state);

  // 3. Housekeeping duties.
  if (state.cycle % 5 === 0) await dutySignalScan(state);
  if (state.cycle % 8 === 0) dutyShiftHandoff(state);

  // 4. Occasional CFO commentary keeps the ledger narrative alive.
  if (state.cycle % 11 === 0 && state.treasury.totalEarned > 0) {
    const growth = ((state.treasury.balance / state.treasury.startBalance - 1) * 100).toFixed(1);
    logEvent(state, 'noura', 'capital',
      `Treasury report: SAR ${fmt(state.treasury.balance)} (${growth >= '0' ? '+' : ''}${growth}% vs seed) · lifetime earned SAR ${fmt(state.treasury.totalEarned)} · deployed SAR ${fmt(state.treasury.totalSpent)}`,
      'ledger');
  }

  if (!acted && state.cycle % 3 === 0) {
    logEvent(state, 'layla', 'discover', 'Pipeline quiet — scanning adjacent markets for the next wedge…', 'info');
  }

  // 5. Bound memory for weeks-long runs: keep recent history, drop the archive.
  const terminal = state.ideas.filter((i) => i.status === 'rejected' || i.status === 'launched');
  if (state.ideas.length > 240) {
    const drop = new Set(terminal.slice(0, state.ideas.length - 240).map((i) => i.id));
    if (drop.size) state.ideas = state.ideas.filter((i) => !drop.has(i.id));
  }

  // 6. Persist periodically so a restart resumes the company, not a new one.
  if (state.cycle % 5 === 0) {
    state.lastSaveCycle = state.cycle;
    saveState(state);
  }
  return state;
}

// --- Read models ------------------------------------------------------------

export function snapshot(state) {
  const hour = new Date().getHours();
  const ideaStatuses = { scout: 0, scored: 0, cleared: 0, planned: 0, rejected: 0, launched: 0 };
  for (const i of state.ideas) ideaStatuses[i.status] = (ideaStatuses[i.status] || 0) + 1;

  const liveVentures = state.ventures.filter((v) => v.status === 'live');
  const pipeline = ['scout', 'scored', 'cleared', 'planned'].flatMap((status) =>
    state.ideas.filter((i) => i.status === status).slice(0, 6));

  return {
    company: {
      name: 'Kasb Co.',
      nameAr: 'شركة كسب',
      motto: 'Finding the best ways to make money in the Middle East — on autopilot.',
      hq: 'Riyadh, Saudi Arabia',
      cycle: state.cycle,
      createdAt: state.createdAt,
      uptimeMs: Date.now() - state.createdAt,
      hour,
      employeesOnShift: onShift(hour).map((a) => a.id),
    },
    treasury: state.treasury,
    brain: brainStatus(),
    stats: state.stats,
    ideas: {
      counts: ideaStatuses,
      active: state.ideas.filter((i) => !['rejected', 'launched'].includes(i.status)).length,
      pipeline: pipeline.map((i) => ({
        id: i.id, title: i.title, flag: i.flag, country: i.country,
        sectorIcon: i.sectorIcon, sector: i.sector, playbook: i.playbook,
        angle: i.angle, signal: i.signal, status: i.status,
        capitalSar: i.capitalSar, potentialDailySar: i.potentialDailySar,
        score: i.score ? { total: i.score.total, notes: i.score.notes.slice(0, 2) } : null,
        source: i.source,
      })),
      recent: state.ideas.slice(-12).reverse().map((i) => ({
        id: i.id, title: i.title, flag: i.flag, status: i.status,
        score: i.score?.total ?? null, capitalSar: i.capitalSar,
      })),
    },
    ventures: liveVentures.map((v) => ({
      id: v.id, title: v.title, flag: v.flag, sectorIcon: v.sectorIcon,
      dailySar: v.dailySar, totalEarned: v.totalEarned, multiplier: +v.multiplier.toFixed(2),
      cyclesLive: v.cyclesLive, score: v.score,
    })),
    closedVentures: state.ventures.filter((v) => v.status === 'closed').length,
    agents: AGENTS.map((a) => ({
      id: a.id, name: a.name, role: a.role, color: a.color,
      shift: a.shift, charter: a.charter,
      onShift: hour >= a.shift[0] && hour < a.shift[1],
      tasks: state.events.filter((e) => e.agentId === a.id).length,
    })),
    events: state.events.slice(-60).reverse(),
  };
}

export function createState() {
  return loadState();
}

export { freshState };

export function resetState() {
  const fresh = freshState();
  saveState(fresh);
  return fresh;
}

export function persist(state) {
  saveState(state);
}

export { agentById, saveState };
