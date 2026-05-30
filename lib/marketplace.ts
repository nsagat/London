// ─────────────────────────────────────────────────────────────────────────────
// London GTM Agent Marketplace — the directory of agents London lists,
// evaluates, and recommends. A few are powered by Bright Data and run LIVE
// inside London today (mapped to our executable tool catalog, lib/catalog.ts);
// the rest are partner/integration agents London can recommend and deploy.
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketplaceAgent {
  name: string;
  provider: string;
  category: string;
  /** Powered by Bright Data + runnable live in London right now. */
  live?: boolean;
  /** When live, the catalog tool London runs for this agent. */
  runsTool?: string;
}

interface RawAgent {
  name: string;
  provider: string;
  live?: boolean;
  runsTool?: string;
}

const BY_CATEGORY: Record<string, RawAgent[]> = {
  "Sales Development": [
    { name: "Apollo SDR Agent", provider: "Apollo" },
    { name: "AI SDR Agent", provider: "11x" },
    { name: "Sales Development Agent", provider: "Regie.ai" },
    { name: "Meeting Booking Agent", provider: "Artisan" },
    { name: "Prospect Research Agent", provider: "Clay" },
    { name: "Contact Discovery Agent", provider: "ZoomInfo" },
  ],
  "Lead Generation": [
    { name: "Lead Discovery Agent", provider: "Apollo" },
    { name: "Lead Enrichment Agent", provider: "Clay" },
    { name: "Audience Builder", provider: "Clearbit" },
    { name: "ICP Finder", provider: "Common Room" },
    { name: "Prospect Miner", provider: "ZoomInfo" },
    { name: "Buying Signal Hunter", provider: "RB2B" },
  ],
  Intelligence: [
    { name: "Signal Scout", provider: "Bright Data", live: true, runsTool: "find_account_signals" },
    { name: "Company Research Agent", provider: "Clay" },
    { name: "Funding Monitor", provider: "Crunchbase" },
    { name: "Hiring Signal Tracker", provider: "Bright Data", live: true, runsTool: "find_account_signals" },
    { name: "Market Intelligence Agent", provider: "AlphaSense" },
    { name: "Competitor Watch", provider: "Similarweb" },
  ],
  Outbound: [
    { name: "Outreach Agent", provider: "Apollo" },
    { name: "AI SDR Agent", provider: "11x" },
    { name: "Email Personalizer", provider: "Lavender" },
    { name: "Sequence Builder", provider: "Instantly" },
    { name: "LinkedIn Outreach Agent", provider: "HeyReach" },
    { name: "Outbound Automation Agent", provider: "Regie.ai" },
  ],
  Sales: [
    { name: "Revenue Intelligence Agent", provider: "Gong" },
    { name: "Deal Intelligence Agent", provider: "Clari" },
    { name: "Opportunity Scorer", provider: "People.ai" },
    { name: "Pipeline Optimizer", provider: "InsightSquared" },
    { name: "Call Intelligence Agent", provider: "Gong" },
    { name: "Sales Forecast Agent", provider: "Clari" },
  ],
  Strategy: [
    { name: "GTM Strategist", provider: "Clay" },
    { name: "Market Entry Advisor", provider: "AlphaSense" },
    { name: "Competitive Strategy Agent", provider: "Similarweb" },
    { name: "Pricing Intelligence Agent", provider: "Prisync" },
    { name: "Growth Planner", provider: "HubSpot" },
    { name: "Revenue Planner", provider: "Salesforce" },
  ],
  "Customer Success": [
    { name: "Customer Health Agent", provider: "Gainsight" },
    { name: "Churn Predictor", provider: "Vitally" },
    { name: "Expansion Opportunity Agent", provider: "ChurnZero" },
    { name: "Renewal Optimizer", provider: "Planhat" },
    { name: "Customer Insights Agent", provider: "Gainsight" },
    { name: "NPS Intelligence Agent", provider: "Delighted" },
  ],
  "Revenue Operations": [
    { name: "CRM Sync Agent", provider: "HubSpot" },
    { name: "Revenue Intelligence Agent", provider: "Gong" },
    { name: "Forecast Auditor", provider: "Clari" },
    { name: "Pipeline Intelligence Agent", provider: "InsightSquared" },
    { name: "Attribution Agent", provider: "HockeyStack" },
    { name: "Revenue Reporting Agent", provider: "Salesforce" },
  ],
  Forecasting: [
    { name: "Revenue Forecaster", provider: "Clari" },
    { name: "Pipeline Predictor", provider: "InsightSquared" },
    { name: "Forecast Validator", provider: "People.ai" },
    { name: "Growth Forecast Agent", provider: "Salesforce" },
    { name: "Capacity Planner", provider: "HubSpot" },
    { name: "Scenario Simulator", provider: "Clari" },
  ],
  "Competitive Intelligence": [
    { name: "Competitor Monitor", provider: "Similarweb" },
    { name: "Product Launch Tracker", provider: "Bright Data", live: true, runsTool: "monitor_competitor" },
    { name: "Pricing Intelligence Agent", provider: "Prisync" },
    { name: "Market Movement Agent", provider: "AlphaSense" },
    { name: "Battlecard Generator", provider: "Klue" },
    { name: "Competitive Research Agent", provider: "Crayon" },
  ],
};

export const MARKETPLACE_CATEGORIES = Object.keys(BY_CATEGORY);

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = Object.entries(BY_CATEGORY).flatMap(
  ([category, agents]) => agents.map((a) => ({ ...a, category })),
);

export function marketplaceManifest() {
  return {
    total: MARKETPLACE_AGENTS.length,
    liveCount: MARKETPLACE_AGENTS.filter((a) => a.live).length,
    categories: MARKETPLACE_CATEGORIES.map((category) => ({
      category,
      agents: BY_CATEGORY[category].map((a) => ({ ...a, category })),
    })),
  };
}
