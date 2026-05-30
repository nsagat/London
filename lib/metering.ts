// ─────────────────────────────────────────────────────────────────────────────
// Usage metering — the "agentic, pay-as-you-go" layer.
//
// London exposes a catalog of GTM intelligence tools that agents call. Like an
// agent-native API platform, every call is metered: it consumes credits and
// accrues an estimated cost. This is an in-memory MVP meter (no real billing) —
// enough to demonstrate the model and return live usage in every response.
// ─────────────────────────────────────────────────────────────────────────────

export interface Usage {
  /** Total tool calls served this session. */
  calls: number;
  /** Credits consumed (sum of each tool's unit cost). */
  unitsConsumed: number;
  /** Credits left from the workspace allowance. */
  creditsRemaining: number;
  /** USD price per credit. */
  unitPriceUsd: number;
  /** Estimated spend so far. */
  estimatedCost: string;
  /** Per-tool call counts. */
  byTool: Record<string, number>;
}

const STARTING_CREDITS = 1000;
const UNIT_PRICE_USD = 0.01; // $0.01 per credit

interface MeterState {
  calls: number;
  unitsConsumed: number;
  byTool: Record<string, number>;
}

// Back the meter with globalThis so usage is shared across Next.js route bundles
// (each route is otherwise an isolated module instance) and survives HMR.
const g = globalThis as unknown as { __londonMeter?: MeterState };
const state: MeterState =
  g.__londonMeter ?? (g.__londonMeter = { calls: 0, unitsConsumed: 0, byTool: {} });

/** Record a tool call costing `units` credits and return the live usage snapshot. */
export function meter(toolId: string, units: number): Usage {
  state.calls += 1;
  state.unitsConsumed += units;
  state.byTool[toolId] = (state.byTool[toolId] ?? 0) + 1;
  return snapshot();
}

export function getUsage(): Usage {
  return snapshot();
}

function snapshot(): Usage {
  return {
    calls: state.calls,
    unitsConsumed: state.unitsConsumed,
    creditsRemaining: Math.max(0, STARTING_CREDITS - state.unitsConsumed),
    unitPriceUsd: UNIT_PRICE_USD,
    estimatedCost: `$${(state.unitsConsumed * UNIT_PRICE_USD).toFixed(2)}`,
    byTool: { ...state.byTool },
  };
}
