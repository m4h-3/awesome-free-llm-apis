// Kasb Co. — Middle East market knowledge base.
// Structural facts about markets, sectors, playbooks and tailwind signals
// that the AI employees use to discover, score and launch money-making ideas.

export const COUNTRIES = [
  { id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', momentum: 9.5, ease: 7,
    note: 'Vision 2030 diversification, giga-projects, entertainment opening, 100M+ tourism target.' },
  { id: 'AE', name: 'UAE', flag: '🇦🇪', momentum: 8.5, ease: 9,
    note: 'Free zones, Golden Visas, logistics hub, mature e-commerce and startup funding.' },
  { id: 'QA', name: 'Qatar', flag: '🇶🇦', momentum: 7.5, ease: 8,
    note: 'Post-LNG wealth deployment, Doha as MICE hub, strong per-capita spend.' },
  { id: 'KW', name: 'Kuwait', flag: '🇰🇼', momentum: 6.5, ease: 6.5,
    note: 'High disposable income, retail culture, conservative but digitizing marketplaces.' },
  { id: 'BH', name: 'Bahrain', flag: '🇧🇭', momentum: 6.5, ease: 8.5,
    note: 'Lean licensing, fintech-friendly regulator, gateway into larger GCC markets.' },
  { id: 'OM', name: 'Oman', flag: '🇴🇲', momentum: 6.5, ease: 7,
    note: 'Tourism push, logistics corridor (Duqm), SME digitization programs.' },
  { id: 'EG', name: 'Egypt', flag: '🇪🇬', momentum: 7.5, ease: 5,
    note: 'Cost advantage for services export, huge youth population, export manufacturing.' },
  { id: 'JO', name: 'Jordan', flag: '🇯🇴', momentum: 6, ease: 6.5,
    note: 'Skilled tech talent, nearshore BPO to GCC, agrifood and tourism niches.' },
];

export const SECTORS = [
  { id: 'ai', name: 'AI & BPO Services', icon: '🤖', aiRun: 9.5, growth: 9, capital: 'low',
    audiences: ['SME back-offices', 'government tender teams', 'hospitality groups', 'clinics and labs', 'logistics operators'] },
  { id: 'ecom', name: 'E-commerce & Retail', icon: '🛍️', aiRun: 7, growth: 7.5, capital: 'med',
    audiences: ['COD shoppers', 'modest-fashion buyers', 'perfume collectors', 'pet owners', 'new parents'] },
  { id: 'construct', name: 'Construction & Giga-Projects', icon: '🏗️', aiRun: 5.5, growth: 9, capital: 'high',
    audiences: ['subcontractors', 'safety suppliers', 'site caterers', 'equipment renters', 'fit-out firms'] },
  { id: 'tourism', name: 'Tourism & Hospitality', icon: '🧳', aiRun: 7.5, growth: 8.5, capital: 'med',
    audiences: ['Umrah visitors', 'luxury leisure travelers', 'event tourists', 'digital nomads', 'cruise stopovers'] },
  { id: 'food', name: 'Food & Cloud Kitchens', icon: '🍽️', aiRun: 6.5, growth: 7.5, capital: 'med',
    audiences: ['late-night office workers', 'family delivery orders', 'event catering', 'healthy-lunch crowds', 'campus students'] },
  { id: 'edu', name: 'Education & Training', icon: '🎓', aiRun: 9, growth: 8, capital: 'low',
    audiences: ['job-seeking graduates', 'Saudization hires', 'corporate upskillers', 'exam preppers', 'vocational apprentices'] },
  { id: 'health', name: 'Healthcare Services', icon: '🩺', aiRun: 7, growth: 8, capital: 'med',
    audiences: ['chronic-care patients', 'home-care families', 'fitness-first professionals', 'elderly households', 'derma & aesthetics clients'] },
  { id: 'fintech', name: 'Fintech-Adjacent Services', icon: '💳', aiRun: 8, growth: 8.5, capital: 'med',
    audiences: ['freelancer invoicers', 'micro-retailers', 'rental marketplaces', 'remittance senders', 'VAT-registered SMEs'] },
  { id: 'logistics', name: 'Logistics & Delivery', icon: '🚚', aiRun: 7, growth: 8, capital: 'med',
    audiences: ['last-mile shoppers', 'cold-chain pharma', 'B2B pallet shippers', 'return-parcel handlers', 'cross-border sellers'] },
  { id: 'energy', name: 'Energy & Sustainability', icon: '☀️', aiRun: 6.5, growth: 8.5, capital: 'high',
    audiences: ['rooftop-solar adopters', 'ESCO contractors', 'waste generators', 'EV fleet operators', 'water-scarce farms'] },
  { id: 'content', name: 'Content & Creator Economy', icon: '🎬', aiRun: 9.5, growth: 8, capital: 'low',
    audiences: ['Arabic podcast listeners', 'short-drama viewers', 'gaming communities', 'brand advertisers', 'sports fan channels'] },
  { id: 'events', name: 'Events & Experiences', icon: '🎪', aiRun: 6.5, growth: 8.5, capital: 'med',
    audiences: ['season pass holders', 'corporate offsite planners', 'esports teams', 'pop-up brands', 'wedding organizers'] },
];

