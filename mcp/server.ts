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

import { isLive } from "../lib/brightdata";
import { closeMcp } from "../lib/brightdata-mcp";
import { CATALOG, getTool } from "../lib/catalog";
import { meter } from "../lib/metering";

const server = new Server(
  { name: "london-gtm-intelligence", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

// ── Tools come straight from the GTM catalog, so the MCP surface and the HTTP
// API expose exactly the same tools. ──────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: CATALOG.map((t) => ({
    name: t.id,
    description: `${t.description} [${t.category}; Bright Data: ${t.brightDataTools.join(", ")}; cost: ${t.unitCost} credits]`,
    inputSchema: t.inputSchema,
  })),
}));

// ── Tool execution ───────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const tool = getTool(name);
  if (!tool) return errorResult(`Unknown tool: ${name}`);

  try {
    const result = await tool.handler(args as Record<string, unknown>);
    const usage = meter(tool.id, tool.unitCost);
    return jsonResult({
      tool: tool.id,
      ...result,
      cost: { credits: tool.unitCost },
      usage,
    });
  } catch (err) {
    return errorResult(`Tool '${tool.id}' failed: ${(err as Error).message}`);
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
