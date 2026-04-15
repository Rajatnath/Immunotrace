export interface StoredPrescription {
  id: string;
  recordedDate: Date;
  illnessName: string;
  diagnosis: string;
  outcome: string;
  source: string;
  medicines: { name: string; dosage: string; durationDays: number; frequency: string; }[];
  symptoms: { name: string; severity: string; }[];
}

export async function listPrescriptions(userId: string): Promise<StoredPrescription[]> {
  return [
    {
      id: "mock-prescription-1",
      recordedDate: new Date(),
      illnessName: "Seasonal Flu",
      diagnosis: "Acute Upper Respiratory Tract Infection",
      outcome: "recovering",
      source: "upload",
      symptoms: [
        { name: "Fever", severity: "high" },
        { name: "Cough", severity: "medium" }
      ],
      medicines: [
        { name: "Paracetamol", dosage: "500mg", durationDays: 3, frequency: "Twice daily" },
        { name: "Cetirizine", dosage: "10mg", durationDays: 5, frequency: "Once daily" }
      ]
    }
  ];
}

export async function getRecentHealthMetrics(userId: string) {
  return {
    totalPrescriptions: 1,
    activeMedicines: 2,
    recentSymptoms: 2
  };
}

export async function addPrescription(userId: string, doc: any, rawText?: string) {
  console.log("Mock addPrescription called", doc);
  return "mock-id-" + Date.now();
}

export async function listSymptoms(userId: string) {
  return [
    { name: "Fever", severity: "high", count: 1 },
    { name: "Cough", severity: "medium", count: 1 }
  ];
}

export async function listMedicines(userId: string) {
  return [
    { name: "Paracetamol", dosage: "500mg", durationDays: 3, prescribeCount: 1 },
    { name: "Cetirizine", dosage: "10mg", durationDays: 5, prescribeCount: 1 }
  ];
}
