"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FilePlus2, Sparkles, Activity, FileText, LayoutList } from "lucide-react";
import type { PrescriptionEntry } from "@/lib/types/domain";

interface StoredPrescription extends PrescriptionEntry {
  id: string;
}

interface UserProfile {
  userId: string;
  age: number;
  city: string;
  allergies: string[];
  sleepHours: number;
  dietType: string;
  activityLevel: string;
}

export function DashboardClient({ 
  initialPrescriptions,
  user,
  initialHistory = [] 
}: { 
  initialPrescriptions: StoredPrescription[];
  user: UserProfile | null;
  initialHistory?: any[];
}) {
  const router = useRouter();
  
  // Advanced analytical derivation for Health Score
  const totalEvents = initialPrescriptions.length;
  const isHealthy = totalEvents === 0;
  
  // A score of 0 or N/A is better for empty states than a static 80
  const calculatedScore = isHealthy ? 0 : Math.min(98, 85 + (totalEvents * 1));
  const grade = isHealthy ? "—" : (calculatedScore > 90 ? "A" : calculatedScore > 85 ? "A-" : "B+");

  // Map the 3 most recent events to the Timeline dynamically from Postgres
  const recentEvents = initialPrescriptions.slice(0, 3).map((record) => {
    return {
      id: record.id,
      title: record.illnessName || record.diagnosis || "Medical Event",
      date: new Date(record.recordedDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
      severity: record.source === "ocr" ? "actionable" : "resolved",
    };
  });

  const timelineEvents = recentEvents;

  // Flatten nested arrays to populate Recent Logs from live database data
  const allSymptoms = initialPrescriptions.flatMap(p => 
    (p.symptoms || []).map(s => ({ ...s, date: p.recordedDate, key: `${p.id}-${s.name}` }))
  ).slice(0, 5); // display up to 5 recent symptoms

  const allMedicines = initialPrescriptions.flatMap(p => 
    (p.medicines || []).map(m => ({ ...m, key: `${p.id}-${m.name}` }))
  ).slice(0, 5); // display up to 5 recent medicines

  return (
    <div className="flex w-full flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Health Intelligence</h1>
        <p className="text-sm font-medium text-slate-500">
          Personal Health Historian • Last synced: March 28, 2026
        </p>
      </header>

      {/* QUICK ACTIONS ROW */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-500 fill-mode-both">
          
          <button 
            onClick={() => router.push("/prescriptions")}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md text-left animate-in zoom-in-95 fade-in duration-500 delay-100 fill-mode-both"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-100">
              <Upload className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">Upload Prescription</span>
              <span className="text-xs font-medium text-slate-500">Scan & parse documents</span>
            </div>
          </button>

          <button 
            onClick={() => router.push("/report")}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md text-left animate-in zoom-in-95 fade-in duration-500 delay-200 fill-mode-both"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-100">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">Add Health Log</span>
              <span className="text-xs font-medium text-slate-500">Record a new symptom</span>
            </div>
          </button>

          <button 
            onClick={() => router.push("/chat")}
            className="group flex items-center gap-4 rounded-2xl bg-[#0F3D3E] p-5 shadow-md shadow-[#0F3D3E]/20 transition-all hover:bg-[#0F3D3E]/90 hover:shadow-lg text-left animate-in zoom-in-95 fade-in duration-500 delay-300 fill-mode-both"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#2EC4B6]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">Ask HealthWise</span>
              <span className="text-xs font-medium text-white/70">Query your health history</span>
            </div>
          </button>

        </div>
      </section>

      {/* HEALTH HISTORY TIMELINE (Horizontal Scroll) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900">Health History Timeline</h2>
          <p className="text-sm font-medium text-slate-500">Chronological record of clinical events</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {timelineEvents.length === 0 ? (
            <div className="relative flex w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-1000">
              <div className="aspect-[21/9] w-full relative">
                <img 
                  src="/Users/rajatnathmishra/.gemini/antigravity/brain/0cca5593-a56b-4efe-9627-312ee0511ae3/medical_onboarding_hero_1774711557229.png" 
                  alt="Onboarding"
                  className="h-full w-full object-cover opacity-80"
                  loading="eager" // High priority for onboarding
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3D3E] text-[#2EC4B6] shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-[#0F3D3E]">Start Your Journey</h3>
                  <p className="max-w-md text-sm font-bold text-slate-600">
                    ImmunoTrace is currently initializing your clinical profile. Upload your first prescription to unlock real-time intelligence.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            timelineEvents.map((event, idx) => (
              <div key={event.id} className={`flex w-80 shrink-0 flex-col gap-4 rounded-2xl border ${idx === 0 ? 'border-[#2ec4b6]/20 bg-[#2ec4b6]/5' : 'border-slate-100 bg-white shadow-sm'} p-6 snap-start`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${event.severity === 'actionable' ? 'bg-rose-500' : 'bg-[#2ec4b6]'}`}></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{event.date}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900">{event.title}</h3>
                  <p className="text-xs text-slate-500">Record Parsed</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* DIVIDER */}
      <hr className="border-slate-200" />

      {/* CLINICAL INTELLIGENCE SECTION */}
      <section className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900">Clinical Intelligence</h2>
          <p className="text-sm font-medium text-slate-500">Algorithmic pattern recognition and preventive care</p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Intel Item 1 (Dynamic General Insight) */}
          <div className="relative flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Analysis</span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {initialPrescriptions.length === 0 
                      ? "Awaiting Clinical Data" 
                      : `Tracking ${initialPrescriptions.length} Active Medical Record${initialPrescriptions.length !== 1 ? 's' : ''}`}
                  </h3>
                </div>
                <span className="rounded-md bg-[#2ec4b6]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#2ec4b6]">Live</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {initialPrescriptions.length === 0 
                  ? "Your health intelligence engine is currently dormant. Upload your first prescription or clinical note to unlock algorithmic pattern detection."
                  : "The clinical AI is actively monitoring your historical trajectory. Continuous updates improve longitudinal accuracy."}
              </p>
              {initialPrescriptions.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#2ec4b6]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Summary Detected</span>
                    <span className="text-sm font-medium text-slate-900">Primary focus on: {initialPrescriptions[0].illnessName || "General Consultation"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Intel Item 2 */}
          <div className="relative flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{calculatedScore}<span className="text-lg text-slate-400">/100</span></span>
                  <span className="text-sm font-medium text-slate-500">Based on past 30 days</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2EC4B6]/10 text-xl font-bold text-[#2EC4B6]">
                  {grade}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {initialPrescriptions.length === 0 
                  ? "Health score will calculate automatically once diagnostic events are logged into the system."
                  : "Score derived dynamically from total baseline activity over the latest evaluation period."}
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 text-[#2ec4b6]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Suggested</span>
                  <span className="text-sm font-medium text-slate-900">
                    {initialPrescriptions.length === 0 ? "Use the Quick Actions menu to sync a medical document." : "Maintain current compliance. Schedule follow-ups appropriately."}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RECENT LOGS GRID */}
      <section className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900">Recent Logs</h2>
          <p className="text-sm font-medium text-slate-500">Latest structured data entries</p>
        </div>

        <div className="flex flex-col gap-10">
          
          {/* Symptoms List Dynamic */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Activity className="h-4 w-4" /> Symptoms
            </div>
            
            <div className={`flex flex-col gap-0 border-slate-100 ${allSymptoms.length > 0 ? 'border-y' : ''}`}>
              {allSymptoms.length === 0 ? (
                <div className="py-6 text-sm italic text-slate-400">No symptoms extracted from current records...</div>
              ) : (
                allSymptoms.map((symptom) => (
                  <div key={symptom.key} className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        symptom.severity === 'severe' ? 'border border-rose-200 bg-rose-50 text-rose-600' :
                        symptom.severity === 'moderate' ? 'border border-orange-200 bg-orange-50 text-orange-600' :
                        'border border-amber-200 bg-amber-50 text-amber-600'
                      }`}>
                        {symptom.severity || 'mild'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(symptom.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-medium text-slate-900 ml-4 capitalize">{symptom.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Prescriptions Dynamic */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FilePlus2 className="h-4 w-4" /> Active Prescriptions
            </div>
            
            <div className="flex flex-col gap-3">
              {allMedicines.length === 0 ? (
                <div className="py-2 text-sm italic text-slate-400">No active medications logged...</div>
              ) : (
                allMedicines.map((med) => (
                  <div key={med.key} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        <LayoutList className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-900 capitalize">{med.name}</span>
                        <span className="text-xs font-medium text-slate-500">{med.dosage} • {med.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}