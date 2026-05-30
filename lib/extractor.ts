import type { AccountResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// LLM Signal Extractor (heuristic edition).
//
// Turns raw web candidates (SERP title + snippet, plus optional scraped page
// text from Web Unlocker) into ranked, structured account intelligence: a real
// company name, a classified signal, supporting evidence, a confidence score,
// an outbound angle, and a source label.
//
// Deterministic and dependency-free — no LLM API key or cost. The interface is
// intentionally narrow so it could later be swapped for a model-backed extractor
// without touching the pipeline.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtractorInput {
  title: string;
  snippet?: string;
  url?: string;
  pageText?: string;
}

type SignalType = "funding" | "hiring" | "launch" | "partnership" | "presence";

interface SignalDef {
  label: string;
  source: string;
  angle: string;
  re: RegExp;
  weight: number;
}

const SIGNALS: Record<Exclude<SignalType, "presence">, SignalDef> = {
  funding: {
    label: "Recent funding signal",
    source: "News result",
    angle: "Position around post-funding GTM acceleration and headcount ramp.",
    re: /\b(raise[ds]?|funding|series\s+[a-e]\b|seed round|pre-seed|\$\s?\d+(\.\d+)?\s?(m|k|b|million|billion)|venture|valuation|led by|backed by|investment round|closes?\s+\$)\b/i,
    weight: 1.0,
  },
  hiring: {
    label: "Hiring GTM / sales roles",
    source: "Careers page",
    angle: "Lead with scaling their enterprise sales motion and ramping new AEs.",
    re: /\b(hiring|we'?re hiring|account executive|head of sales|vp of sales|sales development|sdr\b|gtm\b|go-to-market|open roles|now hiring|join our team|careers)\b/i,
    weight: 0.85,
  },
  launch: {
    label: "Product launch",
    source: "Product / announcement page",
    angle: "Reference their launch and open an infrastructure / partnership angle.",
    re: /\b(launch(es|ed|ing)?|introduc(es|ed|ing)|unveil(s|ed)?|debut(s|ed)?|now available|new product|general availability|\bGA\b|announc(es|ed).{0,20}product)\b/i,
    weight: 0.8,
  },
  partnership: {
    label: "Partnership signal",
    source: "Announcement page",
    angle: "Open with a shared enterprise use case off the back of their partnership.",
    re: /\b(partner(s|ed|ship)?|integration with|teams up|joins forces|collaborat(es|ion)|strategic alliance)\b/i,
    weight: 0.75,
  },
};

// Domains that publish lists/aggregations rather than being a single company.
const AGGREGATOR_HOSTS = [
  "medium.com",
  "linkedin.com",
  "topstartups.io",
  "ycombinator.com",
  "builtin.com",
  "crunchbase.com",
  "fundraiseinsider.com",
  "wellfound.com",
  "reddit.com",
  "quora.com",
  "forbes.com",
  "techcrunch.com",
  "news.ycombinator.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "threads.net",
  "instagram.com",
  "youtube.com",
  "yahoo.com",
  "globo.com",
  "wikipedia.org",
  "bloomberg.com",
  "businesswire.com",
  "prnewswire.com",
  "globenewswire.com",
];

// Single generic words that are never a real company name on their own.
const GENERIC_NAMES = new Set([
  "code", "data", "cloud", "security", "report", "news", "home", "blog",
  "login", "about", "ai", "tech", "startup", "company", "press", "online",
  // function / filler words that can slip through as single-token "names"
  "we", "our", "your", "their", "its", "it", "they", "head", "start",
  "started", "starting", "over", "industry", "fundraising", "fund", "more",
  "this", "that", "here", "plug", "world", "future", "today", "now", "meet",
  "just", "major", "another", "former", "early", "late", "key", "one", "two",
  "above", "below", "around", "nearly", "almost", "exclusive",
]);

const ACTION_WORDS = [
  "raises", "raise", "raised", "secures", "secured", "lands", "landed",
  "announces", "announced", "launches", "launched", "launch", "unveils",
  "unveiled", "debuts", "debut", "nabs", "closes", "closed", "bags", "partners",
  "partnered", "acquires", "acquired", "hires", "hiring", "appoints", "names",
  "expands", "introduces", "introduced", "scores", "pulls", "picks", "gets",
  "snags", "wins", "completes", "rolls",
];
const ACTION_RE = new RegExp(`\\s+(${ACTION_WORDS.join("|")})\\b`, "i");

// Leading words that describe the company but are not its name. Stripped from
// the front of a headline before reading the proper-noun company name.
const DESCRIPTORS = new Set([
  "exclusive", "report", "breaking", "analysis", "opinion", "update", "watch",
  "the", "a", "an", "ai", "ai-powered", "ai-native", "cyber", "cybersecurity",
  "security", "fintech", "infosec", "enterprise", "tech", "technology",
  "software", "saas", "platform", "data", "cloud", "startup", "startups",
  "company", "companies", "firm", "vendor", "provider", "maker", "based",
  "israeli", "london", "london-based", "uk", "us", "u.s.", "u.s",
  "european", "indian", "french", "german", "american", "global", "new",
  "this", "how", "why", "meet", "leading", "top", "fast-growing",
  "funding", "announcement", "announcements", "roundup", "weekly", "daily",
  "latest", "news", "deals", "deal", "watch", "list", "review", "introducing",
  // role / job-board noise (hiring headlines)
  "best", "jobs", "job", "openings", "opening", "vacancies", "hiring",
  "recruiting", "remote", "senior", "junior", "account", "executive", "sales",
  "role", "roles", "position", "positions", "apply", "careers",
  // headline filler + month/quarter/date words that aren't companies
  "here", "are", "all", "these", "those", "what", "when", "where", "who",
  "round", "rounds", "raise", "raises", "quarter", "q1", "q2", "q3", "q4",
  "employment", "east", "west", "north", "south",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct",
  "nov", "dec",
]);

// Host substrings that indicate an aggregator / job board / wire service.
const AGGREGATOR_SUBSTR = [
  "builtin", "indeed", "glassdoor", "ziprecruiter", "lever.co", "greenhouse",
  "workday", "recruit", "jobboard", "newswire", "prweb", "yahoo", "msn",
];

/**
 * Extract, dedupe, and rank account intelligence from web candidates.
 */
export function extractSignals(inputs: ExtractorInput[]): AccountResult[] {
  const byCompany = new Map<string, AccountResult & { _score: number }>();

  for (const input of inputs) {
    const blob = `${input.title} ${input.snippet ?? ""} ${input.pageText ?? ""}`;
    const { type, def } = classify(blob);
    const company = extractCompany(input, type);
    if (!company) continue;

    const key = company.toLowerCase();
    const isAggregator = isAggregatorHost(input.url);
    const evidence = pickEvidence(input, def);
    const confidence = scoreConfidence({
      def,
      blob,
      hasCompanyPattern: !!ACTION_RE.test(input.title),
      isAggregator,
      enriched: !!input.pageText,
    });

    const candidate: AccountResult & { _score: number } = {
      rank: 0,
      company,
      signal: def ? def.label : "Active web presence",
      evidence,
      confidence,
      outboundAngle: def
        ? def.angle
        : "Open with a timely, relevant insight from their public web data.",
      source: sourceLabel(input.url, def),
      url: input.url,
      _score: confidence - (isAggregator ? 0.25 : 0),
    };

    const existing = byCompany.get(key);
    if (!existing || candidate._score > existing._score) {
      byCompany.set(key, candidate);
    }
  }

  return [...byCompany.values()]
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...row }, i) => ({ ...row, rank: i + 1 }));
}

