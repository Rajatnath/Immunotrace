import Link from "next/link";
import { type ReactNode } from "react";
import { Home, FileText, Search, Activity, Sparkles, Calendar, Plus, Bot, Menu, User, Settings, Bell, Apple } from "lucide-react";
import { auth } from "@/lib/auth";
import { HeaderActions } from "./HeaderActions";
import { listPrescriptions } from "@/lib/db/prescriptionService";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/chat", icon: Sparkles, label: "Ask HealthWise" },
  { href: "/report", icon: Activity, label: "Activity Logs" },
  { href: "/diet", icon: Apple, label: "Ayush Diet" },
  { href: "/calendar", icon: Calendar, label: "Schedule" },
  { href: "/prescriptions", icon: FileText, label: "Documents" },
  { href: "/profile", icon: User, label: "Profile" },
];

export async function MainShell({ 
  title, 
  children,
  score: propScore,
  grade: propGrade
}: { 
  title: string; 
  children: ReactNode;
  score?: number;
  grade?: string;
}) {
  const session = await auth();
  const rawId = session?.user?.id || "Unknown";
  
  // Hydrate global health metrics only if not passed as props (Performance Optimization)
  const records = (propScore === undefined) ? (session?.user?.id ? await listPrescriptions(session.user.id) : []) : [];
  const score = propScore !== undefined ? propScore : (records.length === 0 ? 0 : Math.min(98, 85 + records.length));
  const grade = propGrade !== undefined ? propGrade : (records.length === 0 ? "—" : (score > 90 ? "A" : score > 85 ? "A-" : "B+"));

  // Create a display name: truncate email domain if present, or just use ID
  const displayName = rawId.includes("@") ? rawId.split("@")[0] : rawId;
  const displayId = "HW-" + rawId.substring(0, 4).toUpperCase();
  const initials = displayName.substring(0, 2).toUpperCase();
  return (
    <div className="flex min-h-screen bg-[#F8FAFB] font-sans text-slate-900">
      
      {/* 1. Left Vertical Sidebar (Dark Teal) */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col items-center justify-between border-r border-[#0A2A2A]/10 bg-[#0A2A2A] py-8">
        <div className="flex flex-col items-center gap-8">
          {/* Logo / Brand */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2EC4B6]/20 text-xl font-bold text-[#2EC4B6]">
            H
          </div>
          
          {/* Main Nav Icons */}
          <nav className="flex flex-col items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:bg-white/10"
                title={item.label}
              >
                <item.icon className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Nav Icons */}
        <div className="flex flex-col items-center gap-6">
          <Link href="/settings" className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/10 hover:text-white">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="ml-20 flex flex-1 flex-col">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-[#F8FAFB]/80 px-10 backdrop-blur-md">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search health records, symptoms, medications..." 
              className="h-12 w-full rounded-2xl border-none bg-slate-100 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-[#2EC4B6]/50 placeholder:text-slate-400"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-6">
            <HeaderActions score={score} grade={grade} scoreUpdateNotice={records.length > 0} />

            {/* User Identity linking to Settings */}
            <Link href="/settings" className="flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer">
              <div className="flex flex-col text-right leading-none">
                <span className="text-sm font-bold text-slate-900">{displayName}</span>
                <span className="text-[11px] font-medium text-slate-500">ID: {displayId}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2A2A] font-bold text-white shadow-sm ring-2 ring-slate-100">
                {initials}
              </div>
            </Link>

          </div>
        </header>

        {/* Main Page Canvas */}
        <main className="flex-1 px-10 pb-16 pt-6">
          <div className="mx-auto max-w-[1200px]">
            {/* Page Title Context is now injected by the page itself to match Figma, but we can provide a fallback */}
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
