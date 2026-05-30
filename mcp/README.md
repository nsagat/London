# London — MCP Server

London's GTM Intelligence engine is exposed over the **Model Context Protocol
(MCP)** so Claude Desktop, Claude Code, Cursor, or VS Code (Cline/Continue) can
call it directly — running the same governed, Bright Data–powered pipeline used
by the web app. The server lives at [`mcp/server.ts`](./server.ts).

> London is also an MCP **client**: it connects to Bright Data's official MCP
> server (`@brightdata/mcp`) to run `search_engine` / `scrape_as_markdown`. See
> [`/lib/brightdata-mcp.ts`](../lib/brightdata-mcp.ts). So London is both an MCP
> server (to your editor) and an MCP client (to Bright Data).

## Run it

```bash
npm run mcp          # = tsx mcp/server.ts  (stdio MCP server)
```

It reads `BRIGHT_DATA_API_KEY` from `.env.local` automatically (or from the env
your MCP host injects). With no key it serves realistic demo data.

## Connect it to an MCP host

Use the project's local `tsx` binary so there's no PATH/`npx` resolution issue.

**Claude Code (CLI):**

```bash
claude mcp add london \
  /Users/nilufer/Documents/London/node_modules/.bin/tsx \
  /Users/nilufer/Documents/London/mcp/server.ts
```

**Claude Desktop** — edit
`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "london": {
      "command": "/Users/nilufer/Documents/London/node_modules/.bin/tsx",
      "args": ["/Users/nilufer/Documents/London/mcp/server.ts"]
    }
  }
}
```

**VS Code** — create `.vscode/mcp.json` in any workspace (or add to Cline/Cursor
MCP settings):

```json
{
  "servers": {
    "london": {
      "command": "/Users/nilufer/Documents/London/node_modules/.bin/tsx",
      "args": ["/Users/nilufer/Documents/London/mcp/server.ts"]
    }
  }
}
```

Restart the host, then ask: *"Use london to find AI security startups with recent
funding signals."* The assistant will call `find_live_account_signals` and get
live Bright Data results back.

## Tools exposed

| Tool | Purpose |
| ---- | ------- |
| `find_live_account_signals` | Discover accounts + live buying signals (hiring/funding/launch/partnership) with evidence, confidence, outbound angle, source, and tool trace. |
| `recommend_gtm_stack` | Turn a company/goals/budget description into a recommended GTM agent stack. |

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
