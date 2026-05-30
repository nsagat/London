import { NextResponse } from "next/server";
import { getWatch, deleteWatch, serializeWatch } from "@/lib/watch";

// GET /api/watch/{id} — watch detail: current items + change events (newest first).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const watch = getWatch(id);
  if (!watch) {
    return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  }
  return NextResponse.json(serializeWatch(watch));
}

// DELETE /api/watch/{id} — stop watching.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = deleteWatch(id);
  if (!ok) {
    return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: id });
}
