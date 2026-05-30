import { NextResponse } from "next/server";
import { runLondon, type LondonInput } from "@/lib/london";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/agent — the unified London entry point.
//
// One call handles everything: pass a natural-language `input` and London routes
// it to the right agent capability (GTM intelligence, support automation, or a
// GTM team recommendation) and returns a single typed envelope.
//
//   curl -s localhost:3000/api/agent -H 'content-type: application/json' \
//     -d '{"input":"Find AI security startups with recent funding signals"}'
//
// Optional fields: { workspace, department, mode: "auto"|"route_task"|"recommend_stack" }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LondonInput;
    if (!body?.input || typeof body.input !== "string") {
      return NextResponse.json(
        { error: "Missing required field: input" },
        { status: 400 },
      );
    }
    const result = await runLondon(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[london] /api/agent error:", err);
    return NextResponse.json(
      { error: "Failed to handle request" },
      { status: 500 },
    );
  }
}

// Lightweight discovery for clients that want to know what London can do.
export async function GET() {
  return NextResponse.json({
    name: "London Unified Agent API",
    endpoint: "/api/agent",
    method: "POST",
    input: {
      input: "string (natural language)",
      workspace: "string (optional, default 'Acme Corp')",
      department: "string (optional)",
      mode: "auto | route_task | recommend_stack (optional, default auto)",
    },
    capabilities: [
      {
        kind: "route_task",
        does: "Routes an actionable task to the right governed agent and executes it (GTM intelligence via Bright Data, or support automation).",
      },
      {
        kind: "recommend_stack",
        does: "Turns a company/goals/budget description into a recommended GTM agent team with an evaluation trace.",
      },
    ],
  });
}
