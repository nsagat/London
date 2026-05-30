import { NextResponse } from "next/server";
import { getUsage } from "@/lib/metering";

// GET /api/usage — current pay-as-you-go usage snapshot for the workspace.
export async function GET() {
  return NextResponse.json(getUsage());
}
