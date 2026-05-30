import { ArrowUpRight, Plus } from "lucide-react";
import {
  ACTIVE_AGENTS,
  INTEGRATIONS,
  RECENT_ACTIVITY,
} from "@/lib/agents";

export function RightPanel() {
  return (
    <div className="hidden w-[300px] shrink-0 space-y-4 xl:block">
      <ActiveAgents />
      <RecentActivity />
      <Integrations />
    </div>
  );
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
        <button className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-brand)] hover:underline">
          View all <ArrowUpRight size={12} />
        </button>
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

function ActiveAgents() {
  return (
    <PanelShell title="Active GTM Agents">
      <ul>
        {ACTIVE_AGENTS.map((a) => (
          <li
            key={a.name}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-[var(--color-surface-muted)]"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  a.status === "online"
                    ? "bg-[var(--color-emerald)] animate-dot"
                    : "bg-[var(--color-amber)]"
                }`}
              />
              <span className="text-sm text-[var(--color-ink)]">{a.name}</span>
            </div>
            <span className="text-xs capitalize text-[var(--color-muted)]">
              {a.status}
            </span>
          </li>
        ))}
      </ul>
      <div className="px-2 pb-1 pt-1.5 text-xs font-medium text-[var(--color-muted)]">
        +12 agents active across the workspace
      </div>
    </PanelShell>
  );
}

function RecentActivity() {
  return (
    <PanelShell title="Recent GTM Activity">
      <ul className="space-y-0.5">
        {RECENT_ACTIVITY.map((r) => (
          <li key={r.text} className="rounded-lg px-2 py-1.5">
            <div className="text-sm text-[var(--color-ink)]">{r.text}</div>
            <div className="text-xs text-[var(--color-faint)]">{r.when}</div>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

function Integrations() {
  return (
    <PanelShell title="Integrations">
      <div className="grid grid-cols-2 gap-2 p-1">
        {INTEGRATIONS.slice(0, 6).map((i) => (
          <div
            key={i.name}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
              i.highlight
                ? "border-[var(--color-brand)]/40 bg-[var(--color-brand-soft)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
                i.highlight
                  ? "bg-[var(--color-brand)] text-white"
                  : "bg-white text-[var(--color-ink-soft)] border border-[var(--color-border)]"
              }`}
            >
              {i.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-[var(--color-ink)]">
                {i.name}
              </div>
              <div
                className={`text-[10px] ${
                  i.connected
                    ? "text-[var(--color-emerald)]"
                    : "text-[var(--color-faint)]"
                }`}
              >
                {i.connected ? "Connected" : "Available"}
              </div>
            </div>
          </div>
        ))}
        <button className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border-strong)] px-2.5 py-2 text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]">
          <Plus size={13} /> Add integration
        </button>
      </div>
    </PanelShell>
  );
}
