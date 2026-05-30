# London

**GTM Intelligence control plane for the enterprise — powered by Bright Data.**

> London lets a company register AI agents into its workspace, define policies for
> what each agent can access, route employee tasks to the right agent, and observe
> exactly what the agent did. For this MVP, London ships a Bright Data–powered
> **GTM Intelligence Agent** that turns live web data into account intelligence,
> outbound angles, and workflow-ready outputs.

Tagline: _Governed agent integration for enterprise workspaces._

---

## Hackathon context

Built for **Track 1 — GTM Intelligence: "Unlock the web for the teams that drive
revenue."** Sales, marketing, and RevOps run on market knowledge, and the web has
all of it in real time. London demonstrates always-on, _structured_ web
intelligence that replaces manual research and feeds GTM workflows:

- Continuously discover companies, competitors, and buying signals (hiring,
  funding, launches, partnerships).
- Enrich accounts and surface structured intelligence directly into GTM tools/CRM.
- Give AI agents the live web context they need to act on behalf of revenue teams.

**Requirement met:** London uses real Bright Data products — **SERP API** and the
**Bright Data MCP Server** — as the live-web backbone (see below). It also
references Web Unlocker, Web Scraper API, and Scraping Browser as labeled steps in
the agent pipeline.

---

## Product vision

Companies will soon run many internal and external AI agents. London is the
control layer that makes that safe and useful:

- **A workspace** for the company's AI agents.
- **A control plane** for agent governance and policy.
- **A router** that assigns employee requests to the right agent.
- **An observability layer** showing every tool call an agent made.
- **An integration layer** that can expose agents to Claude, Cursor, Slack, or CRM
  via API / MCP.

---

## MVP features

- **Home — GTM Intelligence Control Plane:** workspace stats, connected agents
  (GTM Intelligence Agent selected by default), live **policy panel**, an employee
  **task input**, and — on _Route Task_ — a **routing decision**, **Bright Data
  execution trace**, and a structured **account-intelligence table**.
- **Build GTM Team:** describe your company, goals, market, and budget → London
  recommends a budget-aware **GTM agent stack** with an evaluation trace, summary
  metrics, and a live GTM signal preview (`/api/recommend-stack`).
- **Agent Marketplace / Deployed Agents:** browse, inspect, and deploy agents with
  their tools, policy, and MCP-ready status.
- **Workflows:** multi-agent pipelines (GTM Account Discovery, Refund Automation,
  Vendor Risk Monitoring).
- **Performance:** observability — runs, tool calls by provider, latency, cost,
  success rate, policy blocks, most-used agents.
- **Integrations / Settings:** Bright Data shown as the connected backbone; live
  vs mock status reported from env.
- **Dual routing modes:** GTM intelligence tasks run the Bright Data pipeline;
  support tasks (refund/ticket/response time) route to a Customer Support agent
  team — demonstrating London as a platform, not a single agent.

---

## How Bright Data is used

Bright Data is the live-web data layer for the GTM Intelligence Agent. Each tool
maps to a concrete stage in the pipeline (and appears by name in the trace):

| Bright Data product | Role in London                                                | Status in MVP                 |
| ------------------- | ------------------------------------------------------------- | ----------------------------- |
| **SERP API**        | Discover companies, news, funding, hiring signals             | **Real call** (key-gated)     |
| **MCP Server**      | London is an MCP client → `search_engine`, `scrape_as_markdown` | **Real call** (key-gated)   |
| **Web Unlocker**    | Fetch company sites, careers, pricing, articles               | Real call path + labeled step |
| **Web Scraper API** | Structured extraction (firmographics, hiring, tech stack)     | Labeled pipeline step         |
| **Scraping Browser**| JS-heavy / dynamic pages (product launches)                   | Labeled pipeline step         |

**Code:** [`lib/brightdata.ts`](lib/brightdata.ts) (HTTP + orchestration) and
[`lib/brightdata-mcp.ts`](lib/brightdata-mcp.ts) (MCP client).

- With **no** `BRIGHT_DATA_API_KEY`, every function returns realistic mock data and
  the UI labels results **"Demo data"** — so the app always boots.
- With a key present, the **Home → Route Task** GTM flow makes **real** Bright Data
  calls, sets `liveMode: true`, and the UI shows a **"LIVE · Bright Data"** badge.

---

## Intelligence layer — AI/ML API

London separates the **data layer** (Bright Data, live web) from the
**intelligence layer** (AI reasoning over that evidence):

```
Bright Data  →  live web data (who / what / when)
AI/ML API    →  reasoning, extraction, summarization (what it means, what to do)
```

