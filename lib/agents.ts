import type { Agent } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Agent registry for the Acme Corp workspace. In a real deployment this would be
// backed by a database; for the MVP it is in-memory and import-shared so every
// page and API route reads the same definitions.
// ─────────────────────────────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: "gtm-intelligence",
    name: "GTM Intelligence Agent",
    description:
      "Finds accounts, monitors competitors, enriches companies, and generates outbound angles from live web data.",
    status: "active",
    department: "GTM",
    category: "Revenue Intelligence",
    provider: "London · Bright Data",
    tools: [
      { name: "Bright Data SERP API", brightData: true },
      { name: "Bright Data Web Unlocker", brightData: true },
      { name: "Bright Data Web Scraper API", brightData: true },
      { name: "Bright Data Scraping Browser", brightData: true },
      { name: "LLM Signal Extractor" },
    ],
    mcpReady: "yes",
    policyId: "gtm-intelligence",
  },
  {
    id: "finance-signal",
    name: "Finance Signal Agent",
    description:
      "Tracks pricing, market signals, and alternative data sources.",
    status: "preview",
    department: "Finance",
    category: "Market Intelligence",
    provider: "London · Bright Data",
    tools: [
      { name: "Bright Data Web Scraper API", brightData: true },
      { name: "Bright Data SERP API", brightData: true },
    ],
    mcpReady: "soon",
    policyId: "finance-signal",
  },
  {
    id: "security-risk",
    name: "Security Risk Agent",
    description:
      "Monitors vendor risk, breach mentions, and third-party security signals.",
    status: "preview",
    department: "Security",
    category: "Risk Intelligence",
    provider: "London · Bright Data",
    tools: [
      { name: "Bright Data SERP API", brightData: true },
      { name: "Bright Data Web Unlocker", brightData: true },
    ],
    mcpReady: "soon",
    policyId: "security-risk",
  },
  {
    id: "support-team",
    name: "Customer Support Agent Team",
    description:
      "Classifies support tickets, checks policies, and drafts on-brand responses.",
    status: "active",
    department: "Support",
    category: "Customer Operations",
    provider: "London",
    tools: [
      { name: "Intent Classifier" },
      { name: "Refund Specialist" },
      { name: "Response Drafter" },
    ],
    mcpReady: "yes",
    policyId: "support-team",
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getAgentByName(name: string): Agent | undefined {
  return AGENTS.find((a) => a.name === name);
}

// Workspace-level stats shown on the Home dashboard cards.
export const WORKSPACE_STATS = {
  connectedAgents: 3,
  activePolicies: 7,
  toolCallsToday: 128,
  avgConfidence: 91,
};

// Right-panel "Active Agents" roster (lightweight runtime view of the workforce).
export const ACTIVE_AGENTS: { name: string; status: "online" | "busy" }[] = [
  { name: "Lead Researcher", status: "online" },
  { name: "Account Enricher", status: "online" },
  { name: "Outbound Writer", status: "busy" },
  { name: "CRM Sync", status: "online" },
  { name: "Performance Optimizer", status: "online" },
];

export const RECENT_ACTIVITY: { text: string; when: string }[] = [
  { text: "Found 25 new target accounts", when: "2 min ago" },
  { text: "Enriched 18 accounts with firmographics", when: "15 min ago" },
  { text: "Generated 40 outbound angles", when: "1 hr ago" },
  { text: "Synced 12 leads to CRM", when: "2 hr ago" },
  { text: "Optimized outbound sequence", when: "4 hr ago" },
];

export const INTEGRATIONS: {
  name: string;
  category: string;
  connected: boolean;
  highlight?: boolean;
}[] = [
  { name: "Bright Data", category: "Live Web Data", connected: true, highlight: true },
  { name: "Salesforce", category: "CRM", connected: true },
  { name: "HubSpot", category: "CRM", connected: true },
  { name: "Slack", category: "Messaging", connected: true },
  { name: "Apollo", category: "Sales Data", connected: false },
  { name: "Clay", category: "Enrichment", connected: false },
  { name: "Gmail", category: "Email", connected: true },
  { name: "Zendesk", category: "Support", connected: false },
];
