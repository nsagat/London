import type {
  AccountResult,
  RecommendedAgent,
  TraceStep,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Realistic mock data used when Bright Data credentials are not present, and as
// the structured shape the live pipeline normalizes into. Anything served from
// here is labeled "demo" in the UI.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_ACCOUNT_RESULTS: AccountResult[] = [
  {
    rank: 1,
    company: "VantaAI Security",
    signal: "Hiring enterprise account executives",
    evidence: "Careers page lists multiple GTM roles across NA and EMEA.",
    confidence: 0.92,
    outboundAngle:
      "Lead with scaling compliance-driven enterprise sales motions.",
    source: "Careers page",
    url: "https://example.com/vantaai/careers",
  },
  {
    rank: 2,
    company: "CipherPilot",
    signal: "Recent seed / Series A funding mention",
    evidence: "Funding announcement found in recent search results.",
    confidence: 0.88,
    outboundAngle: "Position around post-funding GTM acceleration.",
    source: "News result",
    url: "https://example.com/news/cipherpilot-series-a",
  },
  {
    rank: 3,
    company: "SecureFlow Labs",
    signal: "Product launch",
    evidence: "New AI risk-monitoring product page detected.",
    confidence: 0.86,
    outboundAngle:
      "Reference their new launch and offer an infrastructure partnership angle.",
    source: "Product page",
    url: "https://example.com/secureflow/launch",
  },
  {
    rank: 4,
    company: "AuditMind",
    signal: "Security partnership",
    evidence: "Partnership announcement with a cloud security provider.",
    confidence: 0.84,
    outboundAngle:
      "Open with a shared enterprise compliance / security use case.",
    source: "Announcement page",
    url: "https://example.com/auditmind/partnership",
  },
];

// Bright Data execution trace for the GTM account-intelligence pipeline. Each
// step names the Bright Data product responsible for that stage.
export const DEMO_GTM_TRACE: TraceStep[] = [
  {
    step: 1,
    tool: "Bright Data SERP API",
    purpose: "Discover recent company / news / job-posting candidates",
    status: "success",
    latency: "842ms",
    brightData: true,
  },
  {
    step: 2,
    tool: "Bright Data Web Unlocker",
    purpose: "Fetch company websites, careers pages, and relevant articles",
    status: "success",
    latency: "1.2s",
    brightData: true,
  },
  {
    step: 3,
    tool: "Bright Data Web Scraper API",
    purpose: "Structure firmographics, hiring, funding, and launch fields",
    status: "success",
    latency: "1.1s",
    brightData: true,
  },
  {
    step: 4,
    tool: "LLM Signal Extractor",
    purpose: "Extract hiring, funding, launch, and partnership signals",
    status: "success",
    latency: "absorb",
    brightData: false,
  },
  {
    step: 5,
    tool: "GTM Intelligence Agent",
    purpose: "Rank accounts and generate outbound angles",
    status: "success",
    latency: "612ms",
    brightData: false,
  },
];

// Mock recommendation team for the support-automation routing mode.
export const SUPPORT_AGENTS: RecommendedAgent[] = [
  {
    name: "Refund Specialist",
    description: "Handles refund requests, policy checks, and approvals.",
    score: 4.8,
    provider: "SupportAI",
    status: "recommended",
    estimatedCost: "$0.006 / ticket",
  },
  {
    name: "Intent Classifier",
    description: "Understands customer intent and routes correctly.",
    score: 4.7,
    provider: "NLP Labs",
    status: "recommended",
    estimatedCost: "$0.005 / ticket",
  },
  {
    name: "Response Drafter",
    description: "Drafts human-like responses in your brand voice.",
    score: 4.9,
    provider: "ComposeAI",
    status: "recommended",
    expectedLift: "85% automation coverage",
  },
];

export const SUPPORT_TRACE: TraceStep[] = [
  {
    step: 1,
    tool: "Intent Classifier",
    purpose: "Classify ticket intent (refund request) and route",
    status: "success",
    latency: "180ms",
  },
  {
    step: 2,
    tool: "Refund Specialist",
    purpose: "Check refund policy eligibility and propose a decision",
    status: "success",
    latency: "340ms",
  },
  {
    step: 3,
    tool: "Response Drafter",
    purpose: "Draft an on-brand customer response for agent approval",
    status: "success",
    latency: "420ms",
  },
];

// Fixed fallback SERP-style candidates used to seed the GTM pipeline offline.
export const DEMO_SERP_CANDIDATES = [
  {
    title: "VantaAI Security — Careers",
    url: "https://example.com/vantaai/careers",
    snippet:
      "We're hiring enterprise account executives to scale our compliance platform.",
  },
  {
    title: "CipherPilot raises Series A to secure AI pipelines",
    url: "https://example.com/news/cipherpilot-series-a",
    snippet:
      "CipherPilot announced a Series A round led by a cybersecurity-focused fund.",
  },
  {
    title: "SecureFlow Labs launches AI risk monitoring",
    url: "https://example.com/secureflow/launch",
    snippet:
      "SecureFlow Labs introduced a new product for continuous AI risk monitoring.",
  },
  {
    title: "AuditMind partners with leading cloud security provider",
    url: "https://example.com/auditmind/partnership",
    snippet:
      "AuditMind announced a strategic partnership to expand enterprise compliance coverage.",
  },
];
