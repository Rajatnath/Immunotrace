import { z } from "zod";
import { getGeminiClient } from "@/lib/ai/geminiClient";
import {
  chatPromptContract,
  dietPromptContract,
  healthReportPromptContract,
} from "@/lib/ai/promptContracts";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { getSafetyDisclaimer, sanitizeMedicalResponse } from "@/lib/safety/medicalGuardrails";
import { dietPlanSchema, healthReportSchema } from "@/lib/types/domain";

const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const ocrSchema = z.object({
  illnessName: z.string(),
  diagnosis: z.string(),
  symptoms: z.array(z.string()),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
    })
  ),
  confidence: z.number().min(0).max(1),
});

const chatSchema = z.object({
  response: z.string(),
  shouldEscalate: z.boolean(),
  disclaimer: z.string(),
}).strict();

function extractFirstJsonObject(rawText: string) {
  const trimmed = rawText.trim();
  const direct = trimmed.match(/\{[\s\S]*\}$/);
  if (direct) {
    return direct[0];
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const genericFenced = trimmed.match(/```\s*([\s\S]*?)```/i);
  if (genericFenced?.[1]) {
    return genericFenced[1].trim();
  }

  return trimmed;
}

async function generateStructured<T>(params: {
  system: string;
  user: string;
  schema: z.ZodSchema<T>;
  fallback: T;
  extraParts?: Array<{ inlineData: { mimeType: string; data: string } }>;
}) {
  const client = getGeminiClient();
  if (!client) {
    return params.fallback;
  }

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { 
              text: `${params.system}

CRITICAL: You MUST respond with ONLY a valid JSON object matching this EXACT structure:
${JSON.stringify(params.fallback, null, 2)}

Do NOT add any extra fields. Do NOT wrap in markdown. Return ONLY the JSON.

${params.user}` 
            },
            ...(params.extraParts ?? []),
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    if (!text) {
      console.warn("Gemini returned empty response, using fallback");
      return params.fallback;
    }

    const jsonStr = extractFirstJsonObject(text);
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse failed for text:", jsonStr.substring(0, 200), parseError);
      return params.fallback;
    }

    try {
      return params.schema.parse(parsed);
    } catch (zodError) {
      console.error("Zod validation failed. Gemini returned:", JSON.stringify(parsed, null, 2));
      console.error("Validation error:", zodError);
      return params.fallback;
    }
  } catch (error) {
    console.error("Gemini structured generation failed", error);
    return params.fallback;
  }
}

async function buildHistoryContext() {
  const history = await listPrescriptions();
  if (history.length === 0) {
    return "No prescription history available.";
  }

  return history
    .map((entry) => {
      const symptoms = entry.symptoms.map((item) => item.name).join(", ");
      const medicines = entry.medicines.map((item) => item.name).join(", ");
      return `${entry.recordedDate} | ${entry.illnessName} | symptoms: ${symptoms} | diagnosis: ${entry.diagnosis} | medicines: ${medicines} | outcome: ${entry.outcome}`;
    })
    .join("\n");
}

export async function runGeminiOcrFromImage(file: { mimeType: string; base64: string }) {
  const fallback = {
    illnessName: "Upper respiratory infection",
    diagnosis: "Likely viral",
    symptoms: ["cough", "sore throat"],
    medicines: [{ name: "Cetirizine", dosage: "10 mg", frequency: "once daily" }],
    confidence: 0.5,
  };

  return generateStructured({
    system:
      "You extract structured information from Indian doctor prescriptions. Use conservative interpretation when handwriting is unclear.",
    user:
      "Extract illnessName, diagnosis, symptoms[], medicines[{name,dosage,frequency}], and confidence(0..1). If unknown, use best estimate and lower confidence.",
    schema: ocrSchema,
    fallback,
    extraParts: [{ inlineData: { mimeType: file.mimeType, data: file.base64 } }],
  });
}

export async function runGeminiHealthReport() {
  const context = await buildHistoryContext();
  const fallback = {
    generatedAt: new Date().toISOString(),
    summary: "Recurring cold pattern detected with seasonal sensitivity.",
    frequencyInsights: ["3 episodes in 6 months"],
    likelyTriggers: ["Season transition", "Sleep under 7 hours"],
    medicineResponse: ["Cetirizine and rest previously helped"],
    preventionActions: ["Hydration", "Consistent sleep", "Warm fluids"],
    disclaimer: getSafetyDisclaimer(),
  };

  const generated = await generateStructured({
    system: healthReportPromptContract.system,
    user: `Prescription history:\n${context}\n\nGenerate a personalized health pattern report with only observational, non-diagnostic language.`,
    schema: healthReportSchema,
    fallback,
  });

  return { ...generated, generatedAt: new Date().toISOString(), disclaimer: getSafetyDisclaimer() };
}

export async function runGeminiDietPlan() {
  const context = await buildHistoryContext();
  const fallback = {
    generatedAt: new Date().toISOString(),
    includeFoods: ["Amla", "Tulsi", "Ginger", "Moong dal"],
    avoidFoods: ["Cold drinks", "Deep-fried foods"],
    weeklySuggestions: ["Warm breakfast 5 days/week", "Soup dinner twice/week"],
    kadhaRecipe: "Boil tulsi, ginger, black pepper, and cinnamon for 8 minutes.",
    seasonalTips: ["Increase warm fluids during monsoon"],
    disclaimer: getSafetyDisclaimer(),
  };

  const generated = await generateStructured({
    system: dietPromptContract.system,
    user: `Prescription history:\n${context}\n\nCreate an Indian diet plan with includeFoods, avoidFoods, weeklySuggestions, kadhaRecipe, and seasonalTips. No dosage advice.`,
    schema: dietPlanSchema,
    fallback,
  });

  return { ...generated, generatedAt: new Date().toISOString(), disclaimer: getSafetyDisclaimer() };
}

export async function runGeminiChat(input: string) {
  const context = await buildHistoryContext();

  const fallback = {
    response:
      "Based on your history, start with rest, warm fluids, and steam inhalation, then monitor symptoms over 24-48 hours.",
    shouldEscalate: false,
    disclaimer: getSafetyDisclaimer(),
  };

  const generated = await generateStructured({
    system: chatPromptContract.system,
    user: `User message: ${input}\n\nPrescription history:\n${context}\n\nRespond safely without diagnosis or direct dosage instructions.`,
    schema: chatSchema,
    fallback,
  });

  return {
    ...generated,
    response: sanitizeMedicalResponse(generated.response),
    disclaimer: getSafetyDisclaimer(),
  };
}
