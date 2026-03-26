import { NextResponse } from "next/server";
import { runGeminiHealthReport } from "@/lib/ai/healthwiseAI";

export async function POST() {
  const report = await runGeminiHealthReport();

  return NextResponse.json({
    success: true,
    data: report,
  });
}
