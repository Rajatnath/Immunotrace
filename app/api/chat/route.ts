import { NextRequest, NextResponse } from "next/server";
import { runGeminiChat } from "@/lib/ai/healthwiseAI";
import { auth } from "@/lib/auth";
import {
  containsEmergencySignal,
  getSafetyDisclaimer,
} from "@/lib/safety/medicalGuardrails";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message: string = String(body.message ?? "");
  const history: any[] = body.history ?? [];

  if (containsEmergencySignal(message)) {
    return NextResponse.json({
      success: true,
      data: {
        message: "Your symptoms may be serious. Please contact emergency medical services or visit the nearest hospital now.",
        clinicalAnalysis: {
          computationalSummary: "Symptom set suggests acute respiratory or cardiovascular distress requiring immediate physical intervention.",
          supportingHistory: [],
          suggestedActions: ["Seek Emergency Room", "Call 911/112"],
          shouldEscalate: true,
        },
        disclaimer: getSafetyDisclaimer(),
      },
    });
  }

  const generated = await runGeminiChat(message, session.user.id, history);

  return NextResponse.json({
    success: true,
    data: {
      message: generated.message,
      clinicalAnalysis: generated.clinicalAnalysis,
      ayushPerspective: generated.ayushPerspective,
      disclaimer: generated.disclaimer || getSafetyDisclaimer(),
    },
  });
}
