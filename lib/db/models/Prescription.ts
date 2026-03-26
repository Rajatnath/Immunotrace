import mongoose, { Schema, model, models } from "mongoose";
import type { PrescriptionEntry } from "@/lib/types/domain";

export type PrescriptionDocument = PrescriptionEntry & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const symptomSchema = new Schema(
  {
    name: { type: String, required: true },
    severity: { type: String, enum: ["mild", "moderate", "severe"], default: "mild" },
    durationDays: { type: Number, min: 0, max: 90 },
  },
  { _id: false }
);

const medicineSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    durationDays: { type: Number, required: true, min: 1, max: 60 },
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    recordedDate: { type: Date, required: true },
    illnessName: { type: String, required: true, minlength: 2 },
    symptoms: { type: [symptomSchema], required: true, validate: [(val: unknown[]) => val.length > 0, "At least one symptom required"] },
    diagnosis: { type: String, required: true, minlength: 2 },
    medicines: { type: [medicineSchema], required: true, validate: [(val: unknown[]) => val.length > 0, "At least one medicine required"] },
    outcome: { type: String, enum: ["improved", "same", "worse", "unknown"], default: "unknown" },
    notes: { type: String, maxlength: 500 },
    source: { type: String, enum: ["manual", "ocr"], default: "manual" },
  },
  {
    timestamps: true,
    collection: "prescriptions",
  }
);

// Prevent model recompilation in Next.js hot reload
export const Prescription = models.Prescription || model<PrescriptionDocument>("Prescription", prescriptionSchema);
