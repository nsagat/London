"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const EXAMPLES = [
  "Find AI infrastructure companies hiring GTM roles",
  "Monitor competitor pricing changes",
  "Find recent funding signals in cybersecurity",
  "Track product launches from sales AI companies",
];

const DEFAULT_TASK =
  "Find 10 AI security startups with recent hiring or funding signals and suggest outbound angles.";

export function TaskInput({
  loading,
  onRoute,
}: {
  loading: boolean;
  onRoute: (task: string) => void;
}) {
  const [task, setTask] = useState(DEFAULT_TASK);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
          <Sparkles size={15} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">
            Employee Task
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            Describe what you need — London routes it to the right governed agent.
          </p>
        </div>
      </div>

      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        rows={3}
        placeholder="e.g. Find 10 AI security startups with recent funding signals…"
        className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-brand)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setTask(ex)}
            disabled={loading}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--color-faint)]">
          Routed under Acme Corp public-web policy
        </span>
        <Button onClick={() => onRoute(task)} disabled={loading || !task.trim()}>
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Routing…
            </>
          ) : (
            <>
              <Send size={15} /> Route Task
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