// ── classification ───────────────────────────────────────────────────────────

function classify(blob: string): { type: SignalType; def: SignalDef | null } {
  let best: { type: SignalType; def: SignalDef | null; weight: number } = {
    type: "presence",
    def: null,
    weight: 0,
  };
  for (const [type, def] of Object.entries(SIGNALS)) {
    if (def.re.test(blob) && def.weight > best.weight) {
      best = { type: type as SignalType, def, weight: def.weight };
    }
  }
  return { type: best.type, def: best.def };
}

// ── company extraction ───────────────────────────────────────────────────────

// A company name token run: 1–3 capitalized / camelCase / alphanumeric words.
// NOTE: the patterns below run WITHOUT the /i flag so this stays strictly
// uppercase — otherwise "has raised $4m" would capture "has".
const NAME = "([A-Z][\\w.&'’-]*(?:\\s+[A-Z][\\w.&'’-]*){0,2})";

/** Make a verb/word match either capitalization of its first letter. */
function dc(word: string): string {
  const f = word[0];
  return `[${f.toUpperCase()}${f.toLowerCase()}]${word.slice(1)}`;
}
const alt = (words: string[]) => words.map(dc).join("|");

const FUND_VERBS = alt([
  "raises?", "raised", "secures?", "secured", "lands?", "landed", "closes?",
  "closed", "nabs?", "bags?", "snags?", "scores?", "banks?",
  "hauls?(?:\\s+in)?", "pulls?\\s+in", "picks?\\s+up",
]);
const FUND_OBJ =
  "(?:\\$|€|£|\\d|[Aa]\\s|[Aa]n\\s|[Ii]ts\\s|[Nn]ew\\s|[Ss]eed|[Ss]eries|[Pp]re-seed|[Rr]ound|[Ff]unding|[Mm]illion|[Bb]illion)";