export const PLAYBOOKS = [
  { id: 'agency', name: 'AI Service Agency', icon: '🎯', capital: [12000, 55000], aiFit: 1.0,
    verb: 'run an always-on AI agency for' },
  { id: 'saas', name: 'Micro-SaaS Product', icon: '🧩', capital: [8000, 45000], aiFit: 0.95,
    verb: 'ship a micro-SaaS serving' },
  { id: 'marketplace', name: 'Two-Sided Marketplace', icon: '🔁', capital: [30000, 140000], aiFit: 0.7,
    verb: 'orchestrate a niche marketplace for' },
  { id: 'd2c', name: 'D2C Brand', icon: '📦', capital: [35000, 160000], aiFit: 0.55,
    verb: 'launch a D2C brand targeting' },
  { id: 'content', name: 'Content / Affiliate Engine', icon: '✍️', capital: [5000, 25000], aiFit: 0.95,
    verb: 'build an Arabic content & affiliate engine for' },
  { id: 'service', name: 'Managed Service Franchise', icon: '🧾', capital: [15000, 70000], aiFit: 0.8,
    verb: 'standardize a managed service for' },
  { id: 'trade', name: 'Cross-Border Trade / Arbitrage', icon: '🚢', capital: [25000, 150000], aiFit: 0.6,
    verb: 'arbitrage supply gaps for' },
  { id: 'ops', name: 'Ops-as-a-Service', icon: '⚙️', capital: [10000, 60000], aiFit: 0.9,
    verb: 'automate operations for' },
];

