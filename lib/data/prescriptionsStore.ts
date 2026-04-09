import type { PrescriptionEntry } from "@/lib/types/domain";

export type StoredPrescription = PrescriptionEntry & { id: string };

const initialData: StoredPrescription[] = [
  {
    id: "rx-001",
    recordedDate: "2026-01-10T00:00:00.000Z",
    illnessName: "Common cold",
    symptoms: [
      { name: "cough", severity: "moderate", durationDays: 3 },
      { name: "runny nose", severity: "mild", durationDays: 3 },
    ],
    diagnosis: "Acute viral upper respiratory infection",
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10 mg",
        frequency: "once daily",
        durationDays: 3,
      },
    ],
    outcome: "improved",
    notes: "Recovered in 4 days with rest and warm fluids.",
    source: "manual",
  },
];

const store: StoredPrescription[] = [...initialData];

export function listPrescriptions() {
  return [...store].sort(
    (a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime()
  );
}

export function addPrescription(entry: PrescriptionEntry) {
  const created: StoredPrescription = {
    ...entry,
    id: `rx-${Date.now()}`,
  };

  store.push(created);
  return created;
}
