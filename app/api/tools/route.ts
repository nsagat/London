import { NextResponse } from "next/server";
import { catalogManifest } from "@/lib/catalog";
import { getUsage } from "@/lib/metering";

// GET /api/tools — discover the GTM intelligence tool catalog.
// This is London's "discover what an agent can call" surface.
export async function GET() {
  return NextResponse.json({
    name: "London GTM Intelligence API",
    description:
      "Unified, agent-native API for Bright Data–powered GTM intelligence. Discover, call, and meter GTM tools through one HTTP/MCP surface — no Bright Data setup required.",
    invoke: "POST /api/tools/{tool_id}",
    usage: getUsage(),
    tools: catalogManifest(),
  });
}
