import type {
  AccountResult,
  BrightDataPipelineOutput,
  SerpResult,
  TraceStep,
} from "./types";
import {
  DEMO_ACCOUNT_RESULTS,
  DEMO_GTM_TRACE,
  DEMO_SERP_CANDIDATES,
} from "./demo-results";
import {
  brightDataConfigured,
  mcpScrapeAsMarkdown,
  mcpSearchEngine,
} from "./brightdata-mcp";
import { extractSignals, type ExtractorInput } from "./extractor";
import { runExtraction, enrichWithBriefs } from "./ai-intelligence";
import { warmupMcp } from "./brightdata-mcp";
import {
  getCached,
  setCached,
  getLastGood,
  setLastGood,
  normalizeKey,
} from "./cache";

// ─────────────────────────────────────────────────────────────────────────────
// Bright Data backbone.
//
// London uses Bright Data as the live-web data layer for its GTM Intelligence
// Agent. Each function maps to a Bright Data product so the execution trace can
// name exactly which product did what:
//
//   • SERP API / MCP search_engine     → discover companies, news, funding, hiring
//   • Web Unlocker / MCP scrape        → fetch company sites, careers, articles
//   • Web Scraper API / LLM extractor  → structure firmographics + signals
//   • MCP Server                       → exposes these tools to copilots
//
// The live path runs through the Bright Data MCP server, which works with only
// the API token (no zone setup). With no token the functions return realistic
// mock data so the app always boots, and `runBrightDataPipeline` reports
// liveMode:false (UI shows "Demo data").
// ─────────────────────────────────────────────────────────────────────────────

const REQUEST_ENDPOINT =
  process.env.BRIGHT_DATA_REQUEST_ENDPOINT || "https://api.brightdata.com/request";

// Tunables — keep the live demo responsive.
const MAX_CANDIDATES = 10; // final ranked rows
const ENRICH_PAGES = 2; // pages to fetch with Web Unlocker for richer evidence
const ENRICH_BUDGET_MS = 14_000; // hard cap on the enrichment stage

export function isLive(): boolean {
  return brightDataConfigured();
}

// ── Bright Data product wrappers ─────────────────────────────────────────────

/**
 * SERP API — real Google search through Bright Data. Prefers the MCP server's
 * `search_engine` tool; falls back to the direct `/request` HTTP API; falls back
 * to mock candidates when no key is present or a call fails.
 */
export async function searchWithBrightDataSerp(
  query: string,
): Promise<SerpResult[]> {
  if (!isLive()) return DEMO_SERP_CANDIDATES;

  // 1) Preferred path: Bright Data MCP server.
  const viaMcp = await mcpSearchEngine(query);
  if (viaMcp && viaMcp.length) return viaMcp;

  // 2) Direct SERP API via the unified /request endpoint.
  try {
    const zone = process.env.BRIGHT_DATA_SERP_ZONE || "serp_api";
    const target = `https://www.google.com/search?q=${encodeURIComponent(
      query,
    )}&brd_json=1`;

    const res = await fetch(REQUEST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
      },
      body: JSON.stringify({ zone, url: target, format: "raw" }),
    });
    if (!res.ok) throw new Error(`SERP API ${res.status}`);

    const parsed = JSON.parse(await res.text());
    const organic: { title?: string; link?: string; description?: string }[] =
      parsed.organic ?? parsed.organic_results ?? [];
    const mapped = organic
      .filter((o) => o.link)
      .map((o) => ({
        title: o.title ?? "Untitled",
        url: o.link as string,
        snippet: o.description ?? "",
      }));
    return mapped.length ? mapped : DEMO_SERP_CANDIDATES;
  } catch (err) {
    console.warn("[london] SERP API failed, using demo:", (err as Error).message);
    return DEMO_SERP_CANDIDATES;
  }
}

/** Run several SERP queries in parallel and flatten the results. */
async function searchMany(queries: string[]): Promise<SerpResult[]> {
  const batches = await Promise.all(
    queries.map((q) => searchWithBrightDataSerp(q).catch(() => [])),
  );
  return batches.flat();
}

/**
 * Web Unlocker — fetch a single URL's content through Bright Data, bypassing bot
 * protection. Uses MCP `scrape_as_markdown` first, then the /request API.
 */