export const SIGNALS = [
  { id: 'vision2030', text: 'Saudi Vision 2030 diversification spend', countries: ['SA'], sectors: ['construct', 'ai', 'events', 'tourism'] },
  { id: 'giga', text: 'NEOM / Diriyah / Qiddiya giga-project pipelines', countries: ['SA'], sectors: ['construct', 'logistics', 'events'] },
  { id: 'riyadhseason', text: 'Riyadh Season & year-round entertainment calendar', countries: ['SA'], sectors: ['events', 'food', 'content', 'tourism'] },
  { id: 'wc2034', text: 'FIFA World Cup 2034 Saudi preparation wave', countries: ['SA'], sectors: ['tourism', 'events', 'logistics', 'construct'] },
  { id: 'expo2030', text: 'Expo 2030 Riyadh infrastructure & visitor surge', countries: ['SA'], sectors: ['tourism', 'construct', 'content'] },
  { id: 'goldenvisa', text: 'UAE Golden Visa & free-zone expansion', countries: ['AE'], sectors: ['fintech', 'edu', 'health', 'ecom'] },
  { id: 'pdpl', text: 'Saudi PDPL data-residency compliance demand', countries: ['SA'], sectors: ['ai', 'fintech', 'health'] },
  { id: 'saudization', text: 'Saudization / Nitaqat workforce localization rules', countries: ['SA'], sectors: ['edu', 'ai', 'fintech'] },
  { id: 'tourism100', text: 'GCC tourism targets (100M+ annual visits to KSA)', countries: ['SA', 'OM', 'BH'], sectors: ['tourism', 'food', 'content'] },
  { id: 'qatarwealth', text: 'Qatar post-LNG wealth deployment into services', countries: ['QA'], sectors: ['fintech', 'events', 'health'] },
  { id: 'egyptcost', text: 'Egypt cost advantage for services & content export', countries: ['EG', 'JO'], sectors: ['ai', 'content', 'edu'] },
  { id: 'codshift', text: 'COD-to-digital payments shift in Gulf e-commerce', countries: ['SA', 'AE', 'KW'], sectors: ['ecom', 'logistics', 'fintech'] },
  { id: 'remittance', text: 'High-volume cross-border remittance corridors', countries: ['AE', 'SA', 'KW'], sectors: ['fintech', 'ecom'] },
  { id: 'renewables', text: 'GCC renewable & EV-fleet build-out', countries: ['SA', 'OM'], sectors: ['energy', 'logistics'] },
  { id: 'arabicgap', text: 'Arabic-first AI & content gap', countries: ['SA', 'AE', 'EG'], sectors: ['content', 'ai', 'edu'] },
  { id: 'smewave', text: 'GCC SME digitization wave', countries: ['SA', 'AE', 'BH'], sectors: ['ai', 'fintech', 'ops'] },
  { id: 'healthwants', text: 'Preventive-health & med-tourism growth', countries: ['SA', 'AE', 'JO'], sectors: ['health', 'edu'] },
  { id: 'coldchain', text: 'Cold-chain & pharma logistics build-out', countries: ['SA', 'QA'], sectors: ['logistics', 'health'] },
];

