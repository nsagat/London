import { NextResponse } from "next/server";
import { routeEnterpriseTask } from "@/lib/agent-router";
import type { RouteTaskInput } from "@/lib/types";

// POST /api/route-task — route an employee task to the right agent/team.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RouteTaskInput;
    if (!body?.task || typeof body.task !== "string") {
      return NextResponse.json(
        { error: "Missing required field: task" },
        { status: 400 },
      );
    }
    const result = await routeEnterpriseTask(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[london] /api/route-task error:", err);
    return NextResponse.json(
      { error: "Failed to route task" },
      { status: 500 },
    );
  }
}
