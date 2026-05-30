import type { IntelligenceLayer, TraceStep } from "./types";
import {
  isLive,
  runBrightDataPipeline,
  searchWithBrightDataSerp,
} from "./brightdata";
import { runExtraction } from "./ai-intelligence";
import { recommendGtmStack } from "./recommend";
import {
  createWatch,
  scanWatchById,
  getWatch,
  serializeWatch,
  type WatchType,
} from "./watch";

// ─────────────────────────────────────────────────────────────────────────────
// London GTM Intelligence tool catalog.
//
// London is the unified, agent-native API for Bright Data–powered GTM
// intelligence: a catalog of discrete tools any agent can DISCOVER, CALL, and
// METER through one HTTP/MCP surface — without ever touching Bright Data
// credentials. Each tool is backed by the live Bright Data pipeline and declares
// its input schema, the Bright Data products it uses, and a per-call credit cost.
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolResult {
  dataSource: "live" | "demo";
  intelligenceLayer: IntelligenceLayer;
  data: unknown;
  trace?: TraceStep[];
}

export interface GtmTool {
  id: string;
  name: string;
  category: string;
  description: string;
  brightDataTools: string[];
  /** Credits charged per call (see lib/metering.ts). */
  unitCost: number;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v.trim() : fallback;
const num = (v: unknown, fallback: number): number =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;

const source = (): "live" | "demo" => (isLive() ? "live" : "demo");

// ── Tool catalog ─────────────────────────────────────────────────────────────

export const CATALOG: GtmTool[] = [
  {
    id: "discover_companies",
    name: "Discover Companies",
    category: "Prospecting",
    description:
      "Find companies matching a target profile from the live web (e.g. 'AI security startups in the US'). Returns a lightweight list of candidate accounts.",
    brightDataTools: ["SERP API", "Web Unlocker"],
    unitCost: 3,
    inputSchema: {
      type: "object",
      properties: {
        vertical: { type: "string", description: "Target market / segment." },
        location: { type: "string", description: "Optional geography." },
        limit: { type: "number", description: "Max companies (default 10)." },
      },
      required: ["vertical"],
    },
    async handler(args) {
      const vertical = str(args.vertical);
      const location = str(args.location);
      const limit = num(args.limit, 10);
      const task = `Find ${vertical}${location ? ` in ${location}` : ""} companies`;
      const out = await runBrightDataPipeline(task);
      return {
        dataSource: out.liveMode ? "live" : "demo",
        intelligenceLayer: out.intelligenceLayer,
        trace: out.trace,
        data: {
          companies: out.results.slice(0, limit).map((r) => ({
            company: r.company,
            signal: r.signal,
            source: r.source,
            url: r.url,
          })),
        },
      };
    },
  },
  {
    id: "find_account_signals",
    name: "Find Account Signals",
    category: "Buying Signals",
    description:
      "Discover accounts and live buying signals (hiring, funding, product launch, partnership) with evidence, confidence, outbound angle, source, and tool trace.",
    brightDataTools: ["SERP API", "Web Unlocker", "Web Scraper API"],
    unitCost: 5,
    inputSchema: {
      type: "object",
      properties: {
        vertical: { type: "string", description: "Target market / segment." },
        signals: {
          type: "array",
          items: {
            type: "string",
            enum: ["hiring", "funding", "product_launch", "partnership"],
          },
        },
        location: { type: "string" },
        limit: { type: "number", description: "Max accounts (default 10)." },
      },
      required: ["vertical"],
    },
    async handler(args) {
      const vertical = str(args.vertical);
      const location = str(args.location);
      const signals = Array.isArray(args.signals) ? (args.signals as string[]) : [];
      const limit = num(args.limit, 10);
      const phrase = signals.length
        ? ` with recent ${signals.join(", ").replace(/_/g, " ")} signals`
        : " with recent hiring or funding signals";
      const task = `Find ${vertical}${location ? ` in ${location}` : ""}${phrase} and suggest outbound angles.`;
      const out = await runBrightDataPipeline(task);
      return {
        dataSource: out.liveMode ? "live" : "demo",
        intelligenceLayer: out.intelligenceLayer,
        trace: out.trace,
        data: { results: out.results.slice(0, limit) },
      };
    },
  },
  {
    id: "enrich_account",
    name: "Enrich Account",
    category: "Data Enrichment",
    description:
      "Deep-enrich a single company from the live web: recent signals (funding, hiring, launches), evidence, and source pages. Pass a company name (and optional domain).",
    brightDataTools: ["SERP API", "Web Unlocker"],
    unitCost: 4,
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name to enrich." },
        domain: { type: "string", description: "Optional company domain." },
      },
      required: ["company"],
    },
    async handler(args) {
      const company = str(args.company);
      const domain = str(args.domain);
      const query = `${company} ${domain} funding OR hiring OR launch OR pricing OR "Series" OR careers`;
      const serp = await searchWithBrightDataSerp(query);
      const token = company.toLowerCase().split(/\s+/)[0];
      const relevant = serp.filter(
        (r) =>
          r.title.toLowerCase().includes(token) ||
          (r.snippet ?? "").toLowerCase().includes(token),
      );
      const extraction = await runExtraction(
        (relevant.length ? relevant : serp).map((c) => ({
          title: c.title,
          snippet: c.snippet,
          url: c.url,
        })),
        6,
      );
      return {
        dataSource: source(),
        intelligenceLayer: extraction.layer,
        data: {
          company,
          domain: domain || undefined,
          signals: extraction.results,
          sources: serp.slice(0, 5).map((s) => ({ title: s.title, url: s.url })),
        },
      };
    },
  },
  {
    id: "monitor_competitor",
    name: "Monitor Competitor",
    category: "Competitive Intelligence",
    description:
      "Track a competitor's recent moves from the live web — pricing changes, hiring, product launches, and announcements — as dated signals with sources.",
    brightDataTools: ["SERP API", "Web Unlocker", "Scraping Browser"],
    unitCost: 4,
    inputSchema: {
      type: "object",
      properties: {
        competitor: { type: "string", description: "Competitor company name." },
      },
      required: ["competitor"],
    },
    async handler(args) {
      const competitor = str(args.competitor);
      const query = `${competitor} pricing OR hiring OR launches OR announces OR partnership news`;
      const serp = await searchWithBrightDataSerp(query);
      const extraction = await runExtraction(
        serp.map((c) => ({ title: c.title, snippet: c.snippet, url: c.url })),
        8,
      );
      // Frame results as competitor "moves".
      const moves = extraction.results.map((r) => ({
        move: r.signal,
        detail: r.evidence,
        confidence: r.confidence,
        source: r.source,
        url: r.url,
      }));
      return {
        dataSource: source(),
        intelligenceLayer: extraction.layer,
        data: { competitor, moves },
      };
    },
  },
  {
    id: "recommend_gtm_stack",
    name: "Recommend GTM Stack",
    category: "GTM Strategy",
    description:
      "Turn a company description (type, market, goal, budget) into a recommended, budget-aware stack of GTM agents with an evaluation trace and summary metrics.",
    brightDataTools: ["SERP API", "Web Unlocker"],
    unitCost: 2,
    inputSchema: {
      type: "object",
      properties: {
        companyPrompt: {
          type: "string",
          description: "Company, goals, target market, and budget.",
        },
      },
      required: ["companyPrompt"],
    },
    async handler(args) {
      const companyPrompt = str(args.companyPrompt);
      const rec = await recommendGtmStack({ companyPrompt });
      return {
        dataSource: rec.dataSource,
        intelligenceLayer: rec.intelligenceLayer,
        trace: rec.trace,
        data: rec,
      };
    },
  },
  {
    id: "create_watch",
    name: "Create Watch",
    category: "Always-on Monitoring",
    description:
      "Start continuously monitoring a competitor or a market vertical. London re-scans on an interval and detects NEW signals over time. Returns the watch id and the seeded baseline.",
    brightDataTools: ["SERP API", "Web Unlocker"],
    unitCost: 2,
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["competitor", "vertical"],
          description: "Monitor a specific company ('competitor') or a market ('vertical').",
        },
        target: {
          type: "string",
          description: "Company name (competitor) or market phrase (vertical).",
        },
        intervalMinutes: {
          type: "number",
          description: "Re-scan interval in minutes (min 2, default 30).",
        },
      },
      required: ["type", "target"],
    },
    async handler(args) {
      const type = str(args.type) as WatchType;
      if (type !== "competitor" && type !== "vertical") {
        throw new Error("type must be 'competitor' or 'vertical'");
      }
      const target = str(args.target);
      if (!target) throw new Error("target is required");
      const watch = await createWatch({
        type,
        target,
        intervalMinutes: num(args.intervalMinutes, 30),
      });
      return {
        dataSource: source(),
        intelligenceLayer: "heuristic",
        data: { watchId: watch.id, ...serializeWatch(watch) },
      };
    },
  },
  {
    id: "check_watch",
    name: "Check Watch",
    category: "Always-on Monitoring",
    description:
      "Re-scan a watch now and return any NEW signals detected since the last scan, plus the current monitored state.",
    brightDataTools: ["SERP API", "Web Unlocker"],
    unitCost: 3,
    inputSchema: {
      type: "object",
      properties: {
        watchId: { type: "string", description: "The watch id to check." },
        scan: {
          type: "boolean",
          description: "Re-scan before returning (default true).",
        },
      },
      required: ["watchId"],
    },
    async handler(args) {
      const watchId = str(args.watchId);
      const doScan = args.scan !== false;
      const newEvents = doScan ? ((await scanWatchById(watchId)) ?? []) : [];
      const watch = getWatch(watchId);
      if (!watch) throw new Error("watch not found");
      return {
        dataSource: source(),
        intelligenceLayer: "heuristic",
        data: {
          newSignals: newEvents.map((e) => e.item),
          newCount: newEvents.length,
          ...serializeWatch(watch),
        },
      };
    },
  },
];

export function getTool(name: string): GtmTool | undefined {
  const key = name.toLowerCase();
  return CATALOG.find((t) => t.id === key || t.name.toLowerCase() === key);
}

/** Public catalog metadata (no handlers) — what `GET /api/tools` returns. */
export function catalogManifest() {
  return CATALOG.map(({ handler: _handler, ...meta }) => meta);
}
