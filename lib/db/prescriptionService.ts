import { connectToDatabase } from "@/lib/db/mongodb";
import { Prescription } from "@/lib/db/models/Prescription";
import type { PrescriptionEntry } from "@/lib/types/domain";

export type StoredPrescription = PrescriptionEntry & { id: string };

/**
 * List all prescriptions sorted by recordedDate (newest first).
 * Falls back to empty array if MongoDB is not connected.
 */
export async function listPrescriptions(): Promise<StoredPrescription[]> {
  const db = await connectToDatabase();
  if (!db) {
    console.warn("MongoDB not connected. Returning empty prescription list.");
    return [];
  }

  try {
    const docs = await Prescription.find().sort({ recordedDate: -1 }).lean().exec();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms,
      diagnosis: doc.diagnosis,
      medicines: doc.medicines,
      outcome: doc.outcome,
      notes: doc.notes,
      source: doc.source,
    }));
  } catch (error) {
    console.error("Error listing prescriptions from MongoDB:", error);
    return [];
  }
}

/**
 * Add a new prescription to MongoDB.
 * Falls back to in-memory representation if MongoDB is not connected.
 */
export async function addPrescription(entry: PrescriptionEntry): Promise<StoredPrescription> {
  const db = await connectToDatabase();
  if (!db) {
    console.warn("MongoDB not connected. Returning mock prescription.");
    return {
      ...entry,
      id: `rx-mock-${Date.now()}`,
    };
  }

  try {
    const doc = await Prescription.create({
      recordedDate: new Date(entry.recordedDate),
      illnessName: entry.illnessName,
      symptoms: entry.symptoms,
      diagnosis: entry.diagnosis,
      medicines: entry.medicines,
      outcome: entry.outcome,
      notes: entry.notes,
      source: entry.source,
    });

    return {
      id: doc._id.toString(),
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms,
      diagnosis: doc.diagnosis,
      medicines: doc.medicines,
      outcome: doc.outcome,
      notes: doc.notes,
      source: doc.source,
    };
  } catch (error) {
    console.error("Error adding prescription to MongoDB:", error);
    throw new Error("Failed to save prescription to database");
  }
}

/**
 * Get a prescription by ID.
 */
export async function getPrescriptionById(id: string): Promise<StoredPrescription | null> {
  const db = await connectToDatabase();
  if (!db) {
    return null;
  }

  try {
    const doc = await Prescription.findById(id).lean().exec();
    if (!doc) {
      return null;
    }

    return {
      id: doc._id.toString(),
      recordedDate: doc.recordedDate.toISOString(),
      illnessName: doc.illnessName,
      symptoms: doc.symptoms,
      diagnosis: doc.diagnosis,
      medicines: doc.medicines,
      outcome: doc.outcome,
      notes: doc.notes,
      source: doc.source,
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
  const db = await connectToDatabase();
  if (!db) {
    return false;
  }

  try {
    const result = await Prescription.findByIdAndDelete(id).exec();
    return result !== null;
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return false;
  }
}
