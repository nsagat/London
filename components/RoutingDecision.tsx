import { GitBranch, ShieldCheck, Wrench } from "lucide-react";
import type { RouteTaskResponse } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function RoutingDecision({ data }: { data: RouteTaskResponse }) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Routing Decision"
        subtitle="How London dispatched this task"
        icon={<GitBranch size={16} />}
        action={
          <Badge tone={data.dataSource === "live" ? "emerald" : "amber"} dot>
            {data.dataSource === "live" ? "LIVE · Bright Data" : "Demo data"}
          </Badge>
        }
      />
      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Task type detected">
            <Badge tone="blue">{data.taskType}</Badge>
          </Field>
          <Field label="Selected agent">
            <Badge tone="brand">{data.selectedAgentOrTeam}</Badge>
          </Field>
        </div>

        <Field label="Routing reason">
          <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {data.routingReason}
          </p>
        </Field>

        <div>
          <Label>Approved tools</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.approvedTools.map((t) => (
              <Badge
                key={t}
                tone={t.startsWith("Bright Data") ? "brand" : "neutral"}
              >
                <Wrench size={11} /> {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-emerald)]/25 bg-[var(--color-emerald-soft)] p-3.5">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-emerald)]"
          />
          <div>
            <div className="text-sm font-semibold capitalize text-[var(--color-emerald)]">
              Policy {data.policyDecision.status}
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
              {data.policyDecision.reason}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
