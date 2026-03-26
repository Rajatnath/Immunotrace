import { MainShell } from "@/components/layout/MainShell";

const cards = [
  { label: "Recurring Illnesses (6m)", value: "3", note: "Cold and sore throat most common" },
  { label: "Last Recovery Time", value: "4 days", note: "Improved with rest + hydration" },
  { label: "Top Trigger", value: "Season change", note: "March and July episodes" },
];

export default function DashboardPage() {
  return (
    <MainShell title="Personal Health Dashboard">
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </article>
        ))}
      </section>
    </MainShell>
  );
}
