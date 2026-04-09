"use client";

import { useState } from "react";
import { Bell, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeaderActions({ score = 0, grade = "—", scoreUpdateNotice = false }: { score?: number, grade?: string, scoreUpdateNotice?: boolean }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false); // Forced to clean slate

  return (
    <div className="flex items-center gap-6 relative">
      
      {/* Health Score Pill */}
      <button 
        onClick={() => router.push("/report")}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
      >
        <div className="flex flex-col text-right leading-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700">Health Score</span>
          <span className="text-sm font-bold text-slate-900">{score}/100</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2EC4B6] font-bold text-white text-xs ring-2 ring-transparent transition-all group-hover:ring-[#2EC4B6]/30">
          {grade}
        </div>
      </button>

      {/* Notification Bell */}
      <div className="relative">
        <button 
          onClick={() => {
            setShowNotifications(!showNotifications);
            setHasUnread(false);
          }}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50 ${showNotifications ? "ring-2 ring-slate-200" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Dropdown Popover */}
        {showNotifications && (
          <div className="absolute right-0 top-14 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-2">Notifications</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <HeartPulse className="h-3 w-3" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-bold text-slate-900">Health Metric Engine Synced</span>
                  <span className="text-[11px] font-medium text-slate-500">Postgres data successfully updated your baseline to {score}/100.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
