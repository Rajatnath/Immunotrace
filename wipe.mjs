import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pRes = await prisma.prescription.deleteMany({});
  const uRes = await prisma.user.deleteMany({});
  console.log(`Wiped ${pRes.count} prescriptions/symptoms/medicines and ${uRes.count} users.`);
}

main().finally(async () => {
  await prisma.$disconnect();
});
