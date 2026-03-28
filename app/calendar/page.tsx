import { MainShell } from "@/components/layout/MainShell";
import { CalendarClient } from "@/app/calendar/CalendarClient";
import { listPrescriptions } from "@/lib/db/prescriptionService";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const history = await listPrescriptions(session.user.id);

  return (
    <MainShell title="Schedule & Calendar">
      <CalendarClient />
    </MainShell>
  );
}
