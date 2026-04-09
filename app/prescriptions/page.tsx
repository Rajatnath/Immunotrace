import { MainShell } from "@/components/layout/MainShell";
import { RecordsClient } from "@/app/prescriptions/RecordsClient";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const history = await listPrescriptions(session.user.id);

  const score = history.length === 0 ? 0 : Math.min(98, 85 + history.length);
  const grade = history.length === 0 ? "—" : (score > 90 ? "A" : score > 85 ? "A-" : "B+");

  return (
    <MainShell title="Medical Records" score={score} grade={grade}>
      <RecordsClient initialRecords={history} />
    </MainShell>
  );
}
