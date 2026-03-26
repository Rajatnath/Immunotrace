import { listPrescriptions } from "@/lib/db/prescriptionService";
import { MainShell } from "@/components/layout/MainShell";
import { PrescriptionsClient } from "@/app/prescriptions/PrescriptionsClient";

export default async function PrescriptionsPage() {
  const initialHistory = await listPrescriptions();

  return (
    <MainShell title="Add Prescription">
      <PrescriptionsClient initialHistory={initialHistory} />
    </MainShell>
  );
}
