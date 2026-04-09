import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainShell } from "@/components/layout/MainShell";
import { PrescriptionsClient } from "@/app/prescriptions/PrescriptionsClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const initialHistory = await listPrescriptions(session.user.id);

  return (
    <MainShell title="Activity Logs">
      <PrescriptionsClient initialHistory={initialHistory} />
    </MainShell>
  );
}
