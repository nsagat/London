import { Bot, Star, ShieldCheck } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["All", "Revenue Intelligence", "Customer Operations", "Market Intelligence", "Risk Intelligence"];

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Agent Marketplace"
        subtitle="Browse and deploy specialized GTM and operations agents into the Acme Corp workspace."
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              i === 0
                ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <Card key={agent.id} className="flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <Bot size={19} />
              </span>
              <StatusBadge status={agent.status} />
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              {agent.name}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--color-faint)]">
              {agent.category} · {agent.provider}
            </p>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--color-muted)]">
              {agent.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.tools.slice(0, 3).map((t) => (
                <Badge key={t.name} tone={t.brightData ? "brand" : "neutral"}>
                  {t.name}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span className="flex items-center gap-1 font-medium text-[var(--color-amber)]">
                  <Star size={12} className="fill-current" /> 4.
                  {7 + (agent.id.length % 3)}
                </span>
                {agent.mcpReady === "yes" ? (
                  <span className="flex items-center gap-1 text-[var(--color-emerald)]">
                    <ShieldCheck size={12} /> MCP-ready
                  </span>
                ) : (
                  <span className="text-[var(--color-faint)]">MCP soon</span>
                )}
              </div>
              <Button
                variant={agent.status === "active" ? "secondary" : "ghost"}
                className="px-3 py-1.5 text-xs"
              >
                {agent.status === "active" ? "Deployed" : "Deploy"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
