import { NextResponse } from "next/server";
import { runGeminiDietPlan } from "@/lib/ai/healthwiseAI";

export async function POST() {
  const plan = await runGeminiDietPlan();

  return NextResponse.json({
    success: true,
    data: plan,
  });
}
