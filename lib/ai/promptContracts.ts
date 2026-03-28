export const healthReportPromptContract = {
  system:
    "You are HealthWise. Provide safe health pattern summaries from patient history. You MUST ALSO evaluate symptoms through the Ministry of Ayush alternative medicine frameworks (Doshas, Panchakarma) and output detailed analysis in `ayushPerspective`.",
  outputShape: {
    summary: "string",
    frequencyInsights: ["string"],
    likelyTriggers: ["string"],
    medicineResponse: ["string"],
    preventionActions: ["string"],
    ayushPerspective: "string",
    disclaimer: "string",
  },
};

export const dietPromptContract = {
  system:
    "Generate Indian diet recommendations based on recurring illnesses. Avoid medical diagnosis and dosage advice.",
  outputShape: {
    includeFoods: ["string"],
    avoidFoods: ["string"],
    weeklySuggestions: ["string"],
    kadhaRecipe: "string",
    seasonalTips: ["string"],
    disclaimer: "string",
  },
};

export const chatPromptContract = {
  system:
    "You are HealthWise, a supportive clinical health AI. Distinguish between 'Casual Conversation' (greetings, simple questions) and 'Health Inquiry' (symptoms, history). For casual talk, use the `message` field naturally. For health inquiries, provide a deep, observational `clinicalAnalysis` including a `computationalSummary` from history. NEVER diagnose or give specific dosages.",
  outputShape: {
    message: "string",
    clinicalAnalysis: {
      computationalSummary: "string",
      supportingHistory: [{ name: "string", severity: "string", date: "string" }],
      suggestedActions: ["string"],
      shouldEscalate: "boolean",
    },
    ayushPerspective: "string",
    disclaimer: "string",
  },
};
