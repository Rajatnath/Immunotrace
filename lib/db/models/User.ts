import mongoose, { Schema, model, models } from "mongoose";
import type { UserProfile } from "@/lib/types/domain";

export type UserDocument = UserProfile & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    city: { type: String, required: true, minlength: 2 },
    allergies: { type: [String], default: [] },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    dietType: { type: String, enum: ["vegetarian", "eggetarian", "non-vegetarian", "vegan"], required: true },
    activityLevel: { type: String, enum: ["low", "moderate", "high"], required: true },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Prevent model recompilation in Next.js hot reload
export const User = models.User || model<UserDocument>("User", userSchema);
