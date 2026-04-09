import { getGeminiClient } from "@/lib/ai/geminiClient";
import type { PrescriptionEntry } from "@/lib/types/domain";

/**
 * Convert a PrescriptionEntry into a single semantic text chunk.
 * This ensures the vector embedding captures all relevant medical context.
 */
export function buildPrescriptionSemanticText(entry: PrescriptionEntry, date: string): string {
  const symptomsText = entry.symptoms
    .map((s) => `${s.name} (${s.severity}) for ${s.durationDays || "?"} days`)
    .join(", ");

  const medicinesText = entry.medicines
    .map((m) => `${m.name} [${m.dosage}, ${m.frequency}] for ${m.durationDays} days`)
    .join(", ");

  return `
On ${date}, the patient was diagnosed with ${entry.diagnosis} (categorized as: ${entry.illnessName}).
Symptoms included: ${symptomsText}.
The prescribed treatment was: ${medicinesText}.
Outcome of this encounter: ${entry.outcome}.
Additional physician notes: ${entry.notes || "None"}.
`.trim();
}

/**
 * Generate a 768-dimensional float embedding vector for the provided text.
 * Uses the stable embedding-001 model for maximum compatibility.
 */
export async function generateContentEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY for Mistral Embeddings.");
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-embed-2312",
        input: [text],
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Mistral Embedding failure:", response.status, errText);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const vector = data.data?.[0]?.embedding;
    
    // mistral-embed usually provides 1024 dimensions
    if (!vector || vector.length < 512) {
      throw new Error("Invalid or missing embedding shape returned from Mistral");
    }
    
    return vector;
  } catch (error: any) {
    console.error("Error generating Mistral embedding:", error);
    // Return zero vector fallback to prevent crashing the UI
    return new Array(1024).fill(0);
  }
}
