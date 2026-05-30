#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// London MCP Server.
//
// Exposes London's GTM Intelligence capabilities as MCP tools so Claude Desktop,
// Claude Code, Cursor, or VS Code (Cline/Continue) can call them directly. The
// tools delegate to the exact same logic the web app uses (lib/*), so the agent
// in your editor runs the same governed, Bright Data–powered pipeline.
//
// Run:   npm run mcp        (or: npx tsx mcp/server.ts)
// Needs: BRIGHT_DATA_API_KEY in the environment (loaded from .env.local below,
//        or injected by the MCP host config). Works without it via demo data.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Minimal .env.local loader (no dependency) ────────────────────────────────
// MCP hosts can also inject env via their config; we load .env.local as a
// convenience so `npm run mcp` just works.
(function loadEnvLocal() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(here, "..", ".env.local");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on the host-provided environment */
  }
})();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { runBrightDataPipeline, isLive } from "../lib/brightdata";
import { recommendGtmStack } from "../lib/recommend";
import { closeMcp } from "../lib/brightdata-mcp";

const server = new Server(
  { name: "london-gtm-intelligence", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "find_live_account_signals",
    description:
      "Discover high-fit accounts and live buying signals (hiring, funding, product launches, partnerships) from the open web using Bright Data. Returns ranked companies with evidence, confidence, an outbound angle, and the source URL — plus the tool execution trace.",
    inputSchema: {
      type: "object",
      properties: {
        vertical: {
          type: "string",
          description:
            "Target market / segment, e.g. 'AI security startups' or 'fintech companies'.",
        },
        signals: {
          type: "array",
          items: {
            type: "string",
            enum: ["hiring", "funding", "product_launch", "partnership"],
          },
          description: "Which buying signals to surface (optional).",
        },
        location: {
          type: "string",
          description: "Optional geography filter, e.g. 'US' or 'Europe'.",
        },
        limit: {
          type: "number",
          description: "Max accounts to return (default 10).",
        },
      },
      required: ["vertical"],
    },
  },
  {
    name: "recommend_gtm_stack",
    description:
      "Given a company description (type, target market, goal, budget), recommend a budget-aware stack of GTM agents with an evaluation trace and summary metrics.",
    inputSchema: {
      type: "object",
      properties: {
        companyPrompt: {
          type: "string",
          description:
            "Free-text description of the company, goals, target market, and budget.",
        },
      },
      required: ["companyPrompt"],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// ── Tool execution ───────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;

  try {
    if (name === "find_live_account_signals") {
      const vertical = String((args as Record<string, unknown>).vertical ?? "").trim();
      if (!vertical) {
        return errorResult("`vertical` is required.");
      }
      const signals = Array.isArray((args as Record<string, unknown>).signals)
        ? ((args as Record<string, unknown>).signals as string[])
        : [];
      const limit = Number((args as Record<string, unknown>).limit) || 10;
      const location = String((args as Record<string, unknown>).location ?? "").trim();

      const signalPhrase = signals.length
        ? ` with recent ${signals.join(", ").replace(/_/g, " ")} signals`
        : " with recent hiring or funding signals";
      const task = `Find ${vertical}${location ? ` in ${location}` : ""}${signalPhrase} and suggest outbound angles.`;

      const pipeline = await runBrightDataPipeline(task);
      const results = pipeline.results.slice(0, limit);

      return jsonResult({
        dataSource: pipeline.liveMode ? "live" : "demo",
        intelligenceLayer: pipeline.intelligenceLayer,
        query: task,
        results,
        trace: pipeline.trace,
      });
    }

    if (name === "recommend_gtm_stack") {
      const companyPrompt = String(
        (args as Record<string, unknown>).companyPrompt ?? "",
      ).trim();
      if (!companyPrompt) {
        return errorResult("`companyPrompt` is required.");
      }
      const rec = await recommendGtmStack({ companyPrompt });
      return jsonResult(rec);
    }

    return errorResult(`Unknown tool: ${name}`);
  } catch (err) {
    return errorResult(`Tool failed: ${(err as Error).message}`);
  }
});

// ── Result helpers ───────────────────────────────────────────────────────────

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

// ── Boot ─────────────────────────────────────────────────────────────────────

async function shutdown() {
  await closeMcp(); // close the nested Bright Data MCP child cleanly
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
// MCP hosts close the server by ending its stdin.
process.stdin.on("close", shutdown);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs go to stderr so they don't corrupt the stdio JSON-RPC stream.
  console.error(
    `[london-mcp] ready — Bright Data ${isLive() ? "LIVE" : "demo mode (no BRIGHT_DATA_API_KEY)"}`,
  );
}

main().catch((err) => {
  console.error("[london-mcp] fatal:", err);
  process.exit(1);
});
