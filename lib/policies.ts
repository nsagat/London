import type { Agent, Policy, PolicyDecision } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Governance layer. Every agent runs under a workspace policy that constrains
// what data it can touch, which tools are approved, and the cost ceiling per run.
// `evaluatePolicy` is the single decision point used by the router.
// ─────────────────────────────────────────────────────────────────────────────

export const POLICIES: Record<string, Policy> = {
  "gtm-intelligence": {
    id: "gtm-intelligence",
    agentId: "gtm-intelligence",
    allowedData: "Public web only",
    approvedTools: [
      "Bright Data SERP API",
      "Bright Data Web Unlocker",
      "Bright Data Web Scraper API",
      "Bright Data Scraping Browser",
      "LLM Signal Extractor",
    ],
    maxCostPerRun: "$1.00",
    requiresCitations: true,
    storesMemory: false,
    approvalRequired: false,
    outputSchema: "Account Intelligence JSON",
  },
  "finance-signal": {
    id: "finance-signal",
    agentId: "finance-signal",
    allowedData: "Public web + licensed market data",
    approvedTools: ["Bright Data Web Scraper API", "Bright Data SERP API"],
    maxCostPerRun: "$2.00",
    requiresCitations: true,
    storesMemory: false,
    approvalRequired: true,
    outputSchema: "Market Signal JSON",
  },
  "security-risk": {
    id: "security-risk",
    agentId: "security-risk",
    allowedData: "Public web only",
    approvedTools: ["Bright Data SERP API", "Bright Data Web Unlocker"],
    maxCostPerRun: "$1.50",
    requiresCitations: true,
    storesMemory: false,
    approvalRequired: true,
    outputSchema: "Vendor Risk JSON",
  },
  "support-team": {
    id: "support-team",
    agentId: "support-team",
    allowedData: "Customer data (restricted, in-tenant)",
    approvedTools: ["Intent Classifier", "Refund Specialist", "Response Drafter"],
    maxCostPerRun: "$0.05 / ticket",
    requiresCitations: false,
    storesMemory: true,
    approvalRequired: true,
    outputSchema: "Support Resolution JSON",
  },
};

export function getPolicy(agentId: string): Policy | undefined {
  return POLICIES[agentId];
}

/**
 * Decide whether `agent` may run `task` inside `workspace`. The MVP applies a
 * simple, explainable rule set; the return shape is stable so the UI and any
 * future MCP surface can render the decision consistently.
 */
export function evaluatePolicy(
  agent: Agent,
  task: string,
  workspace: string,
): PolicyDecision {
  const policy = getPolicy(agent.policyId ?? agent.id);

  if (!policy) {
    return {
      status: "blocked",
      reason: `No policy registered for ${agent.name} in ${workspace}.`,
    };
  }

  // Public-web GTM/finance/security agents are pre-approved under the workspace
  // public-web policy. The support team runs on restricted customer data and is
  // approved under the in-tenant data-handling policy.
  if (policy.allowedData.startsWith("Public web")) {
    return {
      status: "approved",
      reason: `Approved under ${workspace} public-web policy. Citations required, max ${policy.maxCostPerRun} per run.`,
    };
  }

  return {
    status: "approved",
    reason: `Approved under ${workspace} restricted-data policy. Runs in-tenant with audit logging.`,
  };
}
