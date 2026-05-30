"use client";

import { Bot, Check } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { Badge, StatusBadge } from "./ui/Badge";
import { cn } from "./ui/cn";

// Only the three "intelligence" agents appear on the control-plane home (the
// support team is shown in the marketplace / deployed views).
const HOME_AGENTS = AGENTS.filter((a) => a.id !== "support-team");

export function AgentsPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {HOME_AGENTS.map((agent) => {
        const selected = agent.id === selectedId;
        return (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className={cn(
              "group relative flex flex-col rounded-2xl border bg-[var(--color-surface)] p-4 text-left transition-all",
              selected
                ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30 shadow-[0_2px_8px_rgba(109,94,252,0.12)]"
                : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
            )}
          >
            {selected ? (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            ) : null}

            <div className="mb-3 flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  selected
                    ? "bg-[var(--color-brand)] text-white"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)]",
                )}
              >
                <Bot size={17} strokeWidth={2.2} />
              </span>
              <StatusBadge status={agent.status} />
            </div>

            <h4 className="text-sm font-semibold leading-tight text-[var(--color-ink)]">
              {agent.name}
            </h4>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[var(--color-muted)]">
              {agent.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="neutral">{agent.department}</Badge>
              {agent.tools.slice(0, 2).map((t) => (
                <Badge key={t.name} tone={t.brightData ? "brand" : "neutral"}>
                  {t.brightData ? "Bright Data" : t.name}
                </Badge>
              ))}
              {agent.tools.length > 2 ? (
                <Badge tone="neutral">+{agent.tools.length - 2}</Badge>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
