import type {
  RouteTaskInput,
  RouteTaskResponse,
} from "./types";
import { getAgent } from "./agents";
import { evaluatePolicy } from "./policies";
import { runBrightDataPipeline } from "./brightdata";
import { SUPPORT_AGENTS, SUPPORT_TRACE } from "./demo-results";

// ─────────────────────────────────────────────────────────────────────────────
// London's task router. It detects the kind of work an employee request implies
// and dispatches it to the right agent (or agent team) under workspace policy.
// The same entrypoint can be exposed over MCP — see /mcp/README.md.
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORT_RE =
  /\b(refund|support|ticket|response time|customer service|help ?desk|chargeback)\b/i;
const GTM_RE =
  /\b(compan(y|ies)|startups?|hiring|funding|outbound|competitor|competitive|pricing|account|prospect|leads?|gtm|market)\b/i;

function detectMode(task: string): "support_automation" | "gtm_intelligence" {
  if (SUPPORT_RE.test(task)) return "support_automation";
  if (GTM_RE.test(task)) return "gtm_intelligence";
  // Default to GTM intelligence — that's London's primary capability.
  return "gtm_intelligence";
}

export async function routeEnterpriseTask(
  input: RouteTaskInput,
): Promise<RouteTaskResponse> {
  const workspace = input.workspace?.trim() || "Acme Corp";
  const task = input.task?.trim() || "";
  const mode = detectMode(task);

  if (mode === "support_automation") {
    const agent = getAgent("support-team")!;
    const policyDecision = evaluatePolicy(agent, task, workspace);

    return {
      mode,
      selectedAgentOrTeam: agent.name,
      taskType: "Support Automation",
      routingReason:
        "The task involves customer support resolution — classifying intent, applying refund policy, and drafting an on-brand reply — so London assembles a support agent team.",
      policyDecision,
      recommendedAgents: SUPPORT_AGENTS,
      approvedTools: ["Intent Classifier", "Refund Specialist", "Response Drafter"],
      trace: SUPPORT_TRACE,
      results: [],
      metrics: {
        estimatedResponseTime: "0.62s",
        estimatedCost: "$0.005 / ticket",
        automationCoverage: "85%",
      },
      liveMode: false,
      dataSource: "demo",
    };
  }

  // GTM intelligence path — this is where Bright Data runs.
  const agent = getAgent("gtm-intelligence")!;
  const policyDecision = evaluatePolicy(agent, task, workspace);
  const pipeline = await runBrightDataPipeline(task);

  return {
    mode,
    selectedAgentOrTeam: agent.name,
    taskType: "GTM Intelligence",
    routingReason:
      "The task requires account discovery, live web research, company signal extraction, and outbound recommendations, so London routes it to the GTM Intelligence Agent backed by Bright Data.",
    policyDecision,
    recommendedAgents: [
      {
        name: agent.name,
        description: agent.description,
        category: agent.category,
        score: 4.9,
        provider: agent.provider ?? "London",
        status: "online",
      },
    ],
    approvedTools: [
      "Bright Data SERP API",
      "Bright Data Web Unlocker",
      "Bright Data Web Scraper API",
      "LLM Signal Extractor",
    ],
    trace: pipeline.trace,
    results: pipeline.results,
    metrics: {
      estimatedResponseTime: "3.8s",
      estimatedCost: "$0.41 / run",
      automationCoverage: "92%",
    },
    liveMode: pipeline.liveMode,
    dataSource: pipeline.liveMode ? "live" : "demo",
  };
}
