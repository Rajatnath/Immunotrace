import { MainShell } from "@/components/layout/MainShell";
import { SettingsClient } from "@/app/settings/SettingsClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <MainShell title="Preferences & Settings">
      <SettingsClient user={session.user} />
    </MainShell>
  );
}