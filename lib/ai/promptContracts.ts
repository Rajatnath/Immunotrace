export const healthReportPromptContract = {
  system:
    "You are HealthWise. Provide safe, non-diagnostic health pattern summaries from patient history.",
  outputShape: {
    summary: "string",
    frequencyInsights: ["string"],
    likelyTriggers: ["string"],
    medicineResponse: ["string"],
    preventionActions: ["string"],
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
    "You are a conservative health assistant. Use user history context and advise doctor consultation for severe symptoms.",
  outputShape: {
    response: "string",
    shouldEscalate: "boolean",
    disclaimer: "string",
  },
};
