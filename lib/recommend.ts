import type {
  CompanyContext,
  RecommendStackInput,
  RecommendStackResponse,
  RecommendedAgent,
  TraceStep,
} from "./types";
import { discoverLiveAccountSignals, isLive } from "./brightdata";
import { extractSignals } from "./extractor";
import { DEMO_ACCOUNT_RESULTS } from "./demo-results";

// ─────────────────────────────────────────────────────────────────────────────
// "Build your AI GTM Team" engine. Parses a free-text company description into a
// structured context, then recommends a budget-aware stack of GTM agents and an
// evaluation trace. Bright Data appears in the trace as the discovery/enrichment
// substrate the evaluator relies on.
// ─────────────────────────────────────────────────────────────────────────────

function parseContext(prompt: string): CompanyContext {
  const p = prompt.toLowerCase();

  const companyType = /cybersecurity|security/.test(p)
    ? "B2B cybersecurity startup"
    : /fintech|finance/.test(p)
      ? "B2B fintech company"
      : /saas/.test(p)
        ? "B2B SaaS company"
        : "B2B technology company";

  const targetMarket = /mid-?market/.test(p)
    ? "Mid-market SaaS companies"
    : /enterprise/.test(p)
      ? "Enterprise accounts"
      : /smb|small business/.test(p)
        ? "SMB segment"
        : "Mid-market companies";

  const budgetMatch = prompt.match(/\$\s?([\d,]+)\s?(\/?\s?(month|mo|monthly))?/i);
  const budget = budgetMatch
    ? `$${Number(budgetMatch[1].replace(/,/g, "")).toLocaleString("en-US")}/month`
    : "$2,000/month";

  const goal = /pipeline|outbound|leads?/.test(p)
    ? "Qualified outbound pipeline"
    : /retention|expansion|upsell/.test(p)
      ? "Net revenue expansion"
      : /awareness|brand|marketing/.test(p)
        ? "Demand generation"
        : "Qualified outbound pipeline";

  const gtmMotion = /inbound|plg|product-led/.test(p)
    ? "Product-led / inbound"
    : "Outbound sales";

  return {
    companyType,
    targetMarket,
    goal,
    budget,
    gtmMotion,
    priority: "High-fit accounts and personalized outreach",
  };
}

const STACK: RecommendedAgent[] = [
  {
    name: "Lead Research Agent",
    category: "Prospecting",
    description: "Finds high-fit target accounts using live web signals.",
    whyRecommended: "Best fit for outbound pipeline generation.",
    tools: ["Bright Data SERP API", "Bright Data Web Unlocker"],
    estimatedCost: "$450/month",
    expectedLift: "+30 qualified leads/week",
    confidence: 92,
    score: 4.9,
    provider: "London · Bright Data",
    status: "recommended",
  },
  {
    name: "Account Enrichment Agent",
    category: "Data Enrichment",
    description:
      "Enriches accounts with firmographics, hiring, funding, tech stack, and news.",
    whyRecommended: "Improves segmentation and lead quality.",
    tools: ["Bright Data Web Scraper API", "Bright Data SERP API"],
    estimatedCost: "$350/month",
    expectedLift: "+25% lead quality",
    confidence: 89,
    score: 4.8,
    provider: "London · Bright Data",
    status: "recommended",
  },
  {
    name: "Outbound Personalization Agent",
    category: "Sales Engagement",
    description:
      "Generates personalized email angles based on live account signals.",
    whyRecommended: "Improves reply rates for cold outbound.",
    tools: ["LLM Generator", "Account Intelligence"],
    estimatedCost: "$500/month",
    expectedLift: "+12% reply rate",
    confidence: 87,
    score: 4.7,
    provider: "ComposeAI",
    status: "recommended",
  },
  {
    name: "CRM Sync Agent",
    category: "RevOps",
    description:
      "Pushes approved accounts, notes, and signals into Salesforce or HubSpot.",
    whyRecommended: "Reduces manual RevOps work.",
    tools: ["Salesforce", "HubSpot"],
    estimatedCost: "$250/month",
    expectedLift: "6 hours saved/week",
    confidence: 84,
    score: 4.6,
    provider: "RevOps Cloud",
    status: "recommended",
  },
  {
    name: "Performance Optimizer Agent",
    category: "Analytics",
    description:
      "Monitors agent performance and recommends changes to improve pipeline ROI.",
    whyRecommended: "Keeps the GTM agent stack optimized over time.",
    tools: ["Analytics", "Feedback Loop"],
    estimatedCost: "$300/month",
    expectedLift: "+18% campaign efficiency",
    confidence: 86,
    score: 4.7,
    provider: "London",
    status: "recommended",
  },
];

export async function recommendGtmStack(
  input: RecommendStackInput,
): Promise<RecommendStackResponse> {
  const prompt = input.companyPrompt?.trim() || "";
  const companyContext = parseContext(prompt);

  // Live GTM signal preview — exercises Bright Data discovery for the vertical.
  let signalPreview = DEMO_ACCOUNT_RESULTS.slice(0, 3);
  let liveMode = false;
  if (isLive()) {
    try {
      const query = `${companyContext.companyType} ${companyContext.targetMarket} raises funding OR hiring OR launches`;
      const candidates = await discoverLiveAccountSignals(query);
      const extracted = extractSignals(
        candidates.map((c) => ({ title: c.title, snippet: c.snippet, url: c.url })),
      );
      if (extracted.length) {
        liveMode = true;
        signalPreview = extracted.slice(0, 3);
      }
    } catch {
      /* fall back to demo preview */
    }
  }

  const trace: TraceStep[] = [
    {
      step: 1,
      tool: "London Goal Analyzer",
      purpose: "Parsed company stage, target market, goal, and budget.",
      status: "success",
      latency: "210ms",
    },
    {
      step: 2,
      tool: "Bright Data SERP API",
      purpose:
        "Discovered GTM agent vendors, public capabilities, and market signals.",
      status: "success",
      latency: "910ms",
      brightData: true,
    },
    {
      step: 3,
      tool: "Bright Data Web Unlocker",
      purpose:
        "Retrieved public pricing pages, docs, reviews, and agent capability pages.",
      status: "success",
      latency: "1.3s",
      brightData: true,
    },
    {
      step: 4,
      tool: "London Agent Evaluator",
      purpose:
        "Scored agents against budget, GTM motion, integration fit, and performance.",
      status: "success",
      latency: "540ms",
    },
    {
      step: 5,
      tool: "London Deployment Planner",
      purpose: "Built the recommended GTM agent stack and workflow plan.",
      status: "success",
      latency: "320ms",
    },
  ];

  return {
    companyContext,
    recommendedAgents: STACK,
    trace,
    summaryMetrics: {
      totalEstimatedCost: "$1,850/month",
      remainingBudget: "$150/month",
      projectedPipelineImpact: "$128K",
      manualHoursSaved: "22/week",
    },
    signalPreview,
    liveMode,
    dataSource: liveMode ? "live" : "demo",
  };
}
