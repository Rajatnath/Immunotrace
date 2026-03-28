import { z } from "zod";

export const symptomSchema = z.object({
  name: z.string().min(1),
  severity: z.enum(["mild", "moderate", "severe"]).default("mild"),
  durationDays: z.number().int().min(0).max(90).optional(),
});

export const medicineSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  durationDays: z.number().int().min(1).max(60),
});

export const prescriptionEntrySchema = z.object({
  id: z.string().optional(),
  recordedDate: z.string().datetime(),
  illnessName: z.string().min(2),
  symptoms: z.array(symptomSchema).min(1),
  diagnosis: z.string().min(2),
  medicines: z.array(medicineSchema).min(1),
  outcome: z.enum(["improved", "same", "worse", "unknown"]).default("unknown"),
  notes: z.string().max(500).optional(),
  source: z.enum(["manual", "ocr"]).default("manual"),
  imageData: z.string().optional(),
});

export const userProfileSchema = z.object({
  userId: z.string().min(1),
  age: z.number().int().min(1).max(120),
  city: z.string().min(1),
  allergies: z.array(z.string()).default([]),
  sleepHours: z.number().min(0).max(24),
  dietType: z.enum(["vegetarian", "eggetarian", "non-vegetarian", "vegan"]),
  activityLevel: z.enum(["low", "moderate", "high"]),
});

export const healthReportSchema = z.object({
  generatedAt: z.string().datetime(),
  summary: z.string(),
  frequencyInsights: z.array(z.string()),
  likelyTriggers: z.array(z.string()),
  medicineResponse: z.array(z.string()),
  preventionActions: z.array(z.string()),
  ayushPerspective: z.string(),
  disclaimer: z.string(),
});

export const dietPlanSchema = z.object({
  generatedAt: z.string().datetime(),
  includeFoods: z.array(z.string()),
  avoidFoods: z.array(z.string()),
  weeklySuggestions: z.array(z.string()),
  kadhaRecipe: z.string(),
  seasonalTips: z.array(z.string()),
  disclaimer: z.string(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  ayushPerspective: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type PrescriptionEntry = z.infer<typeof prescriptionEntrySchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;
export type DietPlan = z.infer<typeof dietPlanSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
