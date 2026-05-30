// ─────────────────────────────────────────────────────────────────────────────
// Tiny in-memory cache for demo reliability.
//
// Two jobs:
//   1. `getCached`/`setCached` — short-TTL cache so repeated queries (and the
//      scripted demo prompt) return instantly instead of re-running the live
//      pipeline every time.
//   2. `getLastGood`/`setLastGood` — the most recent SUCCESSFUL live result per
//      pipeline. If a live run flakes (network blip, SERP returns junk, scrape
//      times out), we serve the last real Bright Data result instead of falling
//      all the way back to static demo data — so the stage demo never breaks.
//
// Process-local and ephemeral by design; no persistence needed for the MVP.
// ─────────────────────────────────────────────────────────────────────────────

interface Entry<T> {
  value: T;
  expires: number;
}

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

const store = new Map<string, Entry<unknown>>();
const lastGood = new Map<string, unknown>();

export function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function getLastGood<T>(bucket: string): T | null {
  return (lastGood.get(bucket) as T) ?? null;
}

export function setLastGood<T>(bucket: string, value: T): void {
  lastGood.set(bucket, value);
}
