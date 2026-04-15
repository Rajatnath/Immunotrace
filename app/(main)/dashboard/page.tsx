import { DashboardClient } from "@/app/(main)/dashboard/DashboardClient";
import { DashboardSkeleton } from "@/app/(main)/dashboard/DashboardSkeleton";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export interface DashboardAlert {
  type: "duplicate_medicine" | "recurring_symptom";
  message: string;
}

function detectAlerts(prescriptions: Awaited<ReturnType<typeof listPrescriptions>>): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  // Duplicate medicine: same name in >1 prescription
  const medicineCounts: Record<string, number> = {};
  for (const p of prescriptions) {
    for (const m of p.medicines) {
      const key = m.name.toLowerCase().trim();
      medicineCounts[key] = (medicineCounts[key] ?? 0) + 1;
    }
  }
  for (const [name, count] of Object.entries(medicineCounts)) {
    if (count > 1) {
      alerts.push({
        type: "duplicate_medicine",
        message: `${name.charAt(0).toUpperCase() + name.slice(1)} appears in ${count} separate prescriptions — possible overlapping medication.`,
      });
    }
  }

  // Recurring symptom: same symptom in >2 prescriptions
  const symptomCounts: Record<string, number> = {};
  for (const p of prescriptions) {
    for (const s of p.symptoms) {
      const key = s.name.toLowerCase().trim();
      symptomCounts[key] = (symptomCounts[key] ?? 0) + 1;
    }
  }
  for (const [name, count] of Object.entries(symptomCounts)) {
    if (count > 2) {
      alerts.push({
        type: "recurring_symptom",
        message: `"${name}" has recurred ${count} times across your records — possible chronic pattern.`,
      });
    }
  }

  return alerts;
}

async function DashboardContent({ userId, user }: { userId: string; user: any }) {
  const prescriptions = await listPrescriptions(userId);
  const alerts = detectAlerts(prescriptions);

  return (
    <DashboardClient
      initialPrescriptions={prescriptions}
      user={user}
      alerts={alerts}
    />
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { userId: session.user.id } }).catch(() => null);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent userId={session.user.id} user={user} />
    </Suspense>
  );
}
