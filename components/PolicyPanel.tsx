import {
  Database,
  Wrench,
  DollarSign,
  Quote,
  Brain,
  UserCheck,
  FileJson,
} from "lucide-react";
import { getPolicy } from "@/lib/policies";
import { getAgent } from "@/lib/agents";
import { Card, CardHeader } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function PolicyPanel({ agentId }: { agentId: string }) {
  const agent = getAgent(agentId);
  const policy = getPolicy(agentId);
  if (!agent || !policy) return null;

  return (
    <Card>
      <CardHeader
        title="Agent Policy"
        subtitle={`Governance for ${agent.name}`}
        icon={<FileJson size={16} />}
        action={<Badge tone="emerald" dot>Enforced</Badge>}
      />
      <div className="divide-y divide-[var(--color-border)]">
        <Row icon={<Database size={15} />} label="Allowed data">
          <Badge tone="blue">{policy.allowedData}</Badge>
        </Row>
        <Row icon={<Wrench size={15} />} label="Approved tools">
          <div className="flex flex-wrap justify-end gap-1.5">
            {policy.approvedTools.map((t) => (
              <Badge
                key={t}
                tone={t.startsWith("Bright Data") ? "brand" : "neutral"}
              >
                {t}
              </Badge>
            ))}
          </div>
        </Row>
        <Row icon={<DollarSign size={15} />} label="Max cost per run">
          <span className="font-mono text-sm text-[var(--color-ink)]">
            {policy.maxCostPerRun}
          </span>
        </Row>
        <Row icon={<Quote size={15} />} label="Requires citations">
          <Badge tone={policy.requiresCitations ? "emerald" : "neutral"}>
            {policy.requiresCitations ? "Yes" : "No"}
          </Badge>
        </Row>
        <Row icon={<Brain size={15} />} label="Stores memory">
          <Badge tone={policy.storesMemory ? "amber" : "neutral"}>
            {policy.storesMemory ? "Yes" : "No (MVP)"}
          </Badge>
        </Row>
        <Row icon={<UserCheck size={15} />} label="Approval required">
          <Badge tone={policy.approvalRequired ? "amber" : "emerald"}>
            {policy.approvalRequired ? "Yes" : "No"}
          </Badge>
        </Row>
        <Row icon={<FileJson size={15} />} label="Output schema">
          <Badge tone="mono">{policy.outputSchema}</Badge>
        </Row>
      </div>
    </Card>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-2.5 text-sm text-[var(--color-ink-soft)]">
        <span className="text-[var(--color-faint)]">{icon}</span>
        {label}
      </div>
      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}
