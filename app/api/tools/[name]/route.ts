import { NextResponse } from "next/server";
import { getTool } from "@/lib/catalog";
import { meter } from "@/lib/metering";

// POST /api/tools/{tool_id} — invoke a catalog tool by id/name.
// Body is the tool's input arguments. Response includes the result + usage.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const tool = getTool(name);
  if (!tool) {
    return NextResponse.json(
      { error: `Unknown tool: ${name}` },
      { status: 404 },
    );
  }

  try {
    const args = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await tool.handler(args);
    const usage = meter(tool.id, tool.unitCost);
    return NextResponse.json({
      tool: tool.id,
      ...result,
      cost: { credits: tool.unitCost },
      usage,
    });
  } catch (err) {
    console.error(`[london] /api/tools/${name} error:`, err);
    return NextResponse.json(
      { error: `Tool '${tool.id}' failed` },
      { status: 500 },
    );
  }
}