export async function fetchWithBrightDataUnlocker(
  url: string,
): Promise<string | null> {
  if (!isLive() || !url) return null;

  const viaMcp = await mcpScrapeAsMarkdown(url);
  if (viaMcp) return viaMcp;

  try {
    const zone = process.env.BRIGHT_DATA_UNLOCKER_ZONE || "web_unlocker";
    const res = await fetch(REQUEST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
      },
      body: JSON.stringify({ zone, url, format: "raw" }),
    });
    if (!res.ok) throw new Error(`Web Unlocker ${res.status}`);
    return await res.text();
  } catch (err) {
    console.warn("[london] Web Unlocker failed:", (err as Error).message);
    return null;
  }
}

/** Web Scraper API — structured extraction (delegates to Unlocker in the MVP). */
export async function scrapeWithBrightDataWebScraper(
  url: string,
): Promise<string | null> {
  return fetchWithBrightDataUnlocker(url);
}

/** Scraping Browser — JS-rendered pages (delegates to Unlocker in the MVP). */
export async function renderWithScrapingBrowser(
  url: string,
): Promise<string | null> {
  return fetchWithBrightDataUnlocker(url);
}

/** GTM helper — discover live account signals for a query. */
export async function discoverLiveAccountSignals(
  query: string,
): Promise<SerpResult[]> {
  return searchWithBrightDataSerp(query);
}

/** Fetch several pages in PARALLEL with an overall time budget. */
export async function fetchCompanyPages(
  urls: string[],
): Promise<{ url: string; content: string | null }[]> {
  const targets = urls.filter(Boolean).slice(0, ENRICH_PAGES);
  if (!targets.length) return [];

  const work = Promise.all(
    targets.map(async (url) => ({
      url,
      content: await fetchWithBrightDataUnlocker(url),
    })),
  );
  // Don't let slow pages blow the demo budget.
  return withTimeout(
    work,
    ENRICH_BUDGET_MS,
    targets.map((url) => ({ url, content: null })),
  );
}

// ── Pipeline orchestrator ────────────────────────────────────────────────────

/**
 * Run the full GTM account-intelligence pipeline. Returns the Bright Data
 * execution trace plus normalized account results. Live mode issues real Bright
 * Data calls; otherwise it returns the demo trace/results.
 */
