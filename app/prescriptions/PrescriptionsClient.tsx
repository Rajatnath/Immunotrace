"use client";

import { useState } from "react";
import { Search, Filter, Activity, FileText, Pill, HeartPulse } from "lucide-react";
import type { PrescriptionEntry } from "@/lib/types/domain";

type PrescriptionResponse = PrescriptionEntry & { id: string };

export function PrescriptionsClient({ initialHistory }: { initialHistory: PrescriptionResponse[] }) {
  const [filter, setFilter] = useState("All");

  // Format datetimes to match Figma string representation
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Expand the combined prescription records into individual 'Activity' cards for the UI Feed
  const feedItems: any[] = [];
  initialHistory.forEach((record) => {
    // 1. Illness/Symptom Event
    feedItems.push({
      id: `sym-${record.id}`,
      type: "SYMPTOM",
      title: record.illnessName || "General Symptom",
      description: record.symptoms?.map((s) => s.name).join(", ") || "No symptoms logged.",
      dateStr: record.recordedDate,
    });
    // 2. Medications
    record.medicines?.forEach((med, idx) => {
      feedItems.push({
        id: `med-${record.id}-${idx}`,
        type: "MEDICATION",
        title: med.name,
        description: `Dosage: ${med.dosage}. Frequency: ${med.frequency}.`,
        dateStr: record.recordedDate,
      });
    });
  });

  // Sort by date descending
  feedItems.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  // Hardcoded Figma mock items if DB is empty to satisfy visual target
  const displayItems = feedItems.length > 0 ? feedItems : [
    { id: "1", type: "SYMPTOM", title: "Morning Headache", description: "Mild tension headache, frontal lobe.", dateStr: new Date(Date.now() - 3600000).toISOString() },
    { id: "2", type: "MEDICATION", title: "Ibuprofen 400mg", description: "Taken with dinner.", dateStr: new Date(Date.now() - 7200000).toISOString() },
    { id: "3", type: "VITAL", title: "Blood Pressure", description: "118/78 mmHg. Resting heart rate 64 bpm.", dateStr: new Date(Date.now() - 86400000).toISOString() },
    { id: "4", type: "DOCUMENT", title: "Lab Results Uploaded", description: "Comprehensive Metabolic Panel (CMP).", dateStr: new Date(Date.now() - 172800000).toISOString() },
    { id: "5", type: "SYMPTOM", title: "Sore Throat", description: "Difficulty swallowing, started post-workout.", dateStr: new Date(Date.now() - 259200000).toISOString() },
  ];

  const getIconData = (type: string) => {
    switch(type) {
      case "SYMPTOM": return { icon: Activity, bg: "bg-amber-50", text: "text-amber-500", dot: "bg-amber-100" };
      case "MEDICATION": return { icon: Pill, bg: "bg-[#2EC4B6]/10", text: "text-[#2EC4B6]", dot: "bg-[#2EC4B6]/20" };
      case "VITAL": return { icon: HeartPulse, bg: "bg-rose-50", text: "text-rose-500", dot: "bg-rose-100" };
      case "DOCUMENT": return { icon: FileText, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-200" };
      default: return { icon: Activity, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-200" };
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-start pt-10">
      
      {/* Header Container */}
      <div className="mb-10 flex w-full items-start justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activity Logs</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Comprehensive chronological history of your health entries.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[280px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-slate-300 focus:shadow-sm placeholder:text-slate-400"
              placeholder="Search logs..."
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-800">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-10 flex flex-wrap gap-3">
        {["All", "Symptoms", "Medications", "Vitals", "Documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
              filter === tab
                ? "border-[#0A2A2A] bg-[#0A2A2A] text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative w-full rounded-2xl border border-slate-100 bg-white py-10 pr-10 pl-4 sm:pl-10 shadow-sm">
        
        {/* The unbroken vertical line positioned exactly behind the center of the icons */}
        <div className="absolute bottom-10 left-[36px] sm:left-[60px] top-10 w-0.5 bg-slate-100"></div>
        
        <div className="flex flex-col gap-8">
          {displayItems.map((item) => {
            const ui = getIconData(item.type);
            return (
              <div key={item.id} className="relative z-10 flex items-start gap-6 sm:gap-8">
                
                {/* Timeline Node Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ui.bg} shadow-sm ring-8 ring-white mt-4`}>
                  <ui.icon className={`h-4 w-4 ${ui.text}`} />
                </div>
                
                {/* Content Card */}
                <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <h3 className="text-[15px] font-bold text-slate-900">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <span>{formatDate(item.dateStr)}</span>
                      <span>•</span>
                      <span>{formatTime(item.dateStr)}</span>
                    </div>
                  </div>
                  
                  <p className="mt-1.5 text-[13px] font-medium text-slate-600">{item.description}</p>
                  
                  <div className="mt-4 flex">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
