"use client";

import { ChevronDown, Circle } from "lucide-react";
import { Badge } from "./ui/Badge";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 px-5 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--color-faint)]">Workspace</span>
        <span className="text-[var(--color-faint)]">/</span>
        <span className="font-medium text-[var(--color-ink)]">
          GTM Intelligence
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Badge tone="amber" dot>
          Demo environment
        </Badge>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--color-brand)] text-[10px] font-bold text-white">
            A
          </span>
          Acme Corp
          <ChevronDown size={14} className="text-[var(--color-faint)]" />
        </button>
      </div>
    </header>
  );
}

export function LiveDot() {
  return <Circle size={8} className="fill-current text-current" />;
}
