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

```bash
cp .env.example .env.local
# edit .env.local and set BRIGHT_DATA_API_KEY (+ your zone names)
npm run dev
```

Then on **Home**, run the demo task — results will show a **"LIVE · Bright Data"**
badge and the response will include `"liveMode": true`.

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

- `POST /api/route-task` — `{ workspace, task, department }` → routing decision,
  trace, results, metrics, `liveMode`.
- `POST /api/recommend-stack` — `{ companyPrompt }` → company context, recommended
  agent stack, evaluation trace, summary metrics, live signal preview.

```bash
curl -s localhost:3000/api/route-task -H 'content-type: application/json' \
  -d '{"task":"Find 10 AI security startups with recent funding signals"}' | jq
```

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
