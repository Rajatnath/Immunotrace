import { NextResponse } from "next/server";
import { runMistralHealthReport } from "@/lib/ai/immunoTraceAI";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const report = await runMistralHealthReport(session.user.id);

  return NextResponse.json({
    success: true,
    data: report,
  });
}
