import { RecordsClient } from "@/app/(main)/prescriptions/RecordsClient";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const history = await listPrescriptions(session.user.id);

  return <RecordsClient initialRecords={history} />;
}
