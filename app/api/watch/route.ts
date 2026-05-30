import { NextResponse } from "next/server";
import { createWatch, listWatches, serializeWatch } from "@/lib/watch";

// GET /api/watch — list all watches (summary).
export async function GET() {
  return NextResponse.json({ watches: listWatches() });
}

// POST /api/watch — create a watch and seed its baseline.
// Body: { type: "competitor" | "vertical", target: string, intervalMinutes?: number }
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type?: string;
      target?: string;
      intervalMinutes?: number;
    };
    if (body?.type !== "competitor" && body?.type !== "vertical") {
      return NextResponse.json(
        { error: "type must be 'competitor' or 'vertical'" },
        { status: 400 },
      );
    }
    if (!body?.target || typeof body.target !== "string") {
      return NextResponse.json(
        { error: "Missing required field: target" },
        { status: 400 },
      );
    }
    const watch = await createWatch({
      type: body.type,
      target: body.target,
      intervalMinutes: body.intervalMinutes,
    });
    return NextResponse.json(serializeWatch(watch), { status: 201 });
  } catch (err) {
    console.error("[london] POST /api/watch error:", err);
    return NextResponse.json({ error: "Failed to create watch" }, { status: 500 });
  }
}
