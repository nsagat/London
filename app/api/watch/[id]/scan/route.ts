import { NextResponse } from "next/server";
import { getWatch, scanWatchById, serializeWatch } from "@/lib/watch";

// POST /api/watch/{id}/scan — re-scan now; returns the newly detected changes.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getWatch(id)) {
    return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  }
  try {
    const newEvents = (await scanWatchById(id)) ?? [];
    const watch = getWatch(id)!;
    return NextResponse.json({
      scannedAt: watch.lastScanAt,
      newSignals: newEvents.map((e) => e.item),
      newCount: newEvents.length,
      watch: serializeWatch(watch),
    });
  } catch (err) {
    console.error(`[london] POST /api/watch/${id}/scan error:`, err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
