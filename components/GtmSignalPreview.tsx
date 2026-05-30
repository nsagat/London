import { Radar, ArrowRight } from "lucide-react";
import type { AccountResult } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";

const AGENT_FOR_SIGNAL: Record<string, string> = {
  hiring: "Lead Research Agent",
  funding: "Account Enrichment Agent",
  launch: "Outbound Personalization Agent",
  product: "Outbound Personalization Agent",
};

function suggestAgent(signal: string): string {
  const s = signal.toLowerCase();
  for (const key of Object.keys(AGENT_FOR_SIGNAL)) {
    if (s.includes(key)) return AGENT_FOR_SIGNAL[key];
  }
  return "Lead Research Agent";
}

export function GtmSignalPreview({
  signals,
  live,
}: {
  signals: AccountResult[];
  live: boolean;
}) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Live GTM Signal Preview"
        subtitle="Account signals discovered via Bright Data"
        icon={<Radar size={16} />}
        action={
          <Badge tone={live ? "emerald" : "amber"} dot>
            {live ? "LIVE · Bright Data" : "Demo data"}
          </Badge>
        }
      />
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {signals.map((s) => (
          <div
            key={s.rank}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
          >
            <h4 className="text-sm font-semibold text-[var(--color-ink)]">
              {s.company}
            </h4>
            <div className="mt-1.5">
              <Badge tone="blue">{s.signal}</Badge>
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{s.evidence}</p>
            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--color-border)] pt-2.5 text-xs">
              <span className="text-[var(--color-faint)]">{s.source}</span>
              <ArrowRight size={12} className="text-[var(--color-faint)]" />
              <span className="font-medium text-[var(--color-brand)]">
                {suggestAgent(s.signal)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
