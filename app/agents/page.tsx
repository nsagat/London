import { Bot, Wrench, ShieldCheck, Building2 } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { getPolicy } from "@/lib/policies";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Deployed Agents"
        subtitle="Agents currently registered in the Acme Corp workspace, with their tools, policy, and MCP status."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {AGENTS.map((agent) => {
          const policy = getPolicy(agent.policyId ?? agent.id);
          return (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                    <Bot size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                      {agent.name}
                    </h3>
                    <span className="text-xs text-[var(--color-faint)]">
                      {agent.category}
                    </span>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {agent.description}
              </p>

              <div className="mt-4">
                <Label icon={<Wrench size={13} />}>Tools</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {agent.tools.map((t) => (
                    <Badge
                      key={t.name}
                      tone={t.brightData ? "brand" : "neutral"}
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-3.5 text-xs">
                <Meta icon={<Building2 size={13} />} label="Department">
                  {agent.department}
                </Meta>
                <Meta icon={<ShieldCheck size={13} />} label="Policy">
                  {policy?.allowedData ?? "—"}
                </Meta>
                <Meta label="MCP-ready">
                  <Badge tone={agent.mcpReady === "yes" ? "emerald" : "amber"}>
                    {agent.mcpReady === "yes" ? "Yes" : "Soon"}
                  </Badge>
                </Meta>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Label({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
      {icon} {children}
    </span>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[var(--color-faint)]">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium text-[var(--color-ink)]">{children}</div>
    </div>
  );
}
