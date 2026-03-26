import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff9f1] px-4">
      <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />

      <main className="relative w-full max-w-4xl rounded-3xl border border-orange-200 bg-white/95 p-8 shadow-xl md:p-12">
        <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
          Health Memory, Not Just Records
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
          HealthWise MVP Foundation Is Ready
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Start by adding prescriptions, generate your recurring-illness report, view diet guidance, and use the
          contextual safety-first assistant.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link className="rounded-xl bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-500" href="/dashboard">
            Open Dashboard
          </Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50" href="/prescriptions">
            Add Prescription
          </Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50" href="/report">
            View Report
          </Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50" href="/diet">
            Diet Plan
          </Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50" href="/chat">
            AI Chat
          </Link>
        </div>
      </main>
    </div>
  );
}
