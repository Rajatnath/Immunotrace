import { NextResponse } from "next/server";
import { runMistralDietPlan } from "@/lib/ai/immunoTraceAI";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const plan = await runMistralDietPlan(session.user.id);

  return NextResponse.json({
    success: true,
    data: plan,
  });
}
