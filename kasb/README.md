# Kasb Co. — شركة كسب

**An autonomous company that finds the best ways to make money in the Middle East, staffed by AI employees who work 24/7.**

Kasb Co. runs inside this repo as a self-contained Node.js app (zero dependencies). Eight AI
"employees" rotate through real shifts around the clock, taking every opportunity through a full
business lifecycle:

```
discover  →  score  →  compliance  →  plan  →  launch  →  operate  →  book revenue
 (Layla)     (Omar)     (Khalid)     (Fatima)  (Yousef)   (Yousef)     (Noura)
```

- **Finds the money ways** — a Middle East market knowledge base (Saudi Vision 2030, giga-projects,
  Riyadh Season, World Cup 2034, Expo 2030, PDPL, Saudization, COD shift, remittance corridors…)
  across 8 countries, 12 sectors, 8 business playbooks and 18 tailwind signals.
- **AI employees, real shifts** — every hour of the day has qualified staff on shift; off-hours work
  is flagged as `[off-shift crunch]`, but nothing ever waits until morning.
- **It makes money of itself** — launched ventures book revenue into the treasury every cycle, the
  CFO compounds winners and shuts down losers, and capital gets recycled into the next launch.
- **Real deliverables** — every approved deal writes a 90-day business plan as a Markdown file to
  `deliverables/` (inventory the company produces while you sleep).
- **Persists forever** — state lives in `.state/company.json`; restarts resume the same company.

## Run it

```bash
cd kasb
npm start            # or: node server.js
# open http://localhost:8787
```

Environment variables:

| Var | Default | Meaning |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port for the live dashboard |
| `KASB_TICK_MS` | `5000` | ms per work cycle (lower = faster company) |
| `KASB_LLM_BASE_URL` / `KASB_LLM_API_KEY` / `KASB_LLM_MODEL` | — | give employees a real LLM brain |
| `KASB_NO_PERSIST` | — | set `1` to freeze state (tests/dry runs) |
| `KASB_NO_NET` | — | set `1` to disable live signal scans |

## Give the employees a real brain (free-tier LLM APIs)

By default the company runs on its **built-in local brain** — deterministic market logic, still 24/7.
To power your employees with an actual model, use any free-tier provider from this repo's own
[`data.json`](../data.json) (Gemini, Groq, Mistral, Cerebras, OpenRouter, …):

```bash
export KASB_LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
export KASB_LLM_API_KEY=your-free-key
export KASB_LLM_MODEL=gemini-2.5-flash
npm start
```

Every live-LLM call has a timeout and falls back to the local brain, so the company never stalls —
worst case it keeps operating on heuristics. See [`free-llm-apis/SKILL.md`](../free-llm-apis/SKILL.md)
for how to get free API keys.

## API

| Endpoint | Description |
| --- | --- |
| `GET /` | Live mission-control dashboard |
| `GET /api/state` | Full company snapshot (treasury, pipeline, ventures, agents, events) |
| `GET /api/providers` | Free LLM provider directory + brain status |
| `POST /api/tick` | Run one work cycle now |
| `POST /api/reset` | Fresh company (new seed treasury) |

## Tests

```bash
npm test          # node --test test/
deno test         # also runs under Deno (repo CI)
```

Covered: idea well-formedness/dedup, bounded scoring, plan quality, 24/7 shift coverage for every
hour, brain status, a full discover→launch→revenue lifecycle, and the dashboard snapshot shape.

## Honest notes

- **The treasury is a simulation.** Revenue, capital deployment and ROI are modeled paper money so
  the company can safely optimize itself; no bank account is touched.
- **Review before you execute.** Business plans are generated artifacts — real launches still deserve
  a human reading the compliance notes (Khalid flags licensing, PDPL, Mada paths).
- **A real bank account can't be an agent.** If you wire real APIs later (payments, marketplaces),
  keep a human approval step on withdrawals.
