import { NextResponse } from "next/server";
import { runGeminiOcrFromImage } from "@/lib/ai/healthwiseAI";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);

  if (!form) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORM_PARSE_ERROR",
          message: "Failed to parse multipart/form-data.",
        },
      },
      { status: 400 }
    );
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_FILE",
          message: "Send a file in multipart/form-data with field name 'file'.",
        },
      },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const extracted = await runGeminiOcrFromImage({
    mimeType: file.type || "image/jpeg",
    base64,
  });

  return NextResponse.json({
    success: true,
    data: {
      extracted,
      note: "Gemini OCR structured extraction.",
    },
  });
}
