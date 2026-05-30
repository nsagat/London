import { routeEnterpriseTask } from "./agent-router";
import { recommendGtmStack } from "./recommend";
import type {
  RecommendStackResponse,
  RouteTaskResponse,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Unified London entry point.
//
// One call, one input. London inspects the request, decides which agent
// capability it implies, runs it, and returns a single envelope. This is the
// surface a frontend (or an MCP host) talks to when it doesn't want to know
// which underlying endpoint to hit.
//
//   "Find AI security startups with recent funding"      -> route_task (GTM)
//   "Automate refund tickets and cut response time"      -> route_task (support)
//   "We're a B2B security startup, $2k/mo for pipeline"  -> recommend_stack
// ─────────────────────────────────────────────────────────────────────────────

export type LondonKind = "route_task" | "recommend_stack";
export type LondonMode = "auto" | LondonKind;

export interface LondonInput {
  /** Natural-language request from the user. */
  input: string;
  workspace?: string;
  department?: string;
  /** Force a capability; "auto" (default) lets London decide. */
  mode?: LondonMode;
}

export interface LondonResponse {
  kind: LondonKind;
  /** Short label for why this capability was chosen. */
  intent: string;
  workspace: string;
  liveMode: boolean;
  dataSource: "live" | "demo";
  /** The full typed payload from the underlying capability. */
  data: RouteTaskResponse | RecommendStackResponse;
}

// Signals that the input is a company/goals description asking for a team,
// rather than a task to execute now.
const RECOMMEND_RE =
  /\b(recommend|build (me |us |our )?(a |an )?(gtm )?team|agent stack|which agents|what agents|set up (a|our) (gtm )?(team|stack)|assemble|our budget|\/?\s?month budget)\b/i;
const COMPANY_DESC_RE =
  /\b(we are|we'?re|our company|our startup|i run|i'?m building|selling to|go-to-market|gtm motion)\b/i;
const BUDGET_RE = /\$\s?\d[\d,]*\s*(?:\/|\s|per)?\s*(?:k|m)?\s*(?:month|mo|monthly|year|yr)\b/i;

function detectKind(input: string): { kind: LondonKind; intent: string } {
  const text = input.toLowerCase();

  const looksLikeRecommend =
    RECOMMEND_RE.test(text) ||
    (BUDGET_RE.test(input) && COMPANY_DESC_RE.test(text)) ||
    (COMPANY_DESC_RE.test(text) && /\b(pipeline|leads?|outbound|revenue|sales)\b/.test(text));

  if (looksLikeRecommend) {
    return {
      kind: "recommend_stack",
      intent: "Company/goals description → recommend a GTM agent team",
    };
  }
  return {
    kind: "route_task",
    intent: "Actionable task → route to the right agent and execute",
  };
}

/**
 * Run any London request through a single entrypoint.
 */
export async function runLondon(req: LondonInput): Promise<LondonResponse> {
  const input = (req.input ?? "").trim();
  const workspace = req.workspace?.trim() || "Acme Corp";

  const decided =
    req.mode && req.mode !== "auto"
      ? { kind: req.mode, intent: `Forced mode: ${req.mode}` }
      : detectKind(input);

  if (decided.kind === "recommend_stack") {
    const data = await recommendGtmStack({ companyPrompt: input });
    return {
      kind: "recommend_stack",
      intent: decided.intent,
      workspace,
      liveMode: data.liveMode,
      dataSource: data.dataSource,
      data,
    };
  }

  const data = await routeEnterpriseTask({
    workspace,
    task: input,
    department: req.department,
  });
  return {
    kind: "route_task",
    intent: decided.intent,
    workspace,
    liveMode: data.liveMode,
    dataSource: data.dataSource,
    data,
  };
}
