import {
  Activity,
  Timer,
  DollarSign,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const KPIS = [
  { label: "Total agent runs", value: "1,284", delta: "+12% wk", icon: Activity, tone: "brand" },
  { label: "Avg latency", value: "3.8s", delta: "-0.4s", icon: Timer, tone: "blue" },
  { label: "Avg cost / task", value: "$0.41", delta: "stable", icon: DollarSign, tone: "amber" },
  { label: "Success rate", value: "97.4%", delta: "+0.6%", icon: CheckCircle2, tone: "emerald" },
  { label: "Policy blocks", value: "3", delta: "this week", icon: ShieldAlert, tone: "rose" },
  { label: "Pipeline impact", value: "$128K", delta: "+$22K", icon: TrendingUp, tone: "emerald" },
] as const;

const TOOL_CALLS = [
  { name: "Bright Data SERP API", value: 612, brand: true },
  { name: "Bright Data Web Unlocker", value: 438, brand: true },
  { name: "Bright Data Web Scraper API", value: 271, brand: true },
  { name: "LLM Signal Extractor", value: 524 },
  { name: "CRM Sync", value: 156 },
];

const RUNS_TREND = [38, 44, 41, 52, 49, 63, 58, 71, 66, 78, 84, 92];

const TOP_AGENTS = [
  { name: "GTM Intelligence Agent", runs: 642, pct: 100 },
  { name: "Account Enrichment Agent", runs: 318, pct: 50 },
  { name: "Outbound Personalization Agent", runs: 214, pct: 33 },
  { name: "CRM Sync Agent", runs: 110, pct: 17 },
];

const TONE: Record<string, string> = {
  brand: "text-[var(--color-brand)] bg-[var(--color-brand-soft)]",
  blue: "text-[var(--color-blue)] bg-[var(--color-blue-soft)]",
  amber: "text-[var(--color-amber)] bg-[var(--color-amber-soft)]",
  emerald: "text-[var(--color-emerald)] bg-[var(--color-emerald-soft)]",
  rose: "text-[var(--color-rose)] bg-[var(--color-rose-soft)]",
};

export default function PerformancePage() {
  const maxTool = Math.max(...TOOL_CALLS.map((t) => t.value));
  const maxRun = Math.max(...RUNS_TREND);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Performance"
        subtitle="Observability across every agent run — London is a control plane, not just a chat interface."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => (
          <Card key={k.label} className="p-4">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONE[k.tone]}`}
            >
              <k.icon size={17} />
            </span>
            <div className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-ink)]">
              {k.value}
            </div>
            <div className="text-xs text-[var(--color-muted)]">{k.label}</div>
            <div className="mt-1 text-[11px] text-[var(--color-faint)]">
              {k.delta}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tool calls by provider */}
        <Card>
          <CardHeader
            title="Tool calls by provider"
            subtitle="Bright Data powers the majority of live web calls"
          />
          <div className="space-y-3 p-5">
            {TOOL_CALLS.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                    {t.name}
                    {t.brand ? <Badge tone="brand">Bright Data</Badge> : null}
                  </span>
                  <span className="font-mono text-[var(--color-muted)]">
                    {t.value}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(t.value / maxTool) * 100}%`,
                      background: t.brand
                        ? "var(--color-brand)"
                        : "var(--color-blue)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Runs trend */}
        <Card>
          <CardHeader
            title="Agent runs (last 12 weeks)"
            subtitle="Steady week-over-week growth"
          />
          <div className="p-5">
            <div className="flex h-40 items-end gap-2">
              {RUNS_TREND.map((v, i) => (
                <div
                  key={i}
                  className="group flex-1 rounded-t-md bg-[var(--color-brand)]/85 transition-all hover:bg-[var(--color-brand)]"
                  style={{ height: `${(v / maxRun) * 100}%` }}
                  title={`Week ${i + 1}: ${v} runs`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[var(--color-faint)]">
              <span>12w ago</span>
              <span>this week</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Most used agents */}
      <Card>
        <CardHeader
          title="Most used agents"
          subtitle="Where the workspace spends its automation"
        />
        <div className="space-y-3 p-5">
          {TOP_AGENTS.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <span className="w-56 shrink-0 truncate text-sm text-[var(--color-ink-soft)]">
                {a.name}
              </span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <span
                  className="block h-full rounded-full bg-[var(--color-emerald)]"
                  style={{ width: `${a.pct}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-[var(--color-muted)]">
                {a.runs}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
