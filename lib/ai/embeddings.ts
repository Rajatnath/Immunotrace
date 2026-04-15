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
 * Check if a vector is a zero/failure vector (all zeros = embedding generation failed).
 */
export function isZeroVector(vector: number[]): boolean {
  return vector.length > 0 && vector.every(v => v === 0);
}

/**
 * Generate a 1024-dimensional float embedding vector for the provided text.
 * Uses the Mistral Embed model for semantic vector representations.
 * 
 * Returns null if embedding generation fails (instead of a zero vector that 
 * would pollute the vector store and corrupt cosine similarity searches).
 */
export async function generateContentEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("Missing MISTRAL_API_KEY — embedding generation skipped.");
    return null;
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-embed",
        input: [text],
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Mistral Embedding API error [${response.status}]:`, errText);
      return null;
    }

    const data = await response.json();
    const vector = data.data?.[0]?.embedding;
    
    if (!Array.isArray(vector) || vector.length < 512) {
      console.error("Invalid embedding shape returned from Mistral:", vector?.length);
      return null;
    }

    // Sanity check: if Mistral returns all zeros (shouldn't happen but guard against it)
    if (isZeroVector(vector)) {
      console.warn("Mistral returned a zero vector — discarding.");
      return null;
    }
    
    return vector;
  } catch (error: any) {
    console.error("Embedding generation failed:", error?.message || error);
    return null;
  }
}