// --- Idea generation -------------------------------------------------------

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickWeighted(rng, arr, weightFn) {
  const weights = arr.map((x) => Math.max(0.01, weightFn(x)));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function titleFor(idea) {
  const { country, sector, playbook, angle } = idea;
  // Titles always blend sector + angle + country → thousands of unique combos,
  // so a company running for weeks never collides with its own history.
  const templates = {
    agency: `${sector.name} copilot studio for ${angle} in ${country.name}`,
    saas: `Micro-SaaS for ${angle} — ${sector.name} in ${country.name}`,
    marketplace: `Marketplace for ${angle} — ${sector.name} across ${country.name}`,
    d2c: `D2C brand for ${angle} — ${sector.name} shipped from ${country.name}`,
    content: `Arabic content engine for ${angle} — ${sector.name} in ${country.name}`,
    service: `Managed service for ${angle} — ${sector.name} in ${country.name}`,
    trade: `Cross-border supply arbitrage for ${angle} — ${sector.name} in ${country.name}`,
    ops: `Ops-as-a-service for ${angle} — ${sector.name} in ${country.name}`,
  };
  return templates[playbook.id];
}

function descriptionFor(idea) {
  const { country, sector, playbook, signal } = idea;
  return `${country.flag} ${playbook.verb} ${idea.angle}, riding the "${signal.text}" tailwind. ` +
    `${sector.name} momentum in ${country.name} is strong; the play is ${playbook.name.toLowerCase()} ` +
    `with AI doing most of the round-the-clock execution work.`;
}

export function generateIdea(rng, state, source = 'local') {
  const used = new Set((state.opportunities || state.ideas || []).map((o) => o.title));
  for (let attempt = 0; attempt < 80; attempt++) {
    const signal = pick(rng, SIGNALS);
    const boost = (state.signalBoosts && state.signalBoosts[signal.id]) || 0;
    const country = pickWeighted(rng, COUNTRIES,
      (c) => (signal.countries.includes(c.id) ? 4 : 1) * (0.5 + boost));
    const sector = pickWeighted(rng, SECTORS,
      (s) => (signal.sectors.includes(s.id) ? 4 : 1) * s.growth);
    const playbook = pickWeighted(rng, PLAYBOOKS,
      (p) => p.aiFit * (sector.capital === 'high' && p.capital[0] < 30000 ? 0.4 : 1));
    const angle = pick(rng, sector.audiences);
    const idea = { country, sector, playbook, signal, angle };
    const title = titleFor(idea);
    if (used.has(title)) continue;
    const capMul = (0.8 + rng() * 0.6) * (country.ease / 7);
    const capital = Math.round(
      (playbook.capital[0] + rng() * (playbook.capital[1] - playbook.capital[0])) * capMul / 500) * 500;
    const potential = Math.round(capital * (0.012 + rng() * 0.03) * (sector.growth / 8));
    return {
      id: `opp-${Date.now().toString(36)}-${Math.floor(rng() * 1e6).toString(36)}`,
      title,
      description: descriptionFor(idea),
      country: country.name, countryId: country.id, flag: country.flag,
      sector: sector.name, sectorId: sector.id, sectorIcon: sector.icon,
      playbook: playbook.name, playbookId: playbook.id, playbookIcon: playbook.icon,
      signal: signal.text, signalId: signal.id,
      angle,
      capitalSar: capital,
      potentialDailySar: Math.max(15, potential),
      score: null, status: 'scout', source,
      plan: null, dailySar: 0, launchDailySar: 0, ageDays: 0, trend: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
  }
  return null;
}

// --- Scoring ---------------------------------------------------------------

export function scoreOpportunity(opp, state, rng = Math.random) {
  const country = COUNTRIES.find((c) => c.id === opp.countryId) || COUNTRIES[0];
  const sector = SECTORS.find((s) => s.id === opp.sectorId) || SECTORS[0];
  const playbook = PLAYBOOKS.find((p) => p.id === opp.playbookId) || PLAYBOOKS[0];
  const signal = SIGNALS.find((s) => s.id === opp.signalId) || SIGNALS[0];
  const boosts = state.signalBoosts || {};

  const momentum = clamp10((country.momentum * 0.55 + sector.growth * 0.45) + (boosts[signal.id] || 0));
  const competition = clamp10(10 - sector.growth * 0.45 - (rng() * 3.5) + country.ease * 0.2);
  const capitalEase = clamp10(10 - (opp.capitalSar / 16000) + (state.treasury.balance / opp.capitalSar) * 1.5);
  const regulatory = clamp10(country.ease + (signal.countries.includes(country.id) ? 1 : -0.5) + rng() * 1.5 - 1);
  const aiRun = clamp10(sector.aiRun * playbook.aiFit + rng() * 1.2 - 0.4);

  const parts = [
    ['Market momentum', momentum, 0.26],
    ['Competition headroom', competition, 0.16],
    ['Capital accessibility', capitalEase, 0.18],
    ['Regulatory ease', regulatory, 0.16],
    ['AI-runnability (agents can operate it)', aiRun, 0.24],
  ];
  const total = Math.round(parts.reduce((sum, [, v, w]) => sum + v * w, 0) * 10);

  const notes = [
    `${country.flag} ${signal.text} → momentum ${momentum.toFixed(1)}/10`,
    `Regulatory environment ${regulatory.toFixed(1)}/10 — ${country.note}`,
    `AI-runnability ${aiRun.toFixed(1)}/10 for a ${playbook.name} (agents keep it moving 24/7)`,
    capitalEase < 4
      ? `⚠ Capital-intensive: SAR ${opp.capitalSar.toLocaleString()} vs treasury SAR ${state.treasury.balance.toLocaleString()}`
      : `SAR ${opp.capitalSar.toLocaleString()} startup cost is reachable from treasury`,
  ];
  return { total, parts: parts.map(([label, v, w]) => ({ label, value: +v.toFixed(1), weight: w })), notes };
}

function clamp10(v) {
  return Math.max(0, Math.min(10, v));
}

// --- Business plan builder -------------------------------------------------

const PLAYBOOK_STEPS = {
  agency: [
    'Package the service as a fixed monthly retainer with three tiers.',
    'Stand up the AI delivery pipeline (intake → workflow → QA → human review).',
    'Scout 20 target accounts from directories and tender portals; send personalized outreach.',
    'Land 2 pilot clients at a discount; record case studies within 30 days.',
    'Systemize onboarding and publish SLA-backed pricing.',
    'Reinvest pilot fees into a second service line.',
  ],
  saas: [
    'Validate with 10 discovery calls; lock the single sharpest pain point.',
    'Ship the MVP around one workflow; Arabic + English UI from day one.',
    'Seed with founders communities, LinkedIn, and local incubators.',
    'Instrument activation/funnel metrics; iterate weekly.',
    'Convert free users with usage-based pricing anchored in SAR.',
    'Add payment links (Mada/Apple Pay) and self-serve onboarding.',
  ],
  marketplace: [
    'Pick the supply side first; recruit 30 anchor suppliers with concierge onboarding.',
    'Launch demand-side with a single city and one category.',
    'Guarantee supply (dark inventory) until organic liquidity appears.',
    'Take a 12–15% take-rate; settle weekly to earn trust.',
    'Expand category-by-category only after repeat rate exceeds 30%.',
    'Layer financing/logistics services on top of the transaction flow.',
  ],
  d2c: [
    'Choose hero SKU from search gaps + import-cost arbitrage.',
    'Build supply from a verified manufacturer; quality-check first batch.',
    'Localize packaging and returns; COD-friendly checkout with digital upsell.',
    'Launch with micro-influencer seeding (Arabic Reels/TikTok).',
    'Iterate creative weekly on ROAS; kill losers fast.',
    'Expand to marketplace listings once D2C unit economics hold.',
  ],
  content: [
    'Map keyword clusters in Arabic with weak competition.',
    'Produce a 90-day content backlog with AI drafting + human editorial voice.',
    'Monetize via affiliate links, sponsorships and lead-gen deals.',
    'Syndicate across X/YouTube/podcasts; build an email list from day one.',
    'Double down on top-decile formats; retire the rest.',
    'License the content library as a B2B lead-gen product.',
  ],
  service: [
    'Document the service as an SOP an AI agent can run end-to-end.',
    'Offer 3 founding clients a performance-linked contract.',
    'Automate reporting and invoicing; keep humans on exception handling.',
    'Collect testimonials and referral incentives.',
    'Package pricing per-location or per-seat for expansion.',
    'Franchise the playbook to partner operators in adjacent cities.',
  ],
  trade: [
    'Map price gaps across 3 supplier countries vs Gulf demand.',
    'Secure terms with two suppliers; start with air-freight test lots.',
    'Pre-sell inventory to distributors before landing goods.',
    'Comply with SASO/GSO certification and customs pre-clearance.',
    'Reinvest margin into larger lots and a bonded storage arrangement.',
    'Add a demand-forecasting AI agent to reduce dead stock.',
  ],
  ops: [
    'Audit a target firm’s repetitive back-office workflows.',
    'Quantify hours saved; price against the client’s fully-loaded cost.',
    'Deploy AI agents with human checkpoints on approvals.',
    'Prove 40%+ cost reduction in month one; lock an annual contract.',
    'Productize the dashboard and SLA reporting.',
    'Land adjacent clients through ecosystem partnerships.',
  ],
};

export function buildPlan(opp) {
  const country = COUNTRIES.find((c) => c.id === opp.countryId) || COUNTRIES[0];
  const steps = PLAYBOOK_STEPS[opp.playbookId] || PLAYBOOK_STEPS.ops;
  const risks = [
    `Regulatory: confirm licensing for ${opp.sector.toLowerCase()} in ${country.name} (${country.note})`,
    `Market: incumbents may match pricing within 90 days — protect margin with data/switching costs`,
    `Execution: keep a human-in-the-loop on contracts and payments; agents handle the rest`,
  ];
  const summary =
    `${opp.flag} A ${opp.playbook} targeting ${opp.angle} in ${opp.country}, built on the signal: ` +
    `"${opp.signal}". Startup cost ~SAR ${opp.capitalSar.toLocaleString()}; ` +
    `potential ~SAR ${opp.potentialDailySar.toLocaleString()}/day once stable. ` +
    `Designed so AI employees run discovery, outreach, delivery and reporting around the clock.`;
  return { summary, steps, risks, builtAt: Date.now() };
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