const LAUNCH_VERBS = alt([
  "launch(?:es|ed)?", "unveils?", "unveiled", "debuts?", "introduc(?:es|ed)",
  "rolls?\\s+out", "releases?", "announces?",
]);
const LAUNCH_OBJ =
  "(?:[Ii]ts\\s|[Tt]he\\s|[Aa]\\s|[Aa]n\\s|[Nn]ew\\s|[Gg]eneral|[Ff]irst|[Nn]ext|AI\\b)";

// Verb + object patterns that strongly imply "<Company> <did a GTM thing>".
// The object requirement (money, "a/its/new product", …) is what rejects
// generic headlines like "Over 50 startups raised $2B last year".
const FUNDING_PATTERN = new RegExp(`${NAME}\\s+(?:${FUND_VERBS})\\s+${FUND_OBJ}`);
const LAUNCH_PATTERN = new RegExp(`${NAME}\\s+(?:${LAUNCH_VERBS})\\s+${LAUNCH_OBJ}`);
const HIRING_PATTERN = new RegExp(
  `${NAME}\\s+(?:[Ii]s\\s+)?(?:[Hh]iring|[Ee]xpands?\\s+its\\s+(?:sales|gtm)|[Ss]cales?\\s+its\\s+(?:sales|gtm))`,
);
const HIRING_AT_PATTERN = new RegExp(`(?:\\bat|\\bjoin|@)\\s+${NAME}\\b`);

function extractCompany(input: ExtractorInput, type: SignalType): string | null {
  const title = (input.title || "").trim();
  const snippet = (input.snippet || "").trim();

  if (!looksLikeListicle(title)) {
    // Try the precise verb+object patterns on the title, then the snippet.
    for (const text of [title, snippet]) {
      const fromPattern = companyFromPattern(text, type);
      if (fromPattern) return fromPattern;
    }
  }

  // Only trust the domain when the URL is the company's OWN page (careers /
  // about / product). News-publisher domains are never the company, so we drop
  // the row instead of guessing a publisher's name.
  if (isOwnedPage(input.url) && !isAggregatorHost(input.url)) {
    return companyFromDomain(input.url);
  }

  return null;
}

/**
 * Pull the company name out of `text` using the verb+object pattern for the
 * detected signal type, falling back across the other patterns. Returns the
 * cleaned name, or null when nothing matches confidently.
 */
function companyFromPattern(text: string, type: SignalType): string | null {
  if (!text) return null;
  const order: RegExp[] =
    type === "launch"
      ? [LAUNCH_PATTERN, FUNDING_PATTERN, HIRING_PATTERN, HIRING_AT_PATTERN]
      : type === "hiring"
        ? [HIRING_PATTERN, HIRING_AT_PATTERN, FUNDING_PATTERN, LAUNCH_PATTERN]
        : [FUNDING_PATTERN, LAUNCH_PATTERN, HIRING_PATTERN, HIRING_AT_PATTERN];

  for (const re of order) {
    const m = text.match(re);
    if (m && m[1]) {
      const name = refineName(m[1]);
      if (name) return name;
    }
  }
  return null;
}

