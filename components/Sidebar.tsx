"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Boxes,
  Workflow,
  BarChart3,
  Plug,
  Settings,
  Sparkles,
  Activity,
} from "lucide-react";
import { cn } from "./ui/cn";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/build-team", label: "Build GTM Team", icon: Sparkles },
  { href: "/marketplace", label: "Agent Marketplace", icon: Store },
  { href: "/agents", label: "Deployed Agents", icon: Boxes },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-ink)] text-white">
          <Activity size={17} strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            LONDON
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-faint)]">
            GTM Control Plane
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]",
              )}
            >
              <Icon size={16} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* GTM stack health card */}
      <div className="m-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-ink)]">
            GTM Stack Health
          </span>
          <span className="text-xs font-semibold text-[var(--color-emerald)]">
            87%
          </span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-emerald)]"
            style={{ width: "87%" }}
          />
        </div>
        <dl className="space-y-1.5 text-[11px]">
          <Row k="Active Agents" v="5" />
          <Row k="Monthly Budget" v="$2,000" />
          <Row k="Pipeline Generated" v="$128K" />
        </dl>
      </div>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-muted)]">{k}</dt>
      <dd className="font-medium text-[var(--color-ink)]">{v}</dd>
    </div>
  );
}
