import { Layers, TrendingUp, Wrench, Sparkles } from "lucide-react";
import type { RecommendedAgent, StackSummaryMetrics } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export function RecommendedStack({
  agents,
  metrics,
}: {
  agents: RecommendedAgent[];
  metrics: StackSummaryMetrics;
}) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Recommended GTM Agent Stack"
        subtitle="Budget-aware team scored against your goals"
        icon={<Layers size={16} />}
        action={<Badge tone="brand">{agents.length} agents</Badge>}
      />

      <div className="grid gap-3 p-5 md:grid-cols-2">
        {agents.map((a) => (
          <div
            key={a.name}
            className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                  {a.name}
                </h4>
                {a.category ? (
                  <span className="text-xs text-[var(--color-faint)]">
                    {a.category}
                  </span>
                ) : null}
              </div>
              {a.confidence ? (
                <Badge tone="emerald">{a.confidence}% match</Badge>
              ) : null}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
              {a.description}
            </p>

            {a.whyRecommended ? (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-[var(--color-ink-soft)]">
                <Sparkles
                  size={13}
                  className="mt-0.5 shrink-0 text-[var(--color-brand)]"
                />
                {a.whyRecommended}
              </div>
            ) : null}

            {a.tools?.length ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {a.tools.map((t) => (
                  <Badge
                    key={t}
                    tone={t.startsWith("Bright Data") ? "brand" : "neutral"}
                  >
                    <Wrench size={10} /> {t}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs">
              <span className="font-mono font-semibold text-[var(--color-ink)]">
                {a.estimatedCost}
              </span>
              {a.expectedLift ? (
                <span className="flex items-center gap-1 font-medium text-[var(--color-emerald)]">
                  <TrendingUp size={12} /> {a.expectedLift}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-px overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-4">
        <Summary label="Total est. cost" value={metrics.totalEstimatedCost} />
        <Summary
          label="Remaining budget"
          value={metrics.remainingBudget}
          tone="emerald"
        />
        <Summary
          label="Projected pipeline"
          value={metrics.projectedPipelineImpact}
          tone="brand"
        />
        <Summary label="Hours saved" value={metrics.manualHoursSaved} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4">
        <Button variant="secondary">Compare Alternatives</Button>
        <Button>Deploy Recommended Stack</Button>
      </div>
    </Card>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "emerald" | "brand";
}) {
  const color =
    tone === "emerald"
      ? "text-[var(--color-emerald)]"
      : tone === "brand"
        ? "text-[var(--color-brand)]"
        : "text-[var(--color-ink)]";
  return (
    <div className="bg-[var(--color-surface)] p-4">
      <div className="text-xs text-[var(--color-faint)]">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tracking-tight ${color}`}>
        {value}
      </div>
    </div>
  );
}
