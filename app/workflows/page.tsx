import {
  Workflow,
  Clock,
  ArrowRight,
  Wrench,
  FileOutput,
  Play,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const WORKFLOWS = [
  {
    name: "GTM Account Discovery",
    trigger: "Manual or weekly schedule",
    agents: ["GTM Intelligence Agent", "Data Analyst", "Email Drafter"],
    tools: ["Bright Data SERP API", "Bright Data Web Unlocker"],
    output: "CRM-ready account list",
    status: "active",
  },
  {
    name: "Refund Automation",
    trigger: "New Zendesk ticket",
    agents: ["Intent Classifier", "Refund Specialist", "Response Drafter"],
    tools: ["Zendesk", "Policy Engine"],
    output: "Suggested reply and approval decision",
    status: "active",
  },
  {
    name: "Vendor Risk Monitoring",
    trigger: "Daily scan",
    agents: ["Security Risk Agent", "Evidence Extractor", "Alert Agent"],
    tools: ["Bright Data SERP API", "Bright Data Web Unlocker"],
    output: "Risk report with source URLs",
    status: "preview",
  },
];

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6">
      <PageHeader
        title="Workflows"
        subtitle="Multi-agent pipelines that chain governed agents into repeatable, observable outcomes."
        action={
          <Button>
            <Workflow size={15} /> New Workflow
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {WORKFLOWS.map((wf) => (
          <Card key={wf.name} className="flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-blue-soft)] text-[var(--color-blue)]">
                <Workflow size={19} />
              </span>
              <Badge tone={wf.status === "active" ? "emerald" : "amber"} dot>
                {wf.status === "active" ? "Active" : "Preview"}
              </Badge>
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              {wf.name}
            </h3>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <Clock size={13} className="text-[var(--color-faint)]" />
              {wf.trigger}
            </div>

            {/* Agent chain */}
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                Agent chain
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {wf.agents.map((a, i) => (
                  <span key={a} className="flex items-center gap-1.5">
                    <Badge tone="neutral">{a}</Badge>
                    {i < wf.agents.length - 1 ? (
                      <ArrowRight
                        size={12}
                        className="text-[var(--color-faint)]"
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                <Wrench size={11} /> Tools
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wf.tools.map((t) => (
                  <Badge
                    key={t}
                    tone={t.startsWith("Bright Data") ? "brand" : "neutral"}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
                <FileOutput size={13} className="text-[var(--color-faint)]" />
                {wf.output}
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline">
                <Play size={12} /> Run
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
