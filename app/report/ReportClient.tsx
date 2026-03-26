"use client";

import { useState } from "react";

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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Generate your live report from saved prescription history.</p>
        <button
          onClick={generateReport}
          disabled={isLoading}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {data ? (
        <div className="mt-5 space-y-5">
          <article className="rounded-lg bg-orange-50 p-4">
            <p className="text-xs uppercase tracking-wide text-orange-700">Summary</p>
            <p className="mt-1 text-sm text-slate-800">{data.summary}</p>
          </article>

          <ReportSection title="Frequency Insights" items={data.frequencyInsights} />
          <ReportSection title="Likely Triggers" items={data.likelyTriggers} />
          <ReportSection title="Medicine Response" items={data.medicineResponse} />
          <ReportSection title="Prevention Actions" items={data.preventionActions} />

          <p className="text-xs text-slate-500">
            Generated: {new Date(data.generatedAt).toLocaleString()} | {data.disclaimer}
          </p>
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">No live report yet. Click Generate Report.</p>
      )}
    </section>
  );
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
