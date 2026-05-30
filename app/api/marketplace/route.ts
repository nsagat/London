import { NextResponse } from "next/server";
import { marketplaceManifest } from "@/lib/marketplace";

// GET /api/marketplace — the GTM agent directory London lists & recommends.
// `live: true` agents are Bright Data–powered and run inside London today.
export async function GET() {
  return NextResponse.json(marketplaceManifest());
}
