import { Table2, ExternalLink } from "lucide-react";
import type { AccountResult } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function ResultsTable({
  results,
  live,
}: {
  results: AccountResult[];
  live: boolean;
}) {
  return (
    <Card className="animate-rise overflow-hidden">
      <CardHeader
        title="Account Intelligence"
        subtitle="Structured, workflow-ready output"
        icon={<Table2 size={16} />}
        action={
          <Badge tone={live ? "emerald" : "amber"} dot>
            {live ? "LIVE · Bright Data" : "Demo data"}
          </Badge>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wider text-[var(--color-faint)]">
              <Th className="w-12">#</Th>
              <Th>Company</Th>
              <Th>Signal</Th>
              <Th>Evidence</Th>
              <Th className="w-20">Conf.</Th>
              <Th>Outbound angle</Th>
              <Th className="w-28">Source</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.rank}
                className="border-b border-[var(--color-border)] align-top last:border-0 hover:bg-[var(--color-surface-muted)]"
              >
                <Td>
                  <span className="font-mono text-[var(--color-faint)]">
                    {r.rank}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {r.company}
                  </span>
                </Td>
                <Td>
                  <Badge tone="blue">{r.signal}</Badge>
                </Td>
                <Td>
                  <span className="text-[var(--color-muted)]">{r.evidence}</span>
                </Td>
                <Td>
                  <Confidence value={r.confidence} />
                </Td>
                <Td>
                  <span className="text-[var(--color-ink-soft)]">
                    {r.outboundAngle}
                  </span>
                </Td>
                <Td>
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      {r.source} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">
                      {r.source}
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 90
      ? "var(--color-emerald)"
      : pct >= 80
        ? "var(--color-blue)"
        : "var(--color-amber)";
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs font-semibold text-[var(--color-ink)]">
        {value.toFixed(2)}
      </span>
      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-[var(--color-border)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: tone }}
        />
      </span>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3.5">{children}</td>;
}
