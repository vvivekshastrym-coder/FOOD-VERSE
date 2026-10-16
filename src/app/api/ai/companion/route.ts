import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processAICompanionQuery } from "@/lib/aiCompanion";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query prompt required" }, { status: 400 });
    }

    const response = await processAICompanionQuery({
      query,
      userId: session?.userId
    });

    return NextResponse.json({
      success: true,
      ...response
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "AI Companion processing failed" }, { status: 500 });
  }
}
