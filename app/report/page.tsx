import { MainShell } from "@/components/layout/MainShell";
import { ReportClient } from "@/app/report/ReportClient";

export default function ReportPage() {
  return (
    <MainShell title="AI Health Report">
      <ReportClient />
    </MainShell>
  );
}
