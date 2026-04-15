import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Connecting to Postgres...");

  try {
    const demoUserId = "demo-user-1";

    // Upsert demo user
    await prisma.user.upsert({
      where: { userId: demoUserId },
      update: {},
      create: {
        userId: demoUserId,
        age: 28,
        city: "Bengaluru",
        allergies: ["dust", "pollen"],
        sleepHours: 6.0,
        dietType: "vegetarian",
        activityLevel: "moderate",
      },
    });
    console.log("✅ Demo user ready.");

    // Check existing count
    const existingCount = await prisma.prescription.count({ where: { userId: demoUserId } });
    if (existingCount >= 3) {
      console.log(`ℹ️  Demo already seeded (${existingCount} prescriptions). Skipping.`);
      process.exit(0);
    }

    // Wipe partial seed to keep idempotent
    if (existingCount > 0) {
      await prisma.prescription.deleteMany({ where: { userId: demoUserId } });
      console.log("🗑️  Cleared partial seed data.");
    }

    console.log("📝 Seeding 3 demo prescriptions...");

    // ──────────────────────────────────────────────────────────────────────────
    // PRESCRIPTION 1 — Jan 10  (Viral Fever)
    // Medicines: Paracetamol + Cetirizine (appears in ALL 3 → "duplicate" alert)
    // Symptoms: fever (1st occurrence)
    // ──────────────────────────────────────────────────────────────────────────
    await prisma.prescription.create({
      data: {
        userId: demoUserId,
        recordedDate: new Date("2026-01-10T00:00:00.000Z"),
        illnessName: "Viral Fever",
        diagnosis: "Acute viral infection with febrile episode",
        outcome: "improved",
        notes: "Recovered in 5 days. Advised rest and warm fluids.",
        source: "ocr",
        symptoms: {
          create: [
            { name: "fever", severity: "severe", durationDays: 4 },
            { name: "headache", severity: "moderate", durationDays: 3 },
            { name: "fatigue", severity: "moderate", durationDays: 5 },
          ],
        },
        medicines: {
          create: [
            { name: "Paracetamol", dosage: "500 mg", frequency: "thrice daily", durationDays: 5 },
            { name: "Cetirizine", dosage: "10 mg", frequency: "once daily", durationDays: 5 },
          ],
        },
      },
    });
    console.log("✅ Prescription 1 created (Viral Fever — Jan 10)");

    // ──────────────────────────────────────────────────────────────────────────
    // PRESCRIPTION 2 — Feb 20  (Seasonal Allergic Rhinitis)
    // Medicines: Cetirizine again (2nd appearance) + Montelukast
    // Symptoms: fever (2nd occurrence), sneezing, itchy eyes
    // ──────────────────────────────────────────────────────────────────────────
    await prisma.prescription.create({
      data: {
        userId: demoUserId,
        recordedDate: new Date("2026-02-20T00:00:00.000Z"),
        illnessName: "Seasonal Allergic Rhinitis",
        diagnosis: "IgE-mediated allergic response to environmental allergens",
        outcome: "improved",
        notes: "Pollen season aggravation. Advised to avoid outdoor exposure.",
        source: "ocr",
        symptoms: {
          create: [
            { name: "fever", severity: "mild", durationDays: 2 },
            { name: "sneezing", severity: "moderate", durationDays: 7 },
            { name: "itchy eyes", severity: "mild", durationDays: 5 },
            { name: "runny nose", severity: "moderate", durationDays: 6 },
          ],
        },
        medicines: {
          create: [
            { name: "Cetirizine", dosage: "10 mg", frequency: "once daily", durationDays: 7 },
            { name: "Montelukast", dosage: "10 mg", frequency: "once at bedtime", durationDays: 14 },
          ],
        },
      },
    });
    console.log("✅ Prescription 2 created (Allergic Rhinitis — Feb 20)");

    // ──────────────────────────────────────────────────────────────────────────
    // PRESCRIPTION 3 — Mar 28  (Influenza)
    // Medicines: Cetirizine AGAIN (3rd → triggers "duplicate medicine" alert) + Oseltamivir
    // Symptoms: fever (3rd → triggers "recurring symptom" alert), body ache, chills
    // ──────────────────────────────────────────────────────────────────────────
    await prisma.prescription.create({
      data: {
        userId: demoUserId,
        recordedDate: new Date("2026-03-28T00:00:00.000Z"),
        illnessName: "Influenza (H3N2)",
        diagnosis: "Confirmed influenza A — H3N2 variant with systemic involvement",
        outcome: "improved",
        notes: "Rapid antigen test positive. Oseltamivir started within 48h of symptom onset.",
        source: "ocr",
        symptoms: {
          create: [
            { name: "fever", severity: "severe", durationDays: 5 },
            { name: "body ache", severity: "severe", durationDays: 5 },
            { name: "chills", severity: "moderate", durationDays: 3 },
            { name: "fatigue", severity: "severe", durationDays: 7 },
          ],
        },
        medicines: {
          create: [
            { name: "Oseltamivir", dosage: "75 mg", frequency: "twice daily", durationDays: 5 },
            { name: "Cetirizine", dosage: "10 mg", frequency: "once daily", durationDays: 5 },
            { name: "Ibuprofen", dosage: "400 mg", frequency: "twice daily", durationDays: 3 },
          ],
        },
      },
    });
    console.log("✅ Prescription 3 created (Influenza — Mar 28)");

    const total = await prisma.prescription.count({ where: { userId: demoUserId } });
    console.log(`\n🏆 Demo seed complete! ${total} prescriptions ready.`);
    console.log("   → Cetirizine appears in ALL 3  (triggers duplicate-medicine alert)");
    console.log("   → 'fever' appears 3 times       (triggers recurring-symptom alert)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
