"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

type ReportData = {
  generatedAt: string;
  summary: string;
  frequencyInsights: string[];
  likelyTriggers: string[];
  medicineResponse: string[];
  preventionActions: string[];
  disclaimer: string;
};

export function ReportClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/report", { method: "POST" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();

      if (!payload?.success) {
        throw new Error(payload?.error?.message || "Report generation failed");
      }

      setData(payload.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate report right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-start pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Container */}
      <div className="mb-8 flex w-full items-start justify-between rounded-3xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pattern Analysis Engine</h2>
          <p className="text-[14px] font-medium text-slate-600">
            Generate predictive health insights by running proprietary algorithms against your historical clinical records.
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={isLoading}
          className="shrink-0 rounded-2xl bg-[#0F3D3E] px-6 py-3 text-[14px] font-bold text-white shadow-md shadow-[#0F3D3E]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0c3132] hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
        >
          {isLoading ? "Running Algorithmic Sync..." : "Generate Analysis"}
        </button>
      </div>

      {error && (
        <div className="mb-6 w-full rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-bold text-rose-600">
          Error: {error}
        </div>
      )}

      {data ? (
        <div className="flex w-full flex-col gap-6">
          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Executive Clinical Summary</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-800 font-medium">{data.summary}</p>
          </article>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <ReportSection title="Frequency Insights" items={data.frequencyInsights} delay={100} />
            <ReportSection title="Likely Environmental Triggers" items={data.likelyTriggers} delay={200} />
            <ReportSection title="Historical Medicine Efficacy" items={data.medicineResponse} delay={300} />
            <ReportSection title="Suggested Preventive Actions" items={data.preventionActions} delay={400} />
          </div>

          <p className="mt-4 w-full text-center text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Generated: {new Date(data.generatedAt).toLocaleString()} • {data.disclaimer}
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
          <Activity className="mb-4 h-10 w-10 text-slate-300" />
          <p className="text-[14px] font-bold text-slate-500">Analysis Engine Idle</p>
          <p className="mt-1 text-[12px] font-medium text-slate-400">Initialize a new algorithmic pass to compile a proactive health pattern report.</p>
        </div>
      )}
    </section>
  );
}

function ReportSection({ title, items, delay }: { title: string; items: string[], delay: number }) {
  return (
    <article 
      className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm animate-in zoom-in-95 fade-in fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '500ms' }}
    >
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-[#2EC4B6]"></div>
        <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-[13px] font-medium text-slate-700">
            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"></div>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
