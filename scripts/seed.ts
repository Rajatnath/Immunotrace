import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Connecting to Postgres...");

  try {
    // Ensure demo user exists
    const demoUserId = "demo-user-1";
    let user = await prisma.user.findUnique({ where: { userId: demoUserId } });
    
    if (!user) {
      console.log("📝 Creating demo user...");
      user = await prisma.user.create({
        data: {
          userId: demoUserId,
          age: 27,
          city: "Bengaluru",
          allergies: ["dust"],
          sleepHours: 6.5,
          dietType: "vegetarian",
          activityLevel: "moderate",
        },
      });
      console.log("✅ Demo user created!");
    } else {
      console.log("ℹ️  Demo user already exists.");
    }

    // Check if seed data already exists
    const existingCount = await prisma.prescription.count({ where: { userId: demoUserId } });
    if (existingCount > 0) {
      console.log(`ℹ️  Database already contains ${existingCount} prescription(s) for demo user. Skipping seed.`);
      process.exit(0);
    }

    console.log("📝 Seeding initial prescription data...");

    const seedPrescription = {
      userId: demoUserId,
      recordedDate: new Date("2026-01-10T00:00:00.000Z"),
      illnessName: "Common cold",
      diagnosis: "Acute viral upper respiratory infection",
      outcome: "improved",
      notes: "Recovered in 4 days with rest and warm fluids.",
      source: "manual",
      symptoms: {
        create: [
          { name: "cough", severity: "moderate", durationDays: 3 },
          { name: "runny nose", severity: "mild", durationDays: 3 },
        ],
      },
      medicines: {
        create: [
          {
            name: "Cetirizine",
            dosage: "10 mg",
            frequency: "once daily",
            durationDays: 3,
          },
        ],
      },
    };

    await prisma.prescription.create({
      data: seedPrescription,
    });

    console.log("✅ Seed data created successfully!");
    console.log(`📊 Total prescriptions: ${await prisma.prescription.count()}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error("❌ Seed script failed:", error);
  process.exit(1);
});
