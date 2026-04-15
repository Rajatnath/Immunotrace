import { MainShell } from "@/components/layout/MainShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <MainShell title="ImmunoTrace">
      {children}
    </MainShell>
  );
}
