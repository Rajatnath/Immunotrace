import { MainShell } from "@/components/layout/MainShell";
import { DietClient } from "@/app/diet/DietClient";

export default function DietPage() {
  return (
    <MainShell title="AI Diet Recommendations">
      <DietClient />
    </MainShell>
  );
}
