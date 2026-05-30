import {
  Building2,
  Target,
  Flag,
  Wallet,
  Route,
  Star,
} from "lucide-react";
import type { CompanyContext as Ctx } from "@/lib/types";
import { Card, CardHeader } from "./ui/Card";

export function CompanyContext({ ctx }: { ctx: Ctx }) {
  const items = [
    { icon: Building2, label: "Company type", value: ctx.companyType },
    { icon: Target, label: "Target market", value: ctx.targetMarket },
    { icon: Flag, label: "Goal", value: ctx.goal },
    { icon: Wallet, label: "Budget", value: ctx.budget },
    { icon: Route, label: "GTM motion", value: ctx.gtmMotion },
    { icon: Star, label: "Priority", value: ctx.priority },
  ];

  return (
    <Card className="animate-rise">
      <CardHeader
        title="Company Context"
        subtitle="Parsed by London's Goal Analyzer"
        icon={<Building2 size={16} />}
      />
      <div className="grid gap-px overflow-hidden rounded-b-2xl bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--color-faint)]">
              <it.icon size={14} /> {it.label}
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
