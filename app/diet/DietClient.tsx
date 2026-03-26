"use client";

import { useState } from "react";

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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Generate an updated Indian diet plan from your health history.</p>
        <button
          onClick={generateDiet}
          disabled={isLoading}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate Diet Plan"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {data ? (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Foods To Include</h3>
            <List items={data.includeFoods} />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Foods To Avoid</h3>
            <List items={data.avoidFoods} />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold">Weekly Suggestions</h3>
            <List items={data.weeklySuggestions} />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold">Kadha Recipe</h3>
            <p className="mt-2 text-sm text-slate-700">{data.kadhaRecipe}</p>
            <h4 className="mt-4 text-sm font-semibold text-slate-800">Seasonal Tips</h4>
            <List items={data.seasonalTips} />
            <p className="mt-4 text-xs text-slate-500">
              Generated: {new Date(data.generatedAt).toLocaleString()} | {data.disclaimer}
            </p>
          </article>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          No live diet plan yet. Click Generate Diet Plan.
        </p>
      )}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
