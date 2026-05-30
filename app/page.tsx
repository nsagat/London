"use client";

import { useState } from "react";
import { Users, Star } from "lucide-react";
import { WorkspaceStats } from "@/components/WorkspaceStats";
import { AgentsPanel } from "@/components/AgentsPanel";
import { PolicyPanel } from "@/components/PolicyPanel";
import { TaskInput } from "@/components/TaskInput";
import { RoutingDecision } from "@/components/RoutingDecision";
import { ExecutionTrace } from "@/components/ExecutionTrace";
import { ResultsTable } from "@/components/ResultsTable";
import { RightPanel } from "@/components/RightPanel";
import { JsonExport } from "@/components/JsonExport";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { RouteTaskResponse } from "@/lib/types";

export default function HomePage() {
  const [selectedAgent, setSelectedAgent] = useState("gtm-intelligence");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteTaskResponse | null>(null);

  async function routeTask(task: string) {
    setLoading(true);
    setResult(null);
    // brief, deliberate loading beat so the trace reveal reads well on stage
    const started = Date.now();
    try {
      const res = await fetch("/api/route-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace: "Acme Corp", task, department: "GTM" }),
      });
      const data = (await res.json()) as RouteTaskResponse;
      const elapsed = Date.now() - started;
      if (elapsed < 900) await new Promise((r) => setTimeout(r, 900 - elapsed));
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-5 py-6">
      <div className="min-w-0 flex-1 space-y-6">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
              GTM Intelligence Control Plane
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Register agents, route tasks, enforce policy, and turn live web
              data into account intelligence — powered by Bright Data.
            </p>
          </div>
          {result ? (
            <JsonExport data={result} filename="london-route-task.json" />
          ) : null}
        </div>

        <WorkspaceStats />

        {/* Connected agents */}
        <section className="space-y-3">
          <SectionTitle
            title="Connected Agents"
            hint="Select an agent to inspect its policy"
          />
          <AgentsPanel
            selectedId={selectedAgent}
            onSelect={setSelectedAgent}
          />
        </section>

        {/* Policy + Task input */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PolicyPanel agentId={selectedAgent} />
          <TaskInput loading={loading} onRoute={routeTask} />
        </div>

        {/* Loading shimmer */}
        {loading ? <LoadingState /> : null}

        {/* Results */}
        {result && !loading ? (
          <div className="space-y-6">
            <RoutingDecision data={result} />

            {result.mode === "support_automation" ? (
              <RecommendedTeam data={result} />
            ) : null}

            <ExecutionTrace trace={result.trace} />

            {result.results.length > 0 ? (
              <ResultsTable
                results={result.results}
                live={result.dataSource === "live"}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <RightPanel />
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h2>
      {hint ? (
        <span className="text-xs text-[var(--color-faint)]">{hint}</span>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
        <span className="h-2 w-2 animate-dot rounded-full bg-[var(--color-brand)]" />
        London is routing the task and running the Bright Data pipeline…
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-10 rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

// Recommended agent team card for the support-automation routing mode.
function RecommendedTeam({ data }: { data: RouteTaskResponse }) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Recommended Agent Team"
        subtitle="London assembled a governed team for this task"
        icon={<Users size={16} />}
        action={<Badge tone="brand">{data.recommendedAgents.length} agents</Badge>}
      />
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {data.recommendedAgents.map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                {a.name}
              </h4>
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-amber)]">
                <Star size={12} className="fill-current" /> {a.score}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              {a.description}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge tone="neutral">{a.provider}</Badge>
              {a.estimatedCost ? (
                <Badge tone="blue">{a.estimatedCost}</Badge>
              ) : null}
              {a.expectedLift ? (
                <Badge tone="emerald">{a.expectedLift}</Badge>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] px-5 py-3.5 text-sm">
        <Metric label="Est. Response Time" value={data.metrics.estimatedResponseTime} />
        <Metric label="Est. Cost" value={data.metrics.estimatedCost} />
        <Metric label="Automation Coverage" value={data.metrics.automationCoverage} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-[var(--color-faint)]">{label}</span>
      <span className="font-mono text-sm font-semibold text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}
