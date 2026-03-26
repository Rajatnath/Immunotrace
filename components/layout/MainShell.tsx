import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/report", label: "Health Report" },
  { href: "/diet", label: "Diet" },
  { href: "/chat", label: "AI Chat" },
];

export function MainShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fff,_#f8fafc)] text-slate-900">
      <header className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight text-orange-700">HealthWise</h1>
          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-orange-200 px-3 py-1.5 transition hover:bg-orange-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h2>
        {children}
      </main>
    </div>
  );
}
