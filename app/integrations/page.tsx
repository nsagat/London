"use client";

import { useState } from "react";
import { Check, Plus, Sparkles, Loader2 } from "lucide-react";
import { INTEGRATIONS } from "@/lib/agents";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type ConnState = "idle" | "connecting" | "connected";

export default function IntegrationsPage() {
  // Seed connection state from the static catalog, then let the user connect more.
  const [status, setStatus] = useState<Record<string, ConnState>>(() =>
    Object.fromEntries(
      INTEGRATIONS.map((i) => [i.name, i.connected ? "connected" : "idle"]),
    ),
  );

  const connect = (name: string) => {
    setStatus((s) => ({ ...s, [name]: "connecting" }));
    // Simulate the connect handshake; swap for a real OAuth flow when available.
    setTimeout(() => {
      setStatus((s) => ({ ...s, [name]: "connected" }));
    }, 900);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect London to your data sources, CRM, and channels. Bright Data is the live web-data backbone for every GTM agent."
      />

      {/* Bright Data feature card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-[var(--color-brand-soft)] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)] text-lg font-bold text-white">
              BD
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  Bright Data
                </h3>
                <Badge tone="emerald" dot>
                  Connected
                </Badge>
              </div>
              <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">
                Live web intelligence backbone. Powers SERP discovery, page
                unlocking, structured scraping, and the MCP server that exposes
                these tools to London&apos;s GTM agents.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "SERP API",
                  "Web Unlocker",
                  "Web Scraper API",
                  "Scraping Browser",
                  "MCP Server",
                ].map((t) => (
                  <Badge key={t} tone="brand">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button variant="secondary">Manage</Button>
        </div>
      </Card>

      {/* Other integrations grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.filter((i) => !i.highlight).map((i) => {
          const state = status[i.name] ?? "idle";
          return (
            <Card key={i.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm font-bold text-[var(--color-ink-soft)]">
                  {i.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">
                    {i.name}
                  </div>
                  <div className="text-xs text-[var(--color-faint)]">
                    {i.category}
                  </div>
                </div>
              </div>
              {state === "connected" ? (
                <Badge tone="emerald" dot>
                  <Check size={11} /> Connected
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={() => connect(i.name)}
                  disabled={state === "connecting"}
                  className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-60"
                >
                  {state === "connecting" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      <Plus size={12} /> Connect
                    </>
                  )}
                </button>
              )}
            </Card>
          );
        })}

        <Card className="flex items-center justify-center border-dashed p-4">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <Sparkles size={14} className="text-[var(--color-brand)]" /> Browse
            integration catalog
          </button>
        </Card>
      </div>
    </div>
  );
}
