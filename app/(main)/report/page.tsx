import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrescriptionsClient } from "@/app/(main)/prescriptions/PrescriptionsClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const initialHistory = await listPrescriptions(session.user.id);

  return <PrescriptionsClient initialHistory={initialHistory} />;
}
