import { NextResponse } from "next/server";
import { isLive } from "@/lib/brightdata";

// GET /api/health — liveness probe for the deploy platform (Railway healthcheck).
// Reports whether Bright Data is configured, but never fails on that (the app is
// healthy in demo mode too).
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "london-gtm-intelligence",
    brightData: isLive() ? "live" : "demo",
    time: new Date().toISOString(),
  });
}
