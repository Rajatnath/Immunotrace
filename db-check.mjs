import prisma from "./lib/db/prisma.js";
import { auth } from "./lib/auth.js";

async function check() {
  const pCount = await prisma.prescription.count();
  const uCount = await prisma.user.count();
  console.log(`Prescriptions: ${pCount}, Users: ${uCount}`);
  
  const allP = await prisma.prescription.findMany({ select: { id: true, illnessName: true, userId: true } });
  console.log("All records:", JSON.stringify(allP, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
