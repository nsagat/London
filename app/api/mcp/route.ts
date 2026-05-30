import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { CATALOG, getTool } from "@/lib/catalog";
import { meter } from "@/lib/metering";

// ─────────────────────────────────────────────────────────────────────────────
// Hosted remote MCP endpoint (Streamable HTTP, stateless).
//
// This makes London's GTM intelligence catalog callable by ANY MCP-capable agent
// over a single URL — no local setup. The "Orthogonal move": add one URL and your
// agent instantly has Bright Data–powered GTM tools.
//
//   Claude Code:  claude mcp add --transport http london https://<app>/api/mcp
//   Cursor / etc: add a remote MCP server with URL https://<app>/api/mcp
//
// Speaks MCP's JSON-RPC 2.0 over POST (initialize / tools/list / tools/call /
// ping). Stateless: returns a plain JSON response per request, which the
// Streamable HTTP transport permits when the server doesn't need to stream.
// ─────────────────────────────────────────────────────────────────────────────

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "london-gtm-intelligence", version: "0.1.0" };

interface RpcMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function result(id: RpcMessage["id"], res: unknown) {
  return { jsonrpc: "2.0", id, result: res };
}
function error(id: RpcMessage["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function toolManifest() {
  return CATALOG.map((t) => ({
    name: t.id,
    description: `${t.description} [${t.category}; Bright Data: ${t.brightDataTools.join(", ")}; cost: ${t.unitCost} credits]`,
    inputSchema: t.inputSchema,
  }));
}

async function handle(msg: RpcMessage): Promise<object | null> {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      return result(id, {
        protocolVersion:
          (params?.protocolVersion as string) || PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "London exposes Bright Data–powered GTM intelligence tools (account discovery, buying signals, enrichment, competitor monitoring, GTM stack recommendation, and always-on watches). Call tools/list to discover them.",
      });

    case "ping":
      return result(id, {});

    case "tools/list":
      return result(id, { tools: toolManifest() });

    case "tools/call": {
      const name = params?.name as string;
      const tool = getTool(name);
      if (!tool) {
        return result(id, {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        });
      }
      try {
        const args = (params?.arguments as Record<string, unknown>) || {};
        const res = await tool.handler(args);
        const usage = meter(tool.id, tool.unitCost);
        return result(id, {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { tool: tool.id, ...res, cost: { credits: tool.unitCost }, usage },
                null,
                2,
              ),
            },
          ],
        });
      } catch (err) {
        return result(id, {
          content: [
            { type: "text", text: `Tool '${tool.id}' failed: ${(err as Error).message}` },
          ],
          isError: true,
        });
      }
    }

    default:
      // Notifications (no id) get no response.
      if (id === undefined || method?.startsWith("notifications/")) return null;
      return error(id, -32601, `Method not found: ${method}`);
  }
}

function cors(sessionId?: string): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
  if (sessionId) h["Mcp-Session-Id"] = sessionId;
  return h;
}

export async function POST(req: Request) {
  const sessionId = req.headers.get("mcp-session-id") || randomUUID();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(error(null, -32700, "Parse error"), {
      status: 400,
      headers: cors(sessionId),
    });
  }

  let payload: unknown;
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m as RpcMessage)))).filter(
      Boolean,
    );
    payload = out.length ? out : null;
  } else {
    payload = await handle(body as RpcMessage);
  }

  // Notification-only request → 202 Accepted, no body.
  if (payload === null) {
    return new NextResponse(null, { status: 202, headers: cors(sessionId) });
  }
  return NextResponse.json(payload, { headers: cors(sessionId) });
}

// Discovery / health for the endpoint (also returns 405-style info for GET SSE).
export async function GET() {
  return NextResponse.json(
    {
      name: SERVER_INFO.name,
      transport: "streamable-http",
      protocolVersion: PROTOCOL_VERSION,
      tools: CATALOG.map((t) => t.id),
      hint: "POST JSON-RPC here (initialize, tools/list, tools/call).",
    },
    { headers: cors() },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}
