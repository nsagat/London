"use client";

import { useMemo, useState } from "react";
import { Bot, Star, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import {
  MARKETPLACE_AGENTS,
  MARKETPLACE_CATEGORIES,
} from "@/lib/marketplace";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["All", ...MARKETPLACE_CATEGORIES];

function initials(name: string) {
  return name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function MarketplacePage() {
  const [active, setActive] = useState("All");

  const directory = useMemo(
    () =>
      active === "All"
        ? MARKETPLACE_AGENTS
        : MARKETPLACE_AGENTS.filter((a) => a.category === active),
    [active],
  );

  const liveCount = MARKETPLACE_AGENTS.filter((a) => a.live).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Agent Marketplace"
        subtitle={`Browse and deploy specialized GTM and operations agents into the Acme Corp workspace. ${MARKETPLACE_AGENTS.length} agents · ${liveCount} running live on London.`}
      />

      {/* Live in London — the agents that run today on the Bright Data pipeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <Zap size={15} className="text-[var(--color-brand)]" /> Live in London
          </h2>
          <Link
            href="/playground"
            className="text-xs font-medium text-[var(--color-brand)] hover:underline"
          >
            Try them in the playground →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {agent.mcpReady === "yes" ? (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-emerald)]">
                    <ShieldCheck size={12} /> MCP-ready
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-faint)]">
                    MCP soon
                  </span>
                )}
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
      </section>

      {/* Full agent directory — browse the broader GTM agent ecosystem */}
      <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          Agent Directory
        </h2>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                c === active
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {directory.map((agent) => (
            <Card
              key={`${agent.name}-${agent.provider}`}
              className="flex items-start gap-3 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] font-mono text-xs font-semibold text-[var(--color-ink-soft)]">
                {initials(agent.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-[var(--color-ink)]">
                    {agent.name}
                  </h3>
                  {agent.live ? (
                    <Badge tone="emerald" dot>
                      Live
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-faint)]">
                  {agent.category} · {agent.provider}
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-amber)]">
                    <Star size={12} className="fill-current" /> 4.
                    {7 + (agent.name.length % 3)}
                  </span>
                  <Button
                    variant={agent.live ? "secondary" : "ghost"}
                    className="px-3 py-1 text-xs"
                  >
                    {agent.live ? "Run" : "Deploy"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