/** Drop descriptor/generic tokens from a captured run and validate the rest. */
function refineName(raw: string): string | null {
  const tokens = cleanCompany(raw)
    .split(/\s+/)
    .filter(
      (w) =>
        !DESCRIPTORS.has(w.toLowerCase()) && !GENERIC_NAMES.has(w.toLowerCase()),
    );
  const company = cleanCompany(tokens.join(" "));
  return isPlausibleCompany(company) ? company : null;
}

function cleanCompany(s: string): string {
  return s
    .replace(/[,'"“”‘’.]+$/g, "")
    .replace(/\s+(inc|llc|ltd|corp|co)\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function isPlausibleCompany(s: string): boolean {
  if (!s || s.length < 2 || s.length > 48) return false;
  if (/^\d+(\s|$)/.test(s)) return false; // "82 Cybersecurity…" (but allow "7AI")
  if (looksLikeListicle(s)) return false;
  if (DESCRIPTORS.has(s.toLowerCase())) return false;
  if (GENERIC_NAMES.has(s.toLowerCase())) return false; // bare "Code", "Data", …
  return /[a-z]/i.test(s);
}

function looksLikeListicle(s: string): boolean {
  return /\b(list of|top\s+\d+|best\s+\d+|\d+\s+(startups|companies|tools|firms)|roundup|directory|jobs?\s+(available|in|near|at)|\d+\s+[\w ]*jobs?\b|job openings|now hiring)\b/i.test(
    s,
  );
}

function isOwnedPage(url?: string): boolean {
  if (!url) return false;
  // Paths that appear on a company's OWN site (not on news publishers or job
  // boards — note /jobs is excluded because it is dominated by aggregators).
  return /\/(careers?|about|about-us|company|team|product|products|pricing)\b/i.test(
    url,
  );
}

function companyFromDomain(url?: string): string | null {
  const host = hostOf(url);
  if (!host || isAggregatorHost(url)) return null;
  const core = host
    .replace(/^www\./, "")
    .split(".")
    .slice(0, -1)
    .join(".");
  if (!core || core.length < 2) return null;
  // Title-case the second-level domain: "secureflowlabs" -> "Secureflowlabs".
  return core
    .split(/[-.]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
    .slice(0, 48);
}

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAggregatorHost(url?: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return (
    AGGREGATOR_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ||
    AGGREGATOR_SUBSTR.some((s) => host.includes(s))
  );
}

// ── evidence + scoring ───────────────────────────────────────────────────────

function pickEvidence(input: ExtractorInput, def: SignalDef | null): string {
  const sources = [input.snippet, input.pageText, input.title].filter(
    Boolean,
  ) as string[];
  if (def) {
    for (const text of sources) {
      const sentence = firstMatchingSentence(text, def.re);
      if (sentence) return clip(sentence);
    }
  }
  return clip(sources[0] ?? "Signal detected in live web data.");
}

function firstMatchingSentence(text: string, re: RegExp): string | null {
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    if (re.test(s) && s.trim().length > 12) return s.trim();
  }
  return null;
}

function clip(s: string, n = 180): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
}

function scoreConfidence(opts: {
  def: SignalDef | null;
  blob: string;
  hasCompanyPattern: boolean;
  isAggregator: boolean;
  enriched: boolean;
}): number {
  let c = 0.6;
  if (opts.def) c = 0.7 + opts.def.weight * 0.12;
  if (opts.hasCompanyPattern) c += 0.06;
  if (/\b(2026|2025|today|this week|recently|just)\b/i.test(opts.blob)) c += 0.05;
  if (opts.enriched) c += 0.04;
  if (opts.isAggregator) c -= 0.12;
  return Math.max(0.6, Math.min(0.97, Math.round(c * 100) / 100));
}

function sourceLabel(url: string | undefined, def: SignalDef | null): string {
  const host = hostOf(url);
  const base = def ? def.source : "Search result";
  if (!host) return base;
  if (/\/(careers?|jobs?)\b/i.test(url ?? "")) return "Careers page";
  if (/\/(product|launch|release)\b/i.test(url ?? "")) return "Product page";
  if (/\/(press|news|blog|announc)\b/i.test(url ?? "")) return "News result";
  return base;
}
