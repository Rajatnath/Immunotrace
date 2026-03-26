import { connectToDatabase } from "../lib/db/mongodb";
import { Prescription } from "../lib/db/models/Prescription";

async function seed() {
  console.log("Connecting to MongoDB...");
  const db = await connectToDatabase();

  if (!db) {
    console.error("❌ MongoDB connection failed. Check MONGODB_URI in .env.local");
    process.exit(1);
  }

  console.log("✅ Connected to MongoDB");

  // Check if seed data already exists
  const existingCount = await Prescription.countDocuments();
  if (existingCount > 0) {
    console.log(`ℹ️  Database already contains ${existingCount} prescription(s). Skipping seed.`);
    process.exit(0);
  }

  console.log("📝 Seeding initial prescription data...");

  const seedPrescription = {
    recordedDate: new Date("2026-01-10T00:00:00.000Z"),
    illnessName: "Common cold",
    symptoms: [
      { name: "cough", severity: "moderate", durationDays: 3 },
      { name: "runny nose", severity: "mild", durationDays: 3 },
    ],
    diagnosis: "Acute viral upper respiratory infection",
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10 mg",
        frequency: "once daily",
        durationDays: 3,
      },
    ],
    outcome: "improved",
    notes: "Recovered in 4 days with rest and warm fluids.",
    source: "manual",
  };

  await Prescription.create(seedPrescription);

  console.log("✅ Seed data created successfully!");
  console.log(`📊 Total prescriptions: ${await Prescription.countDocuments()}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed script failed:", error);
  process.exit(1);
});