[AI/ML API](https://aimlapi.com) is an OpenAI-compatible gateway to many models.
When `AIMLAPI_API_KEY` is set, London uses it to:

1. **Extract** structured signals from messy scraped pages + SERP results
   (real model instead of regex) — `lib/ai-intelligence.ts`.
2. **Summarize** the top accounts into a 2-sentence brief **and a personalized
   outbound email**, grounded in the live Bright Data evidence.

It is fully **key-gated with heuristic fallback** — no key (or any error) and
London uses its deterministic extractor, so the app never depends on it. Every
response reports which engine ran via `intelligenceLayer: "aiml" | "heuristic"`,
and the execution trace names the model (e.g. `AI/ML API · gpt-4o-mini`).

Config: `AIMLAPI_API_KEY`, `AIMLAPI_BASE_URL` (default
`https://api.aimlapi.com/v1`), `AIMLAPI_MODEL` (default `gpt-4o-mini`).

## Demo reliability

Live web is variable, so London is hardened for a smooth on-stage demo:

- **MCP pre-warm** — on server boot (`instrumentation.ts`) London connects the
  Bright Data MCP server and background-primes the default demo query, so the
  first request isn't paying cold-start.
- **Result cache** — identical queries return instantly from an in-memory cache
  (15-min TTL); the scripted demo prompt is effectively sub-second after warmup.
- **Last-good fallback** — if a live run flakes (network blip, junk SERP, scrape
  timeout), London serves the most recent *successful* live result rather than
  degrading to static mock — so the demo always shows real Bright Data data.
- **Per-call timeouts + single-flight connect** — no hung MCP calls, and
  concurrent first requests share one spawned server.

## How the recommendation / routing flow works

1. An employee describes a task (Home) or a company (Build GTM Team).
2. `routeEnterpriseTask` / `recommendGtmStack` detect intent and select the agent
   (or team) under workspace **policy** (`lib/policies.ts`).
3. For GTM tasks, `runBrightDataPipeline` runs SERP discovery → page fetch →
   structuring → signal extraction → ranking, producing a **trace** + **results**.
4. The UI renders the routing decision, the trace, and a structured table — all
   exportable as JSON.

---

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app runs with **zero credentials** (mock/demo data).

### Go live with Bright Data

The live path runs through the **Bright Data MCP server**, which needs only your
API token — it provisions everything internally, so there is **no zone setup**.

```bash
cp .env.example .env.local
# edit .env.local and set BRIGHT_DATA_API_KEY=<your token>
npm run dev
```

Then on **Home**, run the demo task — results will show a **"LIVE · Bright Data"**
badge and the response will include `"liveMode": true`. Under the hood London
calls the MCP `search_engine` tool (3 parallel signal queries) and
`scrape_as_markdown` (Web Unlocker) to enrich the top accounts, then extracts
structured signals, evidence, confidence, and outbound angles.

### Environment variables

| Variable                         | Purpose                                            |
| -------------------------------- | -------------------------------------------------- |
| `BRIGHT_DATA_API_KEY`            | Bright Data API token (enables live mode)          |
| `BRIGHT_DATA_SERP_ZONE`          | SERP API zone name (default `serp_api`)            |
| `BRIGHT_DATA_UNLOCKER_ZONE`      | Web Unlocker zone name (default `web_unlocker`)    |
| `BRIGHT_DATA_REQUEST_ENDPOINT`   | Unified request endpoint (default Bright Data API) |
| `BRIGHT_DATA_MCP_COMMAND` / `_ARGS` | How to launch the Bright Data MCP server        |
| `BRIGHT_DATA_WEB_SCRAPER_ENDPOINT` / `BRIGHT_DATA_SCRAPING_BROWSER_URL` | Optional |

No secrets are committed; keys are read from the environment only.

---

## API

### Unified endpoint (one call for everything)

`POST /api/agent` takes a single natural-language `input`, auto-detects intent,
runs the right agent capability, and returns one envelope. This is the surface a
frontend (or an MCP host) talks to when it doesn't want to pick an endpoint.

```bash
curl -s localhost:3000/api/agent -H 'content-type: application/json' \
  -d '{"input":"Find AI security startups with recent funding signals"}' | jq
```

Request: `{ input, workspace?, department?, mode? }`
(`mode` = `auto` | `route_task` | `recommend_stack`, default `auto`).

Response envelope:

```json
{
  "kind": "route_task" | "recommend_stack",
  "intent": "…why this capability was chosen…",
  "workspace": "Acme Corp",
  "liveMode": true,
  "dataSource": "live",
  "data": { /* full route_task or recommend_stack payload */ }
}
```

| Example input | Auto-detected `kind` | What runs |
| ------------- | -------------------- | --------- |
| "Find AI security startups with recent funding" | `route_task` | GTM Intelligence Agent (live Bright Data) |
| "Automate refund tickets and cut response time" | `route_task` | Customer Support Agent Team |
| "We're a B2B security startup, $2k/mo for pipeline" | `recommend_stack` | Recommended GTM agent team |

`GET /api/agent` self-describes the available capabilities.

### Direct endpoints (still available)

- `POST /api/route-task` — `{ workspace, task, department }` → routing decision,
  trace, results, metrics, `liveMode`.
- `POST /api/recommend-stack` — `{ companyPrompt }` → company context, recommended
  agent stack, evaluation trace, summary metrics, live signal preview.

---

## Future MCP / API integration

The same routing + intelligence engine can be exposed as an **MCP tool**
(`find_live_account_signals`) so Claude, Cursor, or enterprise copilots can call
London directly — with the same policy enforcement and Bright Data backbone. See
[`mcp/README.md`](mcp/README.md).

---

## Demo prompt

> **Find 10 AI security startups with recent hiring or funding signals and suggest
> outbound angles.**

Open Home → it's prefilled → click **Route Task**. Then try a support prompt
("automate refund requests and reduce response time") to see London route to a
different agent team.

---

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react ·
`@modelcontextprotocol/sdk` · in-memory mock data (no database).

```
app/        routes + API handlers
components/ UI (Sidebar, Header, dashboard panels, ui/ primitives)
lib/        agents, policies, router, recommend, Bright Data integration, types
mcp/        MCP tool documentation
```
