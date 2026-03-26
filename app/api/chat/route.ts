import { NextRequest, NextResponse } from "next/server";
import { runGeminiChat } from "@/lib/ai/healthwiseAI";
import {
  containsEmergencySignal,
  getSafetyDisclaimer,
} from "@/lib/safety/medicalGuardrails";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message: string = String(body.message ?? "");

  if (containsEmergencySignal(message)) {
    return NextResponse.json({
      success: true,
      data: {
        response:
          "Your symptoms may be serious. Please contact emergency medical services or visit the nearest hospital now.",
        shouldEscalate: true,
        disclaimer: getSafetyDisclaimer(),
      },
    });
  }

  const generated = await runGeminiChat(message);

  return NextResponse.json({
    success: true,
    data: {
      response: generated.response,
      shouldEscalate: generated.shouldEscalate,
      disclaimer: generated.disclaimer || getSafetyDisclaimer(),
    },
  });
}
