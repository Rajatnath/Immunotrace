import { CalendarClient } from "@/app/(main)/calendar/CalendarClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return <CalendarClient />;
}
