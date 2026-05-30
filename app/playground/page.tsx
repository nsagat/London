"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Copy, Check, Loader2, Activity, Plug, Zap } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ToolMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  brightDataTools: string[];
  unitCost: number;
}

interface Usage {
  calls: number;
  unitsConsumed: number;
  creditsRemaining: number;
  estimatedCost: string;
  byTool: Record<string, number>;
}

const EXAMPLE_ARGS: Record<string, unknown> = {
  discover_companies: { vertical: "AI security startups", limit: 8 },
  find_account_signals: {
    vertical: "AI security startups",
    signals: ["funding", "hiring"],
    limit: 10,
  },
  enrich_account: { company: "Cyberhaven" },
  monitor_competitor: { competitor: "Datadog" },
  recommend_gtm_stack: {
    companyPrompt:
      "B2B cybersecurity startup selling to mid-market SaaS, $2,000/month outbound budget",
  },
  create_watch: { type: "competitor", target: "Snyk" },
  check_watch: { watchId: "paste-a-watch-id" },
};

export default function PlaygroundPage() {
  const [origin, setOrigin] = useState("");
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [selected, setSelected] = useState("find_account_signals");
  const [args, setArgs] = useState("{}");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/tools")
      .then((r) => r.json())
      .then((d) => setTools(d.tools || []))
      .catch(() => {});
    refreshUsage();
  }, []);

  useEffect(() => {
    setArgs(JSON.stringify(EXAMPLE_ARGS[selected] ?? {}, null, 2));
    setResult(null);
    setLatency(null);
  }, [selected]);

  function refreshUsage() {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }

  async function run() {
    setRunning(true);
    setResult(null);
    const t0 = Date.now();
    try {
      let body: unknown = {};
      try {
        body = JSON.parse(args || "{}");
      } catch {
        setResult({ error: "Invalid JSON in arguments" });
        setRunning(false);
        return;
      }
      const res = await fetch(`/api/tools/${selected}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setLatency(Date.now() - t0);
      setResult(data);
      if (data.usage) setUsage(data.usage);
      else refreshUsage();
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setRunning(false);
    }
  }

  const selectedMeta = tools.find((t) => t.id === selected);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            London API · Live Playground
          </h1>
          <Badge tone="emerald" dot>
            Live
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Discover the GTM intelligence catalog, connect any agent, and run live
          Bright Data calls — watch results and usage update in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Connect */}
          <Connect origin={origin} selected={selected} />

          {/* Run */}
          <Card>
            <CardHeader
              title="Run a tool live"
              subtitle="Pick a tool, edit the arguments, and Run"
              icon={<Zap size={16} />}
              action={
                selectedMeta ? (
                  <Badge tone="brand">{selectedMeta.unitCost} credits</Badge>
                ) : null
              }
            />
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap gap-2">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                      selected === t.id
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>

              {selectedMeta ? (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
                  {selectedMeta.description}
                  {selectedMeta.brightDataTools.map((b) => (
                    <Badge key={b} tone="neutral">
                      {b}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <textarea
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                rows={5}
                spellCheck={false}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-brand)] focus:bg-white"
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--color-faint)]">
                  POST /api/tools/{selected}
                </span>
                <Button onClick={run} disabled={running}>
                  {running ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Running…
                    </>
                  ) : (
                    <>
                      <Play size={15} /> Run
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Result */}
          {result ? <ResultView result={result} latency={latency} /> : null}
        </div>

        {/* Usage sidebar */}
        <div className="space-y-4">
          <UsagePanel usage={usage} />
        </div>
      </div>
    </div>
  );
}

function Connect({ origin, selected }: { origin: string; selected: string }) {
  const base = origin || "https://your-app.up.railway.app";
  const snippets = [
    {
      label: "HTTP · one call",
      code: `curl -s ${base}/api/tools/${selected} \\\n  -H 'content-type: application/json' \\\n  -d '{"vertical":"AI security startups"}'`,
    },
    {
      label: "Unified · natural language",
      code: `curl -s ${base}/api/agent \\\n  -H 'content-type: application/json' \\\n  -d '{"input":"Find AI security startups with funding signals"}'`,
    },
    {
      label: "MCP · add one URL to any agent",
      code: `claude mcp add --transport http london ${base}/api/mcp`,
    },
  ];
  return (
    <Card>
      <CardHeader
        title="Connect"
        subtitle="Integrate London from anywhere — no Bright Data setup"
        icon={<Plug size={16} />}
      />
      <div className="space-y-3 p-5">
        {snippets.map((s) => (
          <Snippet key={s.label} label={s.label} code={s.code} />
        ))}
      </div>
    </Card>
  );
}

function Snippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
        {label}
      </div>
      <div className="group relative">
        <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[#0b1220] p-3 font-mono text-xs leading-relaxed text-[#e7e9ee]">
          {code}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function ResultView({ result, latency }: { result: any; latency: number | null }) {
  const data = result?.data;
  const rows = data?.results || data?.companies || null;
  const moves = data?.moves || null;
  const signals = data?.signals || null;

  return (
    <Card className="animate-rise">
      <CardHeader
        title="Result"
        subtitle={`Returned in ${latency ?? "—"}ms`}
        icon={<Activity size={16} />}
        action={
          result?.dataSource ? (
            <Badge tone={result.dataSource === "live" ? "emerald" : "amber"} dot>
              {result.dataSource === "live" ? "LIVE · Bright Data" : "Demo"}
            </Badge>
          ) : null
        }
      />
      <div className="space-y-4 p-5">
        {result?.cost ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge tone="brand">cost: {result.cost.credits} credits</Badge>
            {result.intelligenceLayer ? (
              <Badge tone="neutral">engine: {result.intelligenceLayer}</Badge>
            ) : null}
          </div>
        ) : null}

        {rows ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wider text-[var(--color-faint)]">
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Signal</th>
                  <th className="px-3 py-2">Conf.</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2.5 font-semibold text-[var(--color-ink)]">
                      {r.company}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone="blue">{r.signal}</Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      {r.confidence ? r.confidence.toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--color-muted)]">
                      {r.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {moves ? (
          <ul className="space-y-2">
            {moves.map((m: any, i: number) => (
              <li key={i} className="rounded-lg border border-[var(--color-border)] p-3">
                <Badge tone="blue">{m.move}</Badge>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{m.detail}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {signals && !rows ? (
          <ul className="space-y-2">
            {signals.map((s: any, i: number) => (
              <li key={i} className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
                <span className="font-semibold">{s.company}</span> — {s.signal}
              </li>
            ))}
          </ul>
        ) : null}

        <details>
          <summary className="cursor-pointer text-xs font-medium text-[var(--color-brand)]">
            Raw JSON
          </summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-[var(--color-border)] bg-[#0b1220] p-3 font-mono text-[11px] leading-relaxed text-[#e7e9ee]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
}

function UsagePanel({ usage }: { usage: Usage | null }) {
  return (
    <Card>
      <CardHeader title="Usage" subtitle="Pay-as-you-go meter" icon={<Activity size={16} />} />
      <div className="space-y-3 p-5">
        <Stat label="Calls" value={usage?.calls ?? 0} />
        <Stat label="Credits used" value={usage?.unitsConsumed ?? 0} />
        <Stat label="Est. cost" value={usage?.estimatedCost ?? "$0.00"} />
        <Stat label="Credits remaining" value={usage?.creditsRemaining ?? 1000} />
        {usage?.byTool && Object.keys(usage.byTool).length ? (
          <div className="border-t border-[var(--color-border)] pt-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
              By tool
            </div>
            {Object.entries(usage.byTool).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5 text-xs">
                <span className="font-mono text-[var(--color-ink-soft)]">{k}</span>
                <span className="text-[var(--color-muted)]">{v}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="font-mono text-sm font-semibold text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
