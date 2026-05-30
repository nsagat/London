import { NextResponse } from "next/server";
import { recommendGtmStack } from "@/lib/recommend";
import type { RecommendStackInput } from "@/lib/types";

// POST /api/recommend-stack — recommend a budget-aware GTM agent stack.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RecommendStackInput;
    if (!body?.companyPrompt || typeof body.companyPrompt !== "string") {
      return NextResponse.json(
        { error: "Missing required field: companyPrompt" },
        { status: 400 },
      );
    }
    const result = await recommendGtmStack(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[london] /api/recommend-stack error:", err);
    return NextResponse.json(
      { error: "Failed to recommend stack" },
      { status: 500 },
    );
  }
}
