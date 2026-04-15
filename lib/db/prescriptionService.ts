import prisma from "@/lib/db/prisma";
import type { PrescriptionEntry } from "@/lib/types/domain";
import { buildPrescriptionSemanticText, generateContentEmbedding } from "@/lib/ai/embeddings";

export type StoredPrescription = PrescriptionEntry & { id: string };

/**
 * List all prescriptions sorted by recordedDate (newest first).
 * Includes the symptom and medicine relations.
 */
export async function listPrescriptions(userId: string): Promise<StoredPrescription[]> {
  try {
    const docs = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { recordedDate: "desc" },
      include: {
        symptoms: true,
        medicines: true,
      },
    });

    return docs.map((doc: any) => ({
      id: doc.id,
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms.map((s: any) => ({
        name: s.name,
        severity: s.severity as "mild"| "moderate" | "severe",
        durationDays: s.durationDays ?? undefined,
      })),
      diagnosis: doc.diagnosis,
      medicines: doc.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: m.durationDays,
      })),
      outcome: doc.outcome as "improved" | "same" | "worse" | "unknown",
      notes: doc.notes ?? undefined,
      source: doc.source as "manual" | "ocr",
      imageData: doc.imageData ? Buffer.from(doc.imageData).toString("base64") : undefined,
    }));
  } catch (error) {
    console.error("Error listing prescriptions from Postgres:", error);
    return [];
  }
}

/**
 * Add a new prescription to Postgres.
 */
export async function addPrescription(entry: PrescriptionEntry, userId: string): Promise<StoredPrescription> {
  try {
    // 1. Defensively upsert the User to resolve Foreign Key constraint (P2003) for OAuth users
    await prisma.user.upsert({
      where: { userId },
      update: {},
      create: { 
        userId, 
        age: 30,
        city: "Seattle",
        allergies: [],
        sleepHours: 7.5,
        dietType: "vegetarian",
        activityLevel: "moderate"
      }
    });

    // Handle Image Data: Convert Base64 from frontend to Buffer for Prisma (Bytes)
    const imageBuffer = entry.imageData 
      ? Buffer.from(entry.imageData.split(",")[1] || entry.imageData, "base64") 
      : null;

    // 2. Insert Prescription safely
    const doc = await prisma.prescription.create({
      data: {
        userId,
        recordedDate: new Date(entry.recordedDate),
        illnessName: entry.illnessName,
        diagnosis: entry.diagnosis,
        outcome: entry.outcome,
        notes: entry.notes,
        source: entry.source,
        imageData: imageBuffer,
        symptoms: {
          create: entry.symptoms.map(s => ({
            name: s.name,
            severity: s.severity,
            durationDays: s.durationDays,
          }))
        },
        medicines: {
          create: entry.medicines.map(m => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            durationDays: m.durationDays,
          }))
        }
      },
      include: {
        symptoms: true,
        medicines: true
      }
    });

    // RAG INJECTION: Generate and save the semantic vector asynchronously
    try {
      const semanticText = buildPrescriptionSemanticText(entry, doc.recordedDate.toISOString());
      const vector = await generateContentEmbedding(semanticText);
      
      // Only save if we got a valid (non-null) vector back
      if (vector) {
        const vectorStr = `[${vector.join(",")}]`;

        await prisma.$executeRaw`
          INSERT INTO "PrescriptionEmbedding" ("id", "prescriptionId", "content", "embedding")
          VALUES (gen_random_uuid(), ${doc.id}, ${semanticText}, ${vectorStr}::vector)
        `;
        console.log(`✅ Embedding saved for prescription: ${doc.id}`);
      } else {
        console.warn(`⚠️ Embedding generation failed for prescription ${doc.id} — RAG entry skipped.`);
      }
    } catch (embedError) {
      console.error("Non-fatal: Failed to generate/save embedding for prescription:", embedError);
    }

    return {
      id: doc.id,
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms.map((s: any) => ({
        name: s.name,
        severity: s.severity as "mild"| "moderate" | "severe",
        durationDays: s.durationDays ?? undefined,
      })),
      diagnosis: doc.diagnosis,
      medicines: doc.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: m.durationDays,
      })),
      outcome: doc.outcome as "improved" | "same" | "worse" | "unknown",
      notes: doc.notes ?? undefined,
      source: doc.source as "manual" | "ocr",
      imageData: doc.imageData ? Buffer.from(doc.imageData).toString("base64") : undefined,
    };
  } catch (error) {
    console.error("Error adding prescription to Postgres:", error);
    throw new Error("Failed to save prescription to database");
  }
}

/**
 * Get a prescription by ID.
 */
export async function getPrescriptionById(id: string): Promise<StoredPrescription | null> {
  try {
    const doc = await prisma.prescription.findUnique({
      where: { id },
      include: {
        symptoms: true,
        medicines: true,
      },
    });
    
    if (!doc) return null;

    return {
      id: doc.id,
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms.map((s: any) => ({
        name: s.name,
        severity: s.severity as "mild"| "moderate" | "severe",
        durationDays: s.durationDays ?? undefined,
      })),
      diagnosis: doc.diagnosis,
      medicines: doc.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        durationDays: m.durationDays,
      })),
      outcome: doc.outcome as "improved" | "same" | "worse" | "unknown",
      notes: doc.notes ?? undefined,
      source: doc.source as "manual" | "ocr",
      imageData: doc.imageData ? Buffer.from(doc.imageData).toString("base64") : undefined,
    };
  } catch (error) {
    console.error("Error getting prescription by ID:", error);
    return null;
  }
}

/**
 * Delete a prescription by ID.
 */
export async function deletePrescription(id: string): Promise<boolean> {
  try {
    await prisma.prescription.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return false;
  }
}


/**
 * Retrieve the most semantically relevant prescriptions using pgvector Cosine Distance.
 */
export async function findSimilarPrescriptions(queryVector: number[], userId: string, topK: number = 3) {
  try {
    const vectorStr = `[${queryVector.join(",")}]`;

    // <=> is the Cosine Distance operator in pgvector
    const matches = await prisma.$queryRaw<Array<{ prescriptionId: string, content: string, similarity: number }>>`
      SELECT e."prescriptionId", e."content", 1 - (e.embedding <=> ${vectorStr}::vector) as similarity
      FROM "PrescriptionEmbedding" e
      JOIN "Prescription" p ON e."prescriptionId" = p.id
      WHERE p."userId" = ${userId}
      ORDER BY e.embedding <=> ${vectorStr}::vector
      LIMIT ${topK}
    `;

    return matches;
  } catch (error) {
    console.error("Error performing RAG similarity search in Postgres:", error);
    return [];
  }
}
