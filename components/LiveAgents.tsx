"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ToolMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  brightDataTools: string[];
  unitCost: number;
}

// Live Agents — the runnable tools exposed by the London API (the same catalog
// powering the playground). Surfaced on the home page so the live workforce is
// visible and one click from being run.
export function LiveAgents() {
  const [tools, setTools] = useState<ToolMeta[]>([]);

  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((d) => setTools(d.tools || []))
      .catch(() => {});
  }, []);

  if (!tools.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <Zap size={15} className="text-[var(--color-brand)]" /> Live Agents
          <span className="text-xs font-normal text-[var(--color-faint)]">
            running on the Bright Data pipeline
          </span>
        </h2>
        <Link
          href="/playground"
          className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
        >
          Open playground <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.id} href="/playground" className="group">
            <Card className="flex h-full flex-col p-4 transition-colors group-hover:border-[var(--color-brand)]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  {t.name}
                </h3>
                <Badge tone="brand">{t.unitCost} cr</Badge>
              </div>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--color-faint)]">
                {t.category}
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--color-muted)]">
                {t.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.brightDataTools.map((b) => (
                  <Badge key={b} tone="neutral">
                    {b}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
