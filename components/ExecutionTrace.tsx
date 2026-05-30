import { Check, Minus, X, Zap } from "lucide-react";
import type { TraceStep } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function ExecutionTrace({
  trace,
  title = "Agent Execution Trace",
  subtitle = "Every tool call, in order, with latency",
}: {
  trace: TraceStep[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title={title}
        subtitle={subtitle}
        icon={<Zap size={16} />}
        action={
          <Badge tone="neutral">
            {trace.length} step{trace.length === 1 ? "" : "s"}
          </Badge>
        }
      />
      <ol className="relative p-5">
        {/* vertical line */}
        <span className="absolute bottom-7 left-[34px] top-9 w-px bg-[var(--color-border)]" />
        {trace.map((step) => (
          <li key={step.step} className="relative flex gap-4 pb-5 last:pb-0">
            <StepDot status={step.status} index={step.step} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-xs ${
                    step.brightData
                      ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                      : "bg-[var(--color-ink)] text-[#e7e9ee]"
                  }`}
                >
                  {step.tool}
                </span>
                {step.brightData ? (
                  <Badge tone="brand">Bright Data</Badge>
                ) : null}
                <StatusPill status={step.status} />
                {step.latency !== "absorb" ? (
                  <span className="ml-auto font-mono text-xs text-[var(--color-faint)]">
                    {step.latency}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {step.purpose}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function StepDot({
  status,
  index,
}: {
  status: TraceStep["status"];
  index: number;
}) {
  const map = {
    success: "bg-[var(--color-emerald)] text-white",
    skipped: "bg-[var(--color-amber)] text-white",
    error: "bg-[var(--color-rose)] text-white",
  } as const;
  return (
    <span
      className={`relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ring-4 ring-[var(--color-surface)] ${map[status]}`}
      title={`Step ${index}`}
    >
      {status === "success" ? (
        <Check size={11} strokeWidth={3} />
      ) : status === "skipped" ? (
        <Minus size={11} strokeWidth={3} />
      ) : (
        <X size={11} strokeWidth={3} />
      )}
    </span>
  );
}

function StatusPill({ status }: { status: TraceStep["status"] }) {
  if (status === "success") return <Badge tone="emerald">Success</Badge>;
  if (status === "skipped") return <Badge tone="amber">Skipped</Badge>;
  return <Badge tone="rose">Error</Badge>;
}
