import { Settings, KeyRound, Building2, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Server component — reads env to report Bright Data connection status.
export default function SettingsPage() {
  const liveMode = Boolean(process.env.BRIGHT_DATA_API_KEY);
  const serpZone = process.env.BRIGHT_DATA_SERP_ZONE || "serp_api";
  const unlockerZone = process.env.BRIGHT_DATA_UNLOCKER_ZONE || "web_unlocker";

  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-5 py-6">
      <PageHeader
        title="Settings"
        subtitle="Workspace configuration and data-source connection status."
      />

      {/* Demo environment notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-amber)]/30 bg-[var(--color-amber-soft)] p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-[var(--color-amber)]" />
        <div className="text-sm text-[var(--color-ink-soft)]">
          <span className="font-semibold text-[var(--color-amber)]">
            Demo environment.
          </span>{" "}
          London runs on in-memory mock data unless a Bright Data API key is
          configured. No database is used in this MVP.
        </div>
      </div>

      {/* Workspace */}
      <Card>
        <CardHeader
          title="Workspace"
          subtitle="Acme Corp"
          icon={<Building2 size={16} />}
        />
        <div className="divide-y divide-[var(--color-border)]">
          <Row label="Workspace name" value="Acme Corp" />
          <Row label="Plan" value="Enterprise (demo)" />
          <Row label="Default department" value="GTM" />
          <Row label="Data residency" value="Public web only" />
        </div>
      </Card>

      {/* Bright Data connection */}
      <Card>
        <CardHeader
          title="Bright Data Connection"
          subtitle="Live web-data backbone for GTM agents"
          icon={<KeyRound size={16} />}
          action={
            <Badge tone={liveMode ? "emerald" : "amber"} dot>
              {liveMode ? "Live" : "Mock fallback"}
            </Badge>
          }
        />
        <div className="divide-y divide-[var(--color-border)]">
          <Row
            label="API key"
            value={liveMode ? "Configured ✓" : "Not set — using demo data"}
          />
          <Row label="SERP zone" value={serpZone} mono />
          <Row label="Web Unlocker zone" value={unlockerZone} mono />
          <Row
            label="MCP server"
            value={process.env.BRIGHT_DATA_MCP_COMMAND || "npx @brightdata/mcp"}
            mono
          />
        </div>
        {!liveMode ? (
          <div className="border-t border-[var(--color-border)] px-5 py-3.5 text-xs text-[var(--color-muted)]">
            To go live: copy{" "}
            <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono text-[var(--color-ink)]">
              .env.example
            </code>{" "}
            to{" "}
            <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono text-[var(--color-ink)]">
              .env.local
            </code>
            , add your{" "}
            <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono text-[var(--color-ink)]">
              BRIGHT_DATA_API_KEY
            </code>
            , and restart.
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-[var(--color-ink-soft)]">{label}</span>
      <span
        className={`text-[var(--color-ink)] ${mono ? "font-mono text-xs" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
