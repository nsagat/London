import { randomUUID } from "node:crypto";
import { runBrightDataPipeline, searchWithBrightDataSerp, isLive } from "./brightdata";
import { runExtraction } from "./ai-intelligence";

// ─────────────────────────────────────────────────────────────────────────────
// Watchlist + change detection — London's "always-on" layer.
//
// A watch is a saved monitoring target (a competitor company, or a market
// vertical). London re-scans it on an interval, DIFFS each scan against what it
// has already seen, and records only the genuinely NEW signals as change events.
// This turns the on-demand pipeline into continuous, real-time GTM monitoring.
//
// In-memory + globalThis-backed (shared across route bundles and the boot
// scheduler). No DB for the MVP.
// ─────────────────────────────────────────────────────────────────────────────

export type WatchType = "competitor" | "vertical";

export interface WatchItem {
  signature: string;
  company: string;
  signal: string;
  evidence: string;
  source: string;
  confidence: number;
  url?: string;
  firstSeen: string;
}

export interface ChangeEvent {
  at: string;
  type: "new_signal";
  item: WatchItem;
}

export interface Watch {
  id: string;
  type: WatchType;
  target: string;
  label: string;
  intervalMinutes: number;
  createdAt: string;
  lastScanAt?: string;
  nextScanAt?: string;
  items: WatchItem[];
  events: ChangeEvent[];
  seen: Set<string>;
  scanning: boolean;
}

interface WatchState {
  watches: Map<string, Watch>;
  schedulerStarted: boolean;
}

const g = globalThis as unknown as { __londonWatch?: WatchState };
const state: WatchState =
  g.__londonWatch ?? (g.__londonWatch = { watches: new Map(), schedulerStarted: false });

const MIN_INTERVAL = 2; // minutes — guard against hammering Bright Data
const DEFAULT_INTERVAL = 30;

// ── Public API ───────────────────────────────────────────────────────────────

export async function createWatch(input: {
  type: WatchType;
  target: string;
  intervalMinutes?: number;
}): Promise<Watch> {
  const now = new Date().toISOString();
  const interval = Math.max(MIN_INTERVAL, input.intervalMinutes ?? DEFAULT_INTERVAL);
  const watch: Watch = {
    id: randomUUID(),
    type: input.type,
    target: input.target.trim(),
    label:
      input.type === "competitor"
        ? `Competitor: ${input.target.trim()}`
        : `Market: ${input.target.trim()}`,
    intervalMinutes: interval,
    createdAt: now,
    items: [],
    events: [],
    seen: new Set(),
    scanning: false,
  };
  state.watches.set(watch.id, watch);

  // Seed the baseline (initial items are NOT change events — they're the
  // starting state; only signals that appear in later scans are "new").
  await scanWatch(watch, { seedBaseline: true });
  return watch;
}

export function listWatches(): WatchSummary[] {
  return [...state.watches.values()].map(summarize);
}

export function getWatch(id: string): Watch | undefined {
  return state.watches.get(id);
}

export function deleteWatch(id: string): boolean {
  return state.watches.delete(id);
}

/** Re-scan a watch now and return only the newly detected change events. */
export async function scanWatch(
  watch: Watch,
  opts: { seedBaseline?: boolean } = {},
): Promise<ChangeEvent[]> {
  if (watch.scanning) return [];
  watch.scanning = true;
  try {
    const fresh = await fetchItems(watch);
    const now = new Date().toISOString();
    const newEvents: ChangeEvent[] = [];

    for (const item of fresh) {
      if (watch.seen.has(item.signature)) continue;
      watch.seen.add(item.signature);
      item.firstSeen = now;
      watch.items.push(item);
      if (!opts.seedBaseline) {
        newEvents.push({ at: now, type: "new_signal", item });
      }
    }

    watch.events.push(...newEvents);
    watch.lastScanAt = now;
    watch.nextScanAt = new Date(Date.now() + watch.intervalMinutes * 60_000).toISOString();
    return newEvents;
  } finally {
    watch.scanning = false;
  }
}

export async function scanWatchById(id: string): Promise<ChangeEvent[] | null> {
  const w = state.watches.get(id);
  if (!w) return null;
  return scanWatch(w);
}

// ── Scanning + diff internals ────────────────────────────────────────────────

async function fetchItems(watch: Watch): Promise<WatchItem[]> {
  if (watch.type === "competitor") {
    const serp = await searchWithBrightDataSerp(
      `${watch.target} pricing OR hiring OR launches OR announces OR partnership news`,
    );
    const extraction = await runExtraction(
      serp.map((c) => ({ title: c.title, snippet: c.snippet, url: c.url })),
      10,
    );
    return extraction.results.map((r) =>
      mkItem(watch.target, r.signal, r.evidence, r.source, r.confidence, r.url),
    );
  }

  // vertical — bypass the cache so each scan reflects fresh live web data.
  const out = await runBrightDataPipeline(
    `Find ${watch.target} with recent funding, hiring, or launch signals`,
    { bypassCache: true },
  );
  return out.results.map((r) =>
    mkItem(r.company, r.signal, r.evidence, r.source, r.confidence, r.url),
  );
}

function mkItem(
  company: string,
  signal: string,
  evidence: string,
  source: string,
  confidence: number,
  url?: string,
): WatchItem {
  return {
    signature: signatureOf(company, signal),
    company,
    signal,
    evidence,
    source,
    confidence,
    url,
    firstSeen: "",
  };
}

// A signal is "the same" if it's the same company + same signal type. New
// companies (or a new signal type for a known company) count as new signals.
function signatureOf(company: string, signal: string): string {
  const c = company.toLowerCase().trim();
  const s = signal.toLowerCase().replace(/[^a-z]/g, "").slice(0, 24);
  return `${c}|${s}`;
}

// ── Serialization (Set isn't JSON-safe) ──────────────────────────────────────

export interface WatchSummary {
  id: string;
  type: WatchType;
  target: string;
  label: string;
  intervalMinutes: number;
  createdAt: string;
  lastScanAt?: string;
  nextScanAt?: string;
  itemCount: number;
  changeCount: number;
}

export function summarize(w: Watch): WatchSummary {
  return {
    id: w.id,
    type: w.type,
    target: w.target,
    label: w.label,
    intervalMinutes: w.intervalMinutes,
    createdAt: w.createdAt,
    lastScanAt: w.lastScanAt,
    nextScanAt: w.nextScanAt,
    itemCount: w.items.length,
    changeCount: w.events.length,
  };
}

export function serializeWatch(w: Watch) {
  return {
    ...summarize(w),
    items: w.items,
    events: [...w.events].reverse(), // newest first
  };
}

// ── Background scheduler ──────────────────────────────────────────────────────

/**
 * Start the always-on scheduler: every tick, re-scan any watch whose nextScanAt
 * is due. Idempotent (guards against duplicate intervals across HMR / bundles).
 */
export function startWatchScheduler(): void {
  if (state.schedulerStarted || !isLive()) return;
  state.schedulerStarted = true;

  const TICK_MS = 60_000; // check every minute
  const timer = setInterval(async () => {
    const now = Date.now();
    for (const w of state.watches.values()) {
      if (w.scanning) continue;
      if (w.nextScanAt && new Date(w.nextScanAt).getTime() <= now) {
        scanWatch(w).catch(() => {
          /* best-effort background scan */
        });
      }
    }
  }, TICK_MS);
  // Don't keep the process alive solely for the scheduler.
  if (typeof timer.unref === "function") timer.unref();
}
