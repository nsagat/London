import type { SerpResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Bright Data MCP Server client.
//
// Bright Data ships an official MCP server (published as `@brightdata/mcp`) that
// exposes web tools — search_engine, scrape_as_markdown, etc. — over the Model
// Context Protocol. London connects to it as an MCP client so the SAME web tools
// our agents use can be called by Claude / Cursor / any MCP host.
//
// This module is server-only and best-effort: if the MCP SDK, the API token, or
// the spawned server are unavailable, callers fall back to mock/HTTP paths. The
// dynamic import keeps the SDK out of the build when it isn't installed.
// ─────────────────────────────────────────────────────────────────────────────

export function brightDataConfigured(): boolean {
  return Boolean(process.env.BRIGHT_DATA_API_KEY);
}

interface McpClient {
  callTool: (args: {
    name: string;
    arguments: Record<string, unknown>;
  }) => Promise<McpTextResult>;
  listTools: () => Promise<unknown>;
  close?: () => Promise<void>;
}

let cachedClient: McpClient | null = null;
// Single-flight: concurrent first requests share one connect (one spawned server).
let connecting: Promise<McpClient | null> | null = null;

const CONNECT_TIMEOUT_MS = 25_000;
const SEARCH_TIMEOUT_MS = 15_000;
const SCRAPE_TIMEOUT_MS = 12_000;

/** Reject if `p` doesn't settle within `ms`. */
function deadline<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function getClient(): Promise<McpClient | null> {
  if (!brightDataConfigured()) return null;
  if (cachedClient) return cachedClient;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      // Dynamic imports so a missing SDK never breaks the build/runtime.
      const { Client } = await import(
        "@modelcontextprotocol/sdk/client/index.js"
      );
      const { StdioClientTransport } = await import(
        "@modelcontextprotocol/sdk/client/stdio.js"
      );

      const command = process.env.BRIGHT_DATA_MCP_COMMAND || "npx";
      const args = (process.env.BRIGHT_DATA_MCP_ARGS || "-y,@brightdata/mcp")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const transport = new StdioClientTransport({
        command,
        args,
        env: {
          ...process.env,
          // Bright Data MCP reads the token from API_TOKEN.
          API_TOKEN: process.env.BRIGHT_DATA_API_KEY as string,
        },
      });

      const client = new Client(
        { name: "london-control-plane", version: "0.1.0" },
        { capabilities: {} },
      );
      await deadline(client.connect(transport), CONNECT_TIMEOUT_MS, "MCP connect");
      cachedClient = client as unknown as McpClient;
      return cachedClient;
    } catch (err) {
      console.warn(
        "[london] Bright Data MCP client unavailable, falling back:",
        (err as Error).message,
      );
      cachedClient = null;
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

/**
 * Gracefully close the nested Bright Data MCP client (and its child process).
 * Call this on shutdown so the spawned server doesn't crash mid-write (EPIPE).
 */
export async function closeMcp(): Promise<void> {
  const client = cachedClient;
  cachedClient = null;
  try {
    await client?.close?.();
  } catch {
    /* ignore */
  }
}

/**
 * Connect (and spawn) the Bright Data MCP server ahead of the first user
 * request, so the demo's first query isn't paying cold-start. Best-effort.
 */
export async function warmupMcp(): Promise<boolean> {
  if (!brightDataConfigured()) return false;
  try {
    const client = await getClient();
    if (!client) return false;
    await deadline(client.listTools(), CONNECT_TIMEOUT_MS, "MCP listTools");
    return true;
  } catch {
    return false;
  }
}

interface McpTextResult {
  content?: { type: string; text?: string }[];
}

/**
 * Run a web search via the Bright Data MCP `search_engine` tool. Returns null on
 * any failure so the caller can fall back to the direct SERP API / mock path.
 */
export async function mcpSearchEngine(
  query: string,
): Promise<SerpResult[] | null> {
  const client = await getClient();
  if (!client) return null;

  try {
    const res = await deadline(
      client.callTool({
        name: "search_engine",
        arguments: { query, engine: "google" },
      }),
      SEARCH_TIMEOUT_MS,
      "MCP search_engine",
    );
    const text = res.content?.find((c) => c.type === "text")?.text ?? "";
    return parseSearchText(text, query);
  } catch (err) {
    console.warn("[london] mcpSearchEngine failed:", (err as Error).message);
    return null;
  }
}

/**
 * Fetch a page as markdown via the Bright Data MCP `scrape_as_markdown` tool.
 */
export async function mcpScrapeAsMarkdown(
  url: string,
): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;

  try {
    const res = await deadline(
      client.callTool({
        name: "scrape_as_markdown",
        arguments: { url },
      }),
      SCRAPE_TIMEOUT_MS,
      "MCP scrape_as_markdown",
    );
    return res.content?.find((c) => c.type === "text")?.text ?? null;
  } catch (err) {
    console.warn("[london] mcpScrapeAsMarkdown failed:", (err as Error).message);
    return null;
  }
}

// The MCP search tool returns markdown/JSON-ish text depending on engine; this
// extracts a best-effort list of {title,url,snippet}. Resilient by design.
function parseSearchText(text: string, query: string): SerpResult[] {
  const results: SerpResult[] = [];

  // Try JSON first (some Bright Data responses are structured).
  try {
    const parsed = JSON.parse(text);
    const organic = parsed.organic ?? parsed.results ?? [];
    for (const r of organic) {
      if (r.link || r.url) {
        results.push({
          title: r.title ?? r.name ?? "Untitled",
          url: r.link ?? r.url,
          snippet: r.description ?? r.snippet ?? "",
        });
      }
    }
    if (results.length) return results;
  } catch {
    /* not JSON — fall through to markdown parsing */
  }

  // Markdown link extraction as a fallback: [title](url)
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(text)) !== null && results.length < 12) {
    results.push({ title: m[1], url: m[2], snippet: "" });
  }

  if (!results.length) {
    results.push({
      title: `Search results for "${query}"`,
      url: "",
      snippet: text.slice(0, 240),
    });
  }
  return results;
}
