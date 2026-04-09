"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Trash2, Filter, Upload, Loader2 } from "lucide-react";

export function RecordsClient({ initialRecords = [] }: { initialRecords: any[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  // Local state is the single source of truth for the table
  const [localRecords, setLocalRecords] = useState<any[]>(initialRecords);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Analyzing clinical document... (approx 15s)");

    try {
      // 1. Convert file to Base64 for persistence
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 2. Send optical payload to OCR endpoint
      const formData = new FormData();
      formData.append("file", file);

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!ocrRes.ok) throw new Error("OCR Processing Failed");
      const ocrPayload = await ocrRes.json();
      
      if (!ocrPayload.success) throw new Error(ocrPayload.error?.message || "OCR Extraction Failed");
      const { extracted } = ocrPayload.data;

      setUploadStatus("Saving structured clinical data & original document...");

      // Type mapping
      const safeSymptoms = Array.isArray(extracted.symptoms) && extracted.symptoms.length > 0 
        ? extracted.symptoms.map((s: any) => typeof s === "string" 
            ? { name: s.trim() || "Unspecified Symptom", severity: "mild" } 
            : { name: (s?.name || "").trim() || "Unspecified Symptom", severity: s?.severity || "mild" })
        : [{ name: "General Checkup", severity: "mild" }];
        
      const safeMedicines = Array.isArray(extracted.medicines) && extracted.medicines.length > 0
        ? extracted.medicines.map((m: any) => ({
            name: (m?.name || "").trim() || "Unspecified Medicine",
            dosage: (m?.dosage || "").trim() || "As Prescribed",
            frequency: (m?.frequency || "").trim() || "Daily",
            durationDays: m?.durationDays || 3,
          }))
        : [{ name: "Consult Physician", dosage: "N/A", frequency: "N/A", durationDays: 1 }];

      const payload = {
        recordedDate: new Date().toISOString(),
        source: "ocr",
        illnessName: extracted.illnessName || "Clinical Document Upload",
        diagnosis: extracted.diagnosis || "Pending Final Review",
        symptoms: safeSymptoms,
        medicines: safeMedicines,
        imageData: base64Image, // Store the original image!
      };

      // 3. Transmit to Database route
      const saveRes = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) {
        throw new Error(`Failed to persist to database: ${saveRes.status}`);
      }

      const saveData = await saveRes.json();
      const newRecord = saveData.data || { ...payload, id: crypto.randomUUID() };
      setLocalRecords(prev => [newRecord, ...prev]);

      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Upload error.");
      setIsUploading(false);
      setUploadStatus("");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      setLocalRecords(prev => prev.filter(r => r.id !== id));
      const res = await fetch(`/api/prescriptions?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setLocalRecords(initialRecords);
        throw new Error("Failed");
      }
      router.refresh();
    } catch (err) {
      alert("Error.");
    }
  }

  function handleDownload(record: any) {
    if (record.imageData) {
      // Download original image if available
      const downloadLink = document.createElement("a");
      downloadLink.href = record.imageData.startsWith("data:") ? record.imageData : `data:image/jpeg;base64,${record.imageData}`;
      downloadLink.download = `Prescription_${record.id}.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // Fallback: Download JSON data
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `HealthWise_Record_${record.id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }

  const records = localRecords.map(record => {
    const bytes = JSON.stringify(record).length * 45;
    const size = (bytes / 1024).toFixed(1) + " KB";
    
    return {
      ...record,
      id: record.id,
      name: record.diagnosis || record.illnessName || "General Consultation",
      size,
      type: record.source === "ocr" ? "DOCUMENT" : "CLINICAL NOTE",
      date: new Date(record.recordedDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
      providerName: "HealthWise Platform",
      providerRole: record.source === "ocr" ? "OCR Engine" : "AI Engine",
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start pt-10">
      
      {/* Header Container */}
      <div className="mb-10 flex w-full items-start justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical Records</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Securely stored documents, lab results, and prescriptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Advanced filtering panel expands here, sorting by Provider, Code, or Date Range.")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" /> Filter
          </button>
          
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-2xl bg-[#0F3D3E] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#0c3132] disabled:opacity-70"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {uploadStatus}</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload Record</>
            )}
          </button>
        </div>
      </div>

      {/* Primary Table Container */}
      <div className="w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        
        {/* Table Header Wrapper for Grid Alignment */}
        <div className="grid grid-cols-12 items-center border-b border-slate-100 px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
          <div className="col-span-4">DOCUMENT NAME</div>
          <div className="col-span-2">TYPE</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-3">PROVIDER</div>
          <div className="col-span-1 text-right">ACTIONS</div>
        </div>

        {/* Table Rows Wrapper */}
        <div className="flex flex-col">
          {records.length === 0 ? (
            <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm font-medium text-slate-500">
              No documents securely stored yet.
            </div>
          ) : (
            records.map((record, i) => (
              <div 
                key={record.id} 
                className="grid grid-cols-12 items-center border-b border-slate-100 px-8 py-5 transition-colors hover:bg-slate-50/50 animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                style={{ animationDelay: `${i * 100}ms`, animationDuration: '600ms' }}
              >
                
                {/* Document Name & Icon */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2EC4B6]/10 text-[#2EC4B6]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#0F172A]">{record.name}</span>
                    <span className="mt-0.5 text-[12px] font-medium text-[#94A3B8]">{record.size}</span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="col-span-2 flex items-center">
                  <span className="w-fit rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                    {record.type}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 flex items-center text-[13px] font-bold text-[#334155]">
                  {record.date}
                </div>

                {/* Provider */}
                <div className="col-span-3 flex flex-col justify-center">
                  <span className="text-[13px] font-bold text-[#334155]">{record.providerName}</span>
                  <span className="text-[11px] font-medium text-slate-400">{record.providerRole}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-3 text-[#94A3B8]">
                  <button 
                    onClick={() => handleDownload(record)}
                    title="Download Record"
                    className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    title="Delete Record"
                    className="rounded-full p-2 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Load More Button spanning full width at bottom */}
        <button 
          onClick={() => alert("All recorded clinical data points from the Postgres cloud are already indexed locally.")}
          className="w-full py-5 text-center text-[13px] font-bold tracking-wide text-[#2EC4B6] transition-colors hover:bg-[#2EC4B6]/5 hover:text-[#25A79B] focus:outline-none"
        >
          Load More Records
        </button>

      </div>
    </div>
  );
}