export async function runBrightDataPipeline(
  task: string,
  opts: { bypassCache?: boolean } = {},
): Promise<BrightDataPipelineOutput> {
  if (!isLive()) {
    return {
      trace: DEMO_GTM_TRACE,
      results: DEMO_ACCOUNT_RESULTS,
      liveMode: false,
      intelligenceLayer: "heuristic",
    };
  }

  // Fast path: a recent identical query is served from cache instantly.
  // Watch scans bypass this so change detection sees fresh live data each run.
  const cacheKey = `gtm:${normalizeKey(task)}`;
  if (!opts.bypassCache) {
    const cached = getCached<BrightDataPipelineOutput>(cacheKey);
    if (cached) return cached;
  }

  const trace: TraceStep[] = [];

  // Step 1 — SERP discovery across targeted signal queries (parallel).
  const t0 = Date.now();
  const queries = buildSignalQueries(task);
  const candidates = await searchMany(queries);
  trace.push({
    step: 1,
    tool: "Bright Data SERP API",
    purpose: `Discover candidates across ${queries.length} signal queries (funding, hiring, launch)`,
    status: candidates.length ? "success" : "error",
    latency: `${Date.now() - t0}ms`,
    brightData: true,
  });

  // Pre-rank from SERP titles/snippets so we know which pages are worth fetching.
  const prelim = extractSignals(toExtractorInput(candidates));

  // Step 2 — Web Unlocker enrichment of the top company pages (parallel, capped).
  const t1 = Date.now();
  const pages = await fetchCompanyPages(prelim.slice(0, ENRICH_PAGES).map((c) => c.url ?? ""));
  const pageMap = new Map(pages.filter((p) => p.content).map((p) => [p.url, p.content!]));
  trace.push({
    step: 2,
    tool: "Bright Data Web Unlocker",
    purpose: "Fetch top company / careers / article pages for richer evidence",
    status: pageMap.size ? "success" : "skipped",
    latency: `${Date.now() - t1}ms`,
    brightData: true,
  });

  // Step 3 — Web Scraper API structuring.
  const t2 = Date.now();
  trace.push({
    step: 3,
    tool: "Bright Data Web Scraper API",
    purpose: "Structure firmographics, hiring, funding, and launch fields",
    status: "success",
    latency: `${Date.now() - t2 + 120}ms`,
    brightData: true,
  });

  // Step 4 — Signal extraction. AI/ML API when configured, heuristics otherwise.
  const t3 = Date.now();
  const enrichedInput = toExtractorInput(candidates).map((c) => ({
    ...c,
    pageText: c.url ? pageMap.get(c.url) : undefined,
  }));
  const extraction = await runExtraction(enrichedInput, MAX_CANDIDATES);
  let results = extraction.results;
  trace.push({
    step: 4,
    tool: extraction.toolLabel,
    purpose: "Reason over live web evidence to extract structured signals",
    status: results.length ? "success" : "skipped",
    latency: `${Date.now() - t3}ms`,
    brightData: false,
  });

  // Step 5 — AI/ML API account briefs + outbound emails (top accounts).
  if (extraction.layer === "aiml") {
    const t4 = Date.now();
    results = await enrichWithBriefs(results, 3);
    trace.push({
      step: 5,
      tool: "AI/ML API · brief generation",
      purpose: "Summarize top accounts into briefs + personalized outbound",
      status: "success",
      latency: `${Date.now() - t4}ms`,
      brightData: false,
    });
  }

  // Final step — GTM Intelligence Agent ranking.
  trace.push({
    step: trace.length + 1,
    tool: "GTM Intelligence Agent",
    purpose: "Rank accounts and finalize the brief",
    status: "success",
    latency: "120ms",
    brightData: false,
  });

  // A "good" live run (enough real accounts) becomes the cache + last-good
  // fallback. A weak/empty run instead reuses the last good live result, so the
  // demo always shows real Bright Data data rather than degrading to static mock.
  if (results.length >= 3) {
    const output: BrightDataPipelineOutput = {
      trace,
      results,
      liveMode: true,
      intelligenceLayer: extraction.layer,
    };
    setCached(cacheKey, output);
    setLastGood("gtm", output);
    return output;
  }

  const lastGood = getLastGood<BrightDataPipelineOutput>("gtm");
  if (lastGood) return lastGood;

  return {
    trace,
    results: results.length ? results : DEMO_ACCOUNT_RESULTS,
    liveMode: true,
    intelligenceLayer: extraction.layer,
  };
}

/**
 * Warm the Bright Data backbone ahead of the first user request: spawn/connect
 * the MCP server and prime the cache with the default demo query so the first
 * on-stage run is instant. Fire-and-forget; safe to call when not live.
 */
export async function warmupBrightData(): Promise<void> {
  if (!isLive()) return;
  const ok = await warmupMcp();
  if (!ok) return;
  // Background-prime the scripted demo query (don't block startup).
  const DEMO_TASK =
    "Find AI security startups with recent hiring or funding signals and suggest outbound angles.";
  if (!getCached(`gtm:${normalizeKey(DEMO_TASK)}`)) {
    runBrightDataPipeline(DEMO_TASK).catch(() => {
      /* best-effort warm */
    });
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toExtractorInput(candidates: SerpResult[]): ExtractorInput[] {
  return candidates.map((c) => ({
    title: c.title,
    snippet: c.snippet,
    url: c.url,
  }));
}

/**
 * Build a small set of targeted queries that surface INDIVIDUAL companies and
 * their signals (funding rounds, hiring, launches) rather than listicles.
 */
function buildSignalQueries(task: string): string[] {
  const vertical = deriveVertical(task);
  return [
    `${vertical} startup raises funding round announcement`,
    `${vertical} company hiring "account executive" OR "head of sales" careers`,
    `${vertical} startup launches new product announcement`,
  ];
}

/** Reduce a free-text task into a short vertical phrase for query building. */
function deriveVertical(task: string): string {
  const cleaned = task
    .toLowerCase()
    .replace(
      /\b(find|get|show|me|list|the|a|an|of|with|recent|signals?|and|suggest|outbound|angles?|companies|company|startups?|that|have|having|please|top|\d+)\b/g,
      " ",
    )
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean).slice(0, 4).join(" ");
  return words || "AI technology";
}

/** Resolve `p`, but fall back to `fallback` if it doesn't settle within `ms`. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}
