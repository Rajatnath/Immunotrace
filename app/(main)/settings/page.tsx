import { SettingsClient } from "@/app/(main)/settings/SettingsClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return <SettingsClient user={session.user} />;
}