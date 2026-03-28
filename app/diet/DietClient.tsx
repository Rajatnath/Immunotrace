"use client";

import { useState } from "react";
import { Leaf, Apple } from "lucide-react";

type DietData = {
  generatedAt: string;
  includeFoods: string[];
  avoidFoods: string[];
  weeklySuggestions: string[];
  kadhaRecipe: string;
  seasonalTips: string[];
  disclaimer: string;
};

export function DietClient() {
  const [data, setData] = useState<DietData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateDiet() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/diet", { method: "POST" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();

      if (!payload?.success) {
        throw new Error(payload?.error?.message || "Diet generation failed");
      }

      setData(payload.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate diet plan right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-start pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Container */}
      <div className="mb-8 flex w-full items-start justify-between rounded-3xl border border-emerald-500/20 bg-emerald-50 p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Holistic Immunity Nutrition</h2>
          <p className="text-[14px] font-medium text-slate-600">
            Intelligent Ministry of Ayush-aligned dietary protocols tailored precisely to your historical clinical sensitivities.
          </p>
        </div>
        <button
          onClick={generateDiet}
          disabled={isLoading}
          className="shrink-0 rounded-2xl bg-[#0F3D3E] px-6 py-3 text-[14px] font-bold text-white shadow-md shadow-[#0F3D3E]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0c3132] hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
        >
          {isLoading ? "Synthesizing Protocol..." : "Generate Diet Protocol"}
        </button>
      </div>

      {error ? <div className="mb-6 w-full rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-bold text-rose-600">Error: {error}</div> : null}

      {data ? (
        <section className="w-full flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm animate-in zoom-in-95 fade-in fill-mode-both" style={{ animationDelay: '100ms', animationDuration: '500ms' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Apple className="h-4 w-4" /></div>
                <h3 className="text-[15px] font-bold text-slate-900">Prescribed Nutrition</h3>
              </div>
              <List items={data.includeFoods} />
            </article>

            <article className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white p-8 shadow-sm animate-in zoom-in-95 fade-in fill-mode-both" style={{ animationDelay: '200ms', animationDuration: '500ms' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><Leaf className="h-4 w-4" /></div>
                <h3 className="text-[15px] font-bold text-slate-900">Clinical Restrictions (Avoid)</h3>
              </div>
              <List items={data.avoidFoods} />
            </article>
          </div>

          <article className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm animate-in zoom-in-95 fade-in fill-mode-both" style={{ animationDelay: '300ms', animationDuration: '500ms' }}>
            <h3 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2EC4B6]"></span> Weekly Integration Strategies
            </h3>
            <List items={data.weeklySuggestions} />
          </article>

          <article className="rounded-3xl border border-[#0F3D3E]/10 bg-slate-50 p-8 shadow-sm animate-in zoom-in-95 fade-in fill-mode-both" style={{ animationDelay: '400ms', animationDuration: '500ms' }}>
            <h3 className="text-[15px] font-bold text-[#0F3D3E] mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0F3D3E]"></span> Custom Ayush Kadha Formulation
            </h3>
            <p className="rounded-xl bg-white p-5 text-[14px] leading-relaxed text-slate-700 shadow-sm border border-slate-100">
              {data.kadhaRecipe}
            </p>
            
            <h4 className="mt-8 mb-4 text-[13px] font-bold uppercase tracking-wider text-slate-500">Seasonal Protocols</h4>
            <div className="rounded-xl border border-slate-200/60 bg-white">
              <List items={data.seasonalTips} />
            </div>

            <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Generated: {new Date(data.generatedAt).toLocaleString()} • {data.disclaimer}
            </p>
          </article>
        </section>
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
          <Leaf className="mb-4 h-10 w-10 text-emerald-300" />
          <p className="text-[14px] font-bold text-slate-500">Dietary Intelligence Offline</p>
          <p className="mt-1 text-[12px] font-medium text-slate-400">Initiate generation sequence to map your Ayurvedic nutritional protocol.</p>
        </div>
      )}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 p-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[13px] font-medium text-slate-700">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"></div>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
