import { MainShell } from "@/components/layout/MainShell";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { DashboardSkeleton } from "@/app/dashboard/DashboardSkeleton";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function DashboardContent({ userId, user }: { userId: string, user: any }) {
  const prescriptions = await listPrescriptions(userId);
  
  const score = prescriptions.length === 0 ? 0 : Math.min(98, 85 + prescriptions.length);
  const grade = prescriptions.length === 0 ? "—" : (score > 90 ? "A" : score > 85 ? "A-" : "B+");

  return (
    <>
      {/* Note: In a real streaming scenario, we'd want the Shell to show progress, 
          but for "millisecond" entry, we let the inner client handle local hydration */}
      <DashboardClient 
        initialPrescriptions={prescriptions} 
        user={user} 
      />
    </>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch only user metadata in parallel for the shell
  const user = await prisma.user.findUnique({ where: { userId: session.user.id } });

  return (
    <MainShell title="Personal Health Dashboard">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} user={user} />
      </Suspense>
    </MainShell>
  );
}