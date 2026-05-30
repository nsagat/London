"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CompanyContext } from "@/components/CompanyContext";
import { RecommendedStack } from "@/components/RecommendedStack";
import { GtmSignalPreview } from "@/components/GtmSignalPreview";
import { ExecutionTrace } from "@/components/ExecutionTrace";
import { RightPanel } from "@/components/RightPanel";
import { JsonExport } from "@/components/JsonExport";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { RecommendStackResponse } from "@/lib/types";

const DEFAULT_PROMPT =
  "We are a B2B cybersecurity startup selling to mid-market SaaS companies. We need more qualified outbound pipeline with a $2,000/month AI agent budget.";

export default function BuildTeamPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendStackResponse | null>(null);

  async function recommend() {
    setLoading(true);
    setResult(null);
    const started = Date.now();
    try {
      const res = await fetch("/api/recommend-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyPrompt: prompt }),
      });
      const data = (await res.json()) as RecommendStackResponse;
      const elapsed = Date.now() - started;
      if (elapsed < 1000) await new Promise((r) => setTimeout(r, 1000 - elapsed));
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
        <PageHeader
          title="Build your AI GTM Team"
          subtitle="Discover, deploy, and optimize sales, marketing, and revenue agents for your company."
          action={
            result ? (
              <JsonExport data={result} filename="london-gtm-stack.json" />
            ) : null
          }
        />

        {/* Prompt box */}
        <Card className="p-5">
          <label className="text-sm font-semibold text-[var(--color-ink)]">
            Tell London about your company, goals, target market, and budget.
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-2.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-brand)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand)]/15"
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={recommend} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Evaluating…
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Recommend GTM Agent Stack
                </>
              )}
            </Button>
          </div>
        </Card>

        {loading ? <LoadingState /> : null}

        {result && !loading ? (
          <div className="space-y-6">
            <CompanyContext ctx={result.companyContext} />
            <RecommendedStack
              agents={result.recommendedAgents}
              metrics={result.summaryMetrics}
            />
            <ExecutionTrace
              trace={result.trace}
              title="Agent Evaluation Trace"
              subtitle="How London evaluated and selected the stack"
            />
            <GtmSignalPreview
              signals={result.signalPreview}
              live={result.dataSource === "live"}
            />
          </div>
        ) : null}
      </div>

      <RightPanel />
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
        <span className="h-2 w-2 animate-dot rounded-full bg-[var(--color-brand)]" />
        London is evaluating GTM agents against your goals and budget…
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer h-10 rounded-lg" />
        ))}
      </div>
    </Card>
  );
}
