import { Sparkles, Activity, FilePlus2, Upload } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-10 animate-pulse">
      {/* HEADER SECTION SKELETON */}
      <header className="flex flex-col gap-2">
        <div className="h-9 w-64 rounded-xl bg-slate-200" />
        <div className="h-4 w-48 rounded-lg bg-slate-100" />
      </header>

      {/* QUICK ACTIONS SKELETON */}
      <section className="flex flex-col gap-4">
        <div className="h-6 w-32 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-slate-100 bg-slate-50/50" />
          ))}
        </div>
      </section>

      {/* TIMELINE SKELETON */}
      <section className="flex flex-col gap-4">
        <div className="h-6 w-48 rounded-lg bg-slate-200" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-80 shrink-0 rounded-2xl border border-slate-100 bg-slate-50/50" />
          ))}
        </div>
      </section>

      {/* INTEL SECTION SKELETON */}
      <section className="h-64 rounded-3xl border border-slate-100 bg-slate-50/20" />
      
      {/* RECENT LOGS SKELETON */}
      <section className="h-96 rounded-3xl border border-slate-100 bg-slate-50/20" />
    </div>
  );
}
