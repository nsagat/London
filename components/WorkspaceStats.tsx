import { Bot, ShieldCheck, Activity, Gauge } from "lucide-react";
import { WORKSPACE_STATS } from "@/lib/agents";

const STATS = [
  {
    label: "Connected Agents",
    value: String(WORKSPACE_STATS.connectedAgents),
    delta: "+1 this week",
    icon: Bot,
    tone: "text-[var(--color-brand)] bg-[var(--color-brand-soft)]",
  },
  {
    label: "Active Policies",
    value: String(WORKSPACE_STATS.activePolicies),
    delta: "All enforced",
    icon: ShieldCheck,
    tone: "text-[var(--color-emerald)] bg-[var(--color-emerald-soft)]",
  },
  {
    label: "Tool Calls Today",
    value: String(WORKSPACE_STATS.toolCallsToday),
    delta: "+18% vs yesterday",
    icon: Activity,
    tone: "text-[var(--color-blue)] bg-[var(--color-blue-soft)]",
  },
  {
    label: "Avg Confidence",
    value: `${WORKSPACE_STATS.avgConfidence}%`,
    delta: "High-fit results",
    icon: Gauge,
    tone: "text-[var(--color-amber)] bg-[var(--color-amber-soft)]",
  },
];

export function WorkspaceStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.tone}`}
            >
              <s.icon size={17} strokeWidth={2.2} />
            </span>
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {s.value}
          </div>
          <div className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
            {s.label}
          </div>
          <div className="mt-2 text-[11px] text-[var(--color-faint)]">
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}
