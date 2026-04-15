import { ProfileClient } from "@/app/(main)/profile/ProfileClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return <ProfileClient user={session.user} />;
}
