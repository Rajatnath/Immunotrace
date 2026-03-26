"use client";

import { useState } from "react";
import type { PrescriptionEntry } from "@/lib/types/domain";

type PrescriptionResponse = PrescriptionEntry & { id: string };

type OcrExtracted = {
  illnessName: string;
  diagnosis: string;
  symptoms: string[];
  medicines: Array<{ name: string; dosage: string; frequency: string }>;
  confidence: number;
};

export function PrescriptionsClient({ initialHistory }: { initialHistory: PrescriptionResponse[] }) {
  const lowConfidenceThreshold = 0.75;
  const [illnessName, setIllnessName] = useState("");
  const [symptomsText, setSymptomsText] = useState("");
  const [medicinesText, setMedicinesText] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [outcome, setOutcome] = useState<"improved" | "same" | "worse" | "unknown">("unknown");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PrescriptionResponse[]>(initialHistory);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [source, setSource] = useState<"manual" | "ocr">("manual");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrReviewed, setOcrReviewed] = useState(false);

  const needsOcrReview = source === "ocr" && (ocrConfidence ?? 1) < lowConfidenceThreshold;
  const reviewInputClass = needsOcrReview
    ? "rounded-lg border border-amber-300 bg-amber-50 p-2"
    : "rounded-lg border p-2";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (needsOcrReview && !ocrReviewed) {
      setError("OCR confidence is low. Please review fields and confirm before saving.");
      return;
    }

    const parsedDate = new Date(recordedDate);
    if (isNaN(parsedDate.getTime())) {
      setError("Invalid date format. Please select a valid date.");
      return;
    }

    setIsSaving(true);

    const symptomItems = symptomsText
      .split(",")
      .map((item) => item.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({ name, severity: "mild" as const, durationDays: 3 }));

    if (symptomItems.length === 0) {
      setError("Please add at least one symptom.");
      setIsSaving(false);
      return;
    }

    const medicineItems = medicinesText
      .split(",")
      .map((item) => item.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({
        name,
        dosage: "as prescribed",
        frequency: "as prescribed",
        durationDays: 3,
      }));

    if (medicineItems.length === 0) {
      setError("Please add at least one medicine.");
      setIsSaving(false);
      return;
    }

    const payload = {
      recordedDate: parsedDate.toISOString(),
      illnessName,
      symptoms: symptomItems,
      diagnosis,
      medicines: medicineItems,
      outcome,
      source,
    };

    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Could not save prescription.");
      setIsSaving(false);
      return;
    }

    setIllnessName("");
    setSymptomsText("");
    setMedicinesText("");
    setDiagnosis("");
    setOutcome("unknown");
    setSource("manual");
    setOcrConfidence(null);
    setOcrReviewed(false);
    setHistory((current) => [result.data, ...current]);
    setIsSaving(false);
  }

  async function handleOcrExtract() {
    if (!selectedFile || isExtracting) {
      return;
    }

    setIsExtracting(true);
    setOcrMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setOcrMessage(payload?.error?.message ?? "OCR extraction failed.");
        setIsExtracting(false);
        return;
      }

      const extracted = payload.data?.extracted as OcrExtracted;
      setIllnessName(extracted.illnessName || "");
      setDiagnosis(extracted.diagnosis || "");
      setSymptomsText((extracted.symptoms || []).join(", "));
      setMedicinesText((extracted.medicines || []).map((item) => item.name).join(", "));
      setSource("ocr");
      setOcrConfidence(extracted.confidence ?? null);
      setOcrReviewed(false);
      setOcrMessage(`OCR complete. Confidence: ${Math.round((extracted.confidence ?? 0) * 100)}%. Review and save.`);
      setIsExtracting(false);
    } catch (error) {
      setOcrMessage("Network error during OCR extraction.");
      setIsExtracting(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Manual Entry</h3>
        <p className="mt-1 text-sm text-slate-600">
          Add details manually or auto-fill from prescription OCR.
        </p>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">Upload Prescription for OCR</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-lg border bg-white p-2 text-sm"
            />
            <button
              type="button"
              onClick={handleOcrExtract}
              disabled={isExtracting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
            >
              {isExtracting ? "Extracting..." : "Extract via OCR"}
            </button>
          </div>
          {ocrMessage ? <p className="mt-2 text-xs text-slate-600">{ocrMessage}</p> : null}
          {source === "ocr" && ocrConfidence !== null ? (
            <p className="mt-1 text-xs text-slate-600">
              Confidence score: {Math.round(ocrConfidence * 100)}%
              {needsOcrReview ? " (manual review required)" : " (good confidence)"}
            </p>
          ) : null}
        </div>

        <form className="mt-4 grid gap-3 text-sm" onSubmit={handleSubmit}>
          <input
            className={reviewInputClass}
            placeholder="Illness name"
            value={illnessName}
            onChange={(event) => setIllnessName(event.target.value)}
          />
          <input
            className={reviewInputClass}
            placeholder="Diagnosis"
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
          />
          <input
            className={reviewInputClass}
            placeholder="Symptoms (comma-separated)"
            value={symptomsText}
            onChange={(event) => setSymptomsText(event.target.value)}
          />
          <input
            className={reviewInputClass}
            placeholder="Medicines (comma-separated)"
            value={medicinesText}
            onChange={(event) => setMedicinesText(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-lg border p-2"
              type="date"
              value={recordedDate}
              onChange={(event) => setRecordedDate(event.target.value)}
            />
            <select
              className="rounded-lg border p-2"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as typeof outcome)}
            >
              <option value="unknown">Outcome: unknown</option>
              <option value="improved">Outcome: improved</option>
              <option value="same">Outcome: same</option>
              <option value="worse">Outcome: worse</option>
            </select>
          </div>
          {needsOcrReview ? (
            <label className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <input
                type="checkbox"
                checked={ocrReviewed}
                onChange={(event) => setOcrReviewed(event.target.checked)}
              />
              I reviewed OCR-filled fields and confirm they are correct.
            </label>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSaving || (needsOcrReview && !ocrReviewed)}
            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-500 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : `Save Prescription (${source})`}
          </button>
        </form>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Recent Prescriptions</h3>
        <p className="mt-1 text-sm text-slate-600">In-memory API-backed history for the current run.</p>
        <div className="mt-4 space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{item.illnessName}</p>
              <p className="text-xs text-slate-500">
                {new Date(item.recordedDate).toLocaleDateString()} - {item.outcome}
              </p>
              <p className="mt-1 text-sm text-slate-700">Symptoms: {item.symptoms.map((s) => s.name).join(", ")}</p>
              <p className="text-sm text-slate-700">Medicines: {item.medicines.map((m) => m.name).join(", ")}</p>
            </div>
          ))}
          {history.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No prescriptions yet.
            </p>
          ) : null}
        </div>
      </article>
    </section>
  );
}
