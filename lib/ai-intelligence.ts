import type { AccountResult } from "./types";
import {
  extractSignals,
  type ExtractorInput,
} from "./extractor";
import {
  AIML_MODEL,
  aimlChat,
  isAimlConfigured,
  parseJsonLoose,
} from "./aimlapi";

// ─────────────────────────────────────────────────────────────────────────────
// London's intelligence layer.
//
// Combines Bright Data's live web evidence with AI reasoning (via AI/ML API) to
// produce structured account intelligence and actionable briefs. When AI/ML API
// is not configured (or fails), it transparently falls back to the deterministic
// heuristic extractor so output shape and the app are unaffected.
// ─────────────────────────────────────────────────────────────────────────────

export type IntelligenceLayer = "aiml" | "heuristic";

export interface ExtractionOutput {
  results: AccountResult[];
  layer: IntelligenceLayer;
  /** Tool label for the execution trace (names the model when AI is used). */
  toolLabel: string;
}

const HEURISTIC_LABEL = "LLM Signal Extractor (heuristic)";

/**
 * Extract ranked account intelligence from web candidates. Tries AI/ML API
 * first; falls back to heuristics on any miss.
 */
export async function runExtraction(
  inputs: ExtractorInput[],
  limit: number,
): Promise<ExtractionOutput> {
  if (isAimlConfigured()) {
    const ai = await extractWithAI(inputs, limit);
    if (ai && ai.length) {
      return {
        results: ai,
        layer: "aiml",
        toolLabel: `AI/ML API · ${AIML_MODEL}`,
      };
    }
  }
  return {
    results: extractSignals(inputs).slice(0, limit),
    layer: "heuristic",
    toolLabel: HEURISTIC_LABEL,
  };
}

interface AiAccount {
  company?: string;
  signal?: string;
  evidence?: string;
  confidence?: number;
  outboundAngle?: string;
  source?: string;
  url?: string;
}

async function extractWithAI(
  inputs: ExtractorInput[],
  limit: number,
): Promise<AccountResult[] | null> {
  // Keep the prompt bounded for latency + credits.
  const candidates = inputs.slice(0, 14).map((c, i) => ({
    id: i,
    title: c.title,
    snippet: (c.snippet ?? "").slice(0, 320),
    url: c.url ?? "",
    page: (c.pageText ?? "").slice(0, 700),
  }));

  const system =
    "You are a B2B GTM intelligence analyst. From raw web search results, identify INDIVIDUAL companies (never listicles, job boards, news outlets, or directories) and the concrete buying signal each shows: funding, hiring (GTM/sales), product launch, or partnership. Ground every field in the provided text — do not invent facts. Respond with strict JSON only.";

  const user = `Return JSON of the form {"accounts":[{"company","signal","evidence","confidence","outboundAngle","source","url"}]}.
Rules:
- "company": the real company name only (e.g. "RunSybil", not "AI security startup RunSybil").
- "signal": one short phrase describing the buying signal.
- "evidence": a short quote/paraphrase from the text supporting the signal.
- "confidence": 0.0–1.0.
- "outboundAngle": one sentence a seller could open with.
- "source": e.g. "News result", "Careers page", "Product page".
- "url": the candidate's url.
- Skip results that are not a single identifiable company. Return up to ${limit} of the strongest, de-duplicated by company.

Candidates:
${JSON.stringify(candidates)}`;

  const content = await aimlChat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, maxTokens: 1800, temperature: 0.1 },
  );

  const parsed = parseJsonLoose<{ accounts?: AiAccount[] }>(content);
  const accounts = parsed?.accounts;
  if (!Array.isArray(accounts) || !accounts.length) return null;

  return accounts
    .filter((a) => a.company && a.signal)
    .slice(0, limit)
    .map((a, i) => ({
      rank: i + 1,
      company: String(a.company).slice(0, 60),
      signal: String(a.signal).slice(0, 80),
      evidence: String(a.evidence ?? "").slice(0, 220),
      confidence: clampConfidence(a.confidence),
      outboundAngle: String(a.outboundAngle ?? "").slice(0, 200),
      source: String(a.source ?? "Web result").slice(0, 40),
      url: a.url || undefined,
    }));
}

/**
 * Enrich the top accounts with an AI-generated brief + a personalized outbound
 * email, grounded in the live web evidence. No-op when AI/ML API is unconfigured.
 */
export async function enrichWithBriefs(
  accounts: AccountResult[],
  limit = 3,
): Promise<AccountResult[]> {
  if (!isAimlConfigured() || !accounts.length) return accounts;

  const top = accounts.slice(0, limit).map((a) => ({
    company: a.company,
    signal: a.signal,
    evidence: a.evidence,
    url: a.url ?? "",
  }));

  const system =
    "You are an SDR assistant. For each account, write a concise 2-sentence intelligence brief and a short, specific cold outbound email (<=90 words) that references the company's signal. Be concrete, no fluff. Respond with strict JSON only.";

  const user = `Return JSON {"briefs":[{"company","brief","outboundEmail"}]} for these accounts:
${JSON.stringify(top)}`;

  const content = await aimlChat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, maxTokens: 1600, temperature: 0.4 },
  );

  const parsed = parseJsonLoose<{
    briefs?: { company?: string; brief?: string; outboundEmail?: string }[];
  }>(content);
  if (!parsed?.briefs?.length) return accounts;

  const byCompany = new Map(
    parsed.briefs
      .filter((b) => b.company)
      .map((b) => [String(b.company).toLowerCase(), b]),
  );

  return accounts.map((a) => {
    const b = byCompany.get(a.company.toLowerCase());
    return b
      ? {
          ...a,
          brief: b.brief?.slice(0, 400),
          outboundEmail: b.outboundEmail?.slice(0, 700),
        }
      : a;
  });
}

function clampConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0.8;
  const c = n > 1 ? n / 100 : n; // tolerate 0–100 scale
  return Math.max(0.5, Math.min(0.99, Math.round(c * 100) / 100));
}
