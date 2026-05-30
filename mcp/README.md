# London — MCP Surface

London's routing and intelligence engine is designed to be exposed over the
**Model Context Protocol (MCP)** so that Claude, Cursor, Slack copilots, or any
internal enterprise tool can call London's GTM Intelligence Agent directly — with
the same governance, policy enforcement, and Bright Data backbone used by the
dashboard.

This directory documents the planned MCP tool. The backing logic already exists
in [`/lib/agent-router.ts`](../lib/agent-router.ts) and
[`/lib/brightdata.ts`](../lib/brightdata.ts); wrapping it in an MCP server is a
thin adapter.

> London is also an MCP **client**: it connects to Bright Data's official MCP
> server (`@brightdata/mcp`) to run `search_engine` / `scrape_as_markdown`. See
> [`/lib/brightdata-mcp.ts`](../lib/brightdata-mcp.ts).

---

## Tool: `find_live_account_signals`

Discover high-fit accounts and live buying signals (hiring, funding, product
launches, partnerships) from the open web, with evidence, confidence, outbound
angle, and a full Bright Data tool trace.

### Input schema

```json
{
  "vertical": "string",
  "location": "string",
  "signals": ["hiring", "funding", "product_launch", "partnership"],
  "limit": "number"
}
```

| Field      | Type     | Description                                              |
| ---------- | -------- | ------------------------------------------------------- |
| `vertical` | string   | Target market / industry (e.g. "AI security startups"). |
| `location` | string   | Optional geography filter.                              |
| `signals`  | string[] | Signal types to surface.                                |
| `limit`    | number   | Max accounts to return.                                 |

### Output

```json
{
  "results": [
    {
      "rank": 1,
      "company": "VantaAI Security",
      "signal": "Hiring enterprise account executives",
      "evidence": "Careers page lists multiple GTM roles.",
      "confidence": 0.92,
      "outboundAngle": "Lead with scaling compliance-driven enterprise sales.",
      "source": "Careers page",
      "url": "https://…"
    }
  ],
  "trace": [
    {
      "step": 1,
      "tool": "Bright Data SERP API",
      "purpose": "Discover company / news / job-posting candidates",
      "status": "success",
      "latency": "842ms"
    }
  ]
}
```

- **Ranked accounts** with company, signal, evidence, confidence, outbound angle, source.
- **Tool trace** naming each Bright Data product used (SERP API, Web Unlocker, Web Scraper API).

---

## Mapping to existing code

| MCP concept                | Backed by                                            |
| -------------------------- | ---------------------------------------------------- |
| `find_live_account_signals`| `runBrightDataPipeline(task)` in `/lib/brightdata.ts`|
| Routing / policy gate      | `routeEnterpriseTask(input)` in `/lib/agent-router.ts`|
| Live web calls             | Bright Data SERP API + MCP server (`/lib/brightdata-mcp.ts`) |
| Stack recommendation       | `recommendGtmStack(input)` in `/lib/recommend.ts`    |

A future `mcp/server.ts` would register `find_live_account_signals` (and a
`recommend_gtm_stack` tool) with the `@modelcontextprotocol/sdk` server and
delegate to these functions — no business-logic duplication.
