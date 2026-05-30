// ─────────────────────────────────────────────────────────────────────────────
// Shared types for London's API surface. These shapes are intentionally stable
// so the same logic can later be exposed over MCP (see /mcp/README.md).
// ─────────────────────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "preview" | "online" | "busy";

export interface AgentTool {
  name: string;
  /** Marks a Bright Data product so the UI can highlight it. */
  brightData?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  department: string;
  category?: string;
  provider?: string;
  tools: AgentTool[];
  mcpReady: "yes" | "soon";
  policyId?: string;
}

export interface Policy {
  id: string;
  agentId: string;
  allowedData: string;
  approvedTools: string[];
  maxCostPerRun: string;
  requiresCitations: boolean;
  storesMemory: boolean;
  approvalRequired: boolean;
  outputSchema: string;
}

export interface PolicyDecision {
  status: "approved" | "blocked";
  reason: string;
}

export interface TraceStep {
  step: number;
  tool: string;
  purpose: string;
  status: "success" | "skipped" | "error";
  latency: string;
  /** True when this step maps to a Bright Data product. */
  brightData?: boolean;
}

export interface AccountResult {
  rank: number;
  company: string;
  signal: string;
  evidence: string;
  confidence: number;
  outboundAngle: string;
  source: string;
  url?: string;
  /** AI/ML API–generated 2-sentence intelligence brief (top accounts only). */
  brief?: string;
  /** AI/ML API–generated personalized outbound email draft. */
  outboundEmail?: string;
}

/** Which engine produced the intelligence: real model vs deterministic rules. */
export type IntelligenceLayer = "aiml" | "heuristic";

export interface RecommendedAgent {
  name: string;
  description: string;
  category?: string;
  score: number;
  provider: string;
  status: "recommended" | "online" | "busy";
  whyRecommended?: string;
  tools?: string[];
  estimatedCost?: string;
  expectedLift?: string;
  confidence?: number;
}

export interface RouteMetrics {
  estimatedResponseTime?: string;
  estimatedCost?: string;
  automationCoverage?: string;
}

export type RouteMode = "support_automation" | "gtm_intelligence";

export interface RouteTaskInput {
  workspace?: string;
  task: string;
  department?: string;
}

export interface RouteTaskResponse {
  mode: RouteMode;
  selectedAgentOrTeam: string;
  taskType: string;
  routingReason: string;
  policyDecision: PolicyDecision;
  recommendedAgents: RecommendedAgent[];
  approvedTools: string[];
  trace: TraceStep[];
  results: AccountResult[];
  metrics: RouteMetrics;
  /** True when real Bright Data calls produced the results. */
  liveMode: boolean;
  /** "live" when powered by Bright Data, "demo" for mock fallback. */
  dataSource: "live" | "demo";
  /** Which engine extracted the signals: AI/ML API model vs heuristics. */
  intelligenceLayer: IntelligenceLayer;
}

// ── /api/recommend-stack ────────────────────────────────────────────────────

export interface CompanyContext {
  companyType: string;
  targetMarket: string;
  goal: string;
  budget: string;
  gtmMotion: string;
  priority: string;
}

export interface StackSummaryMetrics {
  totalEstimatedCost: string;
  remainingBudget: string;
  projectedPipelineImpact: string;
  manualHoursSaved: string;
}

export interface RecommendStackInput {
  companyPrompt: string;
}

export interface RecommendStackResponse {
  companyContext: CompanyContext;
  recommendedAgents: RecommendedAgent[];
  trace: TraceStep[];
  summaryMetrics: StackSummaryMetrics;
  signalPreview: AccountResult[];
  liveMode: boolean;
  dataSource: "live" | "demo";
  intelligenceLayer: IntelligenceLayer;
}

// ── Bright Data primitives ──────────────────────────────────────────────────

export interface SerpResult {
  title: string;
  url: string;
  snippet: string;
}

export interface BrightDataPipelineOutput {
  trace: TraceStep[];
  results: AccountResult[];
  liveMode: boolean;
  intelligenceLayer: IntelligenceLayer;
}
