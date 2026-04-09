import { z } from "zod";
import { getGeminiClient } from "@/lib/ai/geminiClient";
import {
  chatPromptContract,
  dietPromptContract,
  healthReportPromptContract,
} from "@/lib/ai/promptContracts";
import { listPrescriptions, findSimilarPrescriptions } from "@/lib/db/prescriptionService";
import { generateContentEmbedding } from "@/lib/ai/embeddings";
import { getSafetyDisclaimer, sanitizeMedicalResponse } from "@/lib/safety/medicalGuardrails";
import { dietPlanSchema, healthReportSchema } from "@/lib/types/domain";

// Global session flag to avoid repetitive 404 latency if embeddings are unavailable
let ragEnabled = true;

const ocrSchema = z.object({
  illnessName: z.string(),
  diagnosis: z.string(),
  symptoms: z.array(z.string()),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
    })
  ),
  confidence: z.number().min(0).max(1),
});

const chatSchema = z.object({
  message: z.string().describe("Empathetic, clinical conversational response."),
  insightCard: z.object({
    type: z.enum(["PATTERN", "URGENT", "GENERAL"]),
    title: z.string(),
    summary: z.string(),
    evidence: z.array(z.string()).describe("Specific dates or symptoms from past records."),
    recommendations: z.array(z.string()).describe("List of practical clinical actions."),
    nextSteps: z.array(z.string()).describe("List of guided questions or diagnostic steps."),
    confidence: z.number().min(0).max(1),
  }).optional().describe("Only include if a specific pattern or clinical insight is detected in history."),
  followUp: z.string().describe("The PRIMARY next question to ask the user (for Discovery or check-in)."),
  ayushPerspective: z.string().optional(),
  disclaimer: z.string(),
});

function extractFirstJsonObject(rawText: string) {
  const trimmed = rawText.trim();
  const direct = trimmed.match(/\{[\s\S]*\}$/);
  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const genericFenced = trimmed.match(/```\s*([\s\S]*?)```/i);
  
  const jsonStr = direct ? direct[0] : (fenced?.[1] ? fenced[1].trim() : (genericFenced?.[1] ? genericFenced[1].trim() : trimmed));
  
  try {
    const parsed = JSON.parse(jsonStr);
    // 1. Unwrap root key if present
    const keys = Object.keys(parsed);
    if (keys.length === 1 && typeof parsed[keys[0]] === "object" && parsed[keys[0]] !== null) {
      console.warn(`Unwrapping AI nested root key: ${keys[0]}`);
      return JSON.stringify(parsed[keys[0]]);
    }

    // 2. Fuzzy mapping for common 3B errors
    const normalized: any = {};
    const map: Record<string, string> = {
      greeting: "message",
      text: "message",
      response: "message",
      nextSteps: "followUp",
      suggestions: "followUp",
      perspective: "ayushPerspective"
    };

    Object.entries(parsed).forEach(([k, v]) => {
      let targetKey = map[k as keyof typeof map] || k;
      
      // Deep repair for insightCard
      if (targetKey === "insightCard" && typeof v === "object" && v !== null) {
        const card: any = { ...v };
        const cardMap: Record<string, string> = { pattern: "summary", recommendation: "recommendations" };
        
        const repairedCard: any = {};
        Object.entries(card).forEach(([ck, cv]) => {
          const ctk = cardMap[ck] || ck;
          
          // Ensure arrays for recommendations and nextSteps
          if ((ctk === "recommendations" || ctk === "nextSteps") && typeof cv === "string") {
            repairedCard[ctk] = [cv];
          } else {
            repairedCard[ctk] = cv;
          }
        });

        // Ensure mandatory keys for schema safety
        repairedCard.type = repairedCard.type || "GENERAL";
        repairedCard.title = repairedCard.title || "Clinical Insight";
        repairedCard.evidence = repairedCard.evidence || [];
        repairedCard.recommendations = repairedCard.recommendations || [];
        repairedCard.nextSteps = repairedCard.nextSteps || [];
        repairedCard.confidence = typeof repairedCard.confidence === "number" ? repairedCard.confidence : 0.9;

        normalized[targetKey] = repairedCard;
      } else if (targetKey === "ayushPerspective" && typeof v === "object" && v !== null) {
        normalized[targetKey] = JSON.stringify(v, null, 2);
      } else {
        normalized[targetKey] = v;
      }
    });

    return JSON.stringify(normalized);
  } catch (e) {
    return jsonStr;
  }
}

async function generateMistralStructured<T>(params: {
  system: string;
  user: string;
  schema: z.ZodSchema<T>;
  fallback: T;
  interfaceName?: string;
}) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("Missing MISTRAL_API_KEY. Using fallback.");
    return params.fallback;
  }

  const structureHint = params.interfaceName 
    ? `Return a JSON object matching the '${params.interfaceName}' definition.`
    : `Return a JSON object matching this example structure: ${JSON.stringify(params.fallback, null, 2)}`;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "ministral-3b-2512",
        messages: [
          { role: "system", content: `${params.system}

### 🛑 CRITICAL: STRICT OUTPUT RULES (PRO-LEVEL)
1. You MUST return ONLY a valid, flat JSON object.
2. Do NOT include any markdown, backticks (\`\`\`), or extra text.
3. Do NOT wrap in root keys (e.g., NO "HealthWiseResponse").
4. Root level keys MUST be: ${Object.keys((params.schema as any).shape || {}).join(", ")}.
5. 'ayushPerspective' MUST be a STRING, not an object.
6. STICK TO THE SCHEMA. DO NOT RENAME KEYS.

### 🎯 EXAMPLE OUTPUT:
{
  "message": "Direct conversational response...",
  "insightCard": { ... },
  "followUp": "Next question...",
  "ayushPerspective": "Ayush text...",
  "disclaimer": "Notice..."
}

STRICTLY OUTPUT JSON ONLY.` },
          { role: "user", content: `${structureHint}\n\n${params.user}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      })
    });

    if (!response.ok) {
      console.error("Mistral Chat failure HTTP status:", response.status);
      return params.fallback;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonStr = extractFirstJsonObject(content);
    try {
      const parsed = JSON.parse(jsonStr);
      return params.schema.parse(parsed);
    } catch (err) {
      console.error("Mistral structured parse failed, applying Pro-Level Fallback.");
      // FALLBACK Level 3: Professional UI message instead of raw JSON dump
      return {
        ...params.fallback,
        message: "I'm having a little trouble processing your clinical history at the moment. Let me re-analyze. Could you please rephrase or add more details about your current symptoms?",
        followUp: "Can you describe the onset and severity of your symptoms again?",
        disclaimer: getSafetyDisclaimer(),
      };
    }
  } catch (error) {
    console.error("Mistral structured generation failed", error);
    return params.fallback;
  }
}

async function buildHistoryContext(userId: string) {
  try {
    const history = await listPrescriptions(userId);
    if (history.length === 0) {
      return "No prescription history available.";
    }

    return history
      .map((entry) => {
        const symptoms = entry.symptoms.map((item) => item.name).join(", ");
        const medicines = entry.medicines.map((item) => item.name).join(", ");
        return `${entry.recordedDate} | ${entry.illnessName} | symptoms: ${symptoms} | diagnosis: ${entry.diagnosis} | medicines: ${medicines} | outcome: ${entry.outcome}`;
      })
      .join("\n");
  } catch (dbError: any) {
    if (dbError?.message?.includes("Can't reach database") || dbError?.message?.includes("P1001")) {
      return "CRITICAL: Database connection failed. Please check if your Supabase project is active or your internet connection.";
    }
    return "No prescription history available (DB error).";
  }
}

export async function runPixtralOcrFromImage(file: { mimeType: string; base64: string }) {
  const fallback = {
    illnessName: "Upper respiratory infection",
    diagnosis: "Likely viral",
    symptoms: ["cough", "sore throat"],
    medicines: [{ name: "Cetirizine", dosage: "10 mg", frequency: "once daily" }],
    confidence: 0.5,
  };

  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("Missing MISTRAL_API_KEY environment variable. Using fallback.");
      return fallback;
    }

    // Call Mistral Pixtral-12b directly via native fetch
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract standardized clinical information from this medical document/prescription. You MUST return ONLY valid JSON with NO markdown wrapping, NO backticks, and NO other text. Must match exactly this structure: { \"illnessName\": \"string\", \"diagnosis\": \"string\", \"symptoms\": [\"string\"], \"medicines\": [ { \"name\": \"string\", \"dosage\": \"string\", \"frequency\": \"string\" } ], \"confidence\": 0.95 }"
              },
              {
                type: "image_url",
                image_url: `data:${file.mimeType};base64,${file.base64}`
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error("Mistral API error HTTP status:", response.status, await response.text());
      return fallback;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Pass raw string block through our robust JSON un-wrapper
    const cleanJsonStr = extractFirstJsonObject(content);
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanJsonStr);
    } catch (parseErr) {
      console.error("Failed to parse Pixtral response payload:", cleanJsonStr, parseErr);
      return fallback;
    }

    // Validate strictly against the OCR Zod Schema
    return ocrSchema.parse(parsedJson);

  } catch (error) {
    console.error("Pixtral OCR Generation failed:", error);
    return fallback;
  }
}

export async function runGeminiHealthReport(userId: string) {
  const context = await buildHistoryContext(userId);
  const fallback = {
    generatedAt: new Date().toISOString(),
    summary: "Recurring cold pattern detected with seasonal sensitivity.",
    frequencyInsights: ["3 episodes in 6 months"],
    likelyTriggers: ["Season transition", "Sleep under 7 hours"],
    medicineResponse: ["Cetirizine and rest previously helped"],
    preventionActions: ["Hydration", "Consistent sleep", "Warm fluids"],
    ayushPerspective: "According to general Ayush guidelines, warm water and light diet (Laghuaahar) is recommended.",
    disclaimer: getSafetyDisclaimer(),
  };

  const generated = await generateMistralStructured({
    system: "You are HealthWise (Powered by Mistral). Analyze the clinical history and generate a personalized health pattern report.",
    user: `Prescription history:\n${context}\n\nGenerate a report with summary, frequencyInsights, likelyTriggers, medicineResponse, preventionActions, and ayushPerspective.`,
    schema: healthReportSchema,
    fallback,
  });

  return { ...generated, generatedAt: new Date().toISOString(), disclaimer: getSafetyDisclaimer() };
}

export async function runGeminiDietPlan(userId: string) {
  const context = await buildHistoryContext(userId);
  const fallback = {
    generatedAt: new Date().toISOString(),
    includeFoods: ["Amla", "Tulsi", "Ginger", "Moong dal"],
    avoidFoods: ["Cold drinks", "Deep-fried foods"],
    weeklySuggestions: ["Warm breakfast 5 days/week", "Soup dinner twice/week"],
    kadhaRecipe: "Boil tulsi, ginger, black pepper, and cinnamon for 8 minutes.",
    seasonalTips: ["Increase warm fluids during monsoon"],
    disclaimer: getSafetyDisclaimer(),
  };

  const generated = await generateMistralStructured({
    system: "You are HealthWise (Powered by Mistral). Create an Indian diet plan with includeFoods, avoidFoods, weeklySuggestions, kadhaRecipe, and seasonalTips.",
    user: `Prescription history:\n${context}\n\nGenerate the diet plan structure. No dosage advice.`,
    schema: dietPlanSchema,
    fallback,
  });

  return { ...generated, generatedAt: new Date().toISOString(), disclaimer: getSafetyDisclaimer() };
}

async function buildRAGContext(input: string, userId: string) {
  if (!ragEnabled) {
    return buildHistoryContext(userId);
  }

  try {
    const history = await listPrescriptions(userId);
    if (history.length === 0) return "No prescription history available.";

    const vector = await generateContentEmbedding(input);
    
    // If we got a zero-vector or failure-vector (all zeros), it's a soft-fail from embeddings.ts
    // We don't disable RAG here because it might be a temporary 429.
    if (!vector || (vector.length > 0 && vector.every(v => v === 0))) {
      return buildHistoryContext(userId);
    }

    const matches = await findSimilarPrescriptions(vector, userId, 3);
    if (matches && matches.length > 0) {
      return matches.map((m: any, i: number) => `[Relevant Semantic Record ${i+1}] ${m.content}`).join("\n\n");
    }
  } catch (err: any) {
    console.error("RAG context retrieval failed during embedding/search phase.");
    
    // If it's a 404 (model missing), disable RAG for the session to prevent 7s latencies
    if (err?.message?.includes("404") || err?.message?.includes("not found")) {
      console.warn("Disabling Semantic RAG for this session due to model 404.");
      ragEnabled = false;
    }
  }
  
  return buildHistoryContext(userId);
}

export async function runGeminiChat(input: string, userId: string, history: any[] = []) {
  const context = await buildRAGContext(input, userId);
  const hasHistory = context && context !== "No prescription history available.";

  const fallback = {
    message: hasHistory 
      ? "I have analyzed your medical records. How can I assist you with your health details today?" 
      : "Hi, I'm HealthWise. To understand your body better, I'll ask a few questions. First, do you have any chronic conditions or known allergies?",
    followUp: hasHistory
      ? "How have your symptoms been progressing since the last diagnosis?"
      : "Do you have any known allergies or chronic conditions I should be aware of?",
    insightCard: undefined,
    disclaimer: getSafetyDisclaimer(),
  };

  const historyPrompt = history.length > 0
    ? `Thread history:\n${history.map(m => `${m.role}: ${m.content}`).join("\n")}`
    : `NEW CONVERSATION. ${hasHistory ? "USER HAS HISTORY. Follow 'Analyzed Knowledge' protocol." : "NO HISTORY. Follow 'Simple Hi' protocol."}`;

  const interfaceDefinition = `
    interface ChatResponse {
      message: string; // "Hi, how can I help you?" (no history) OR "I have analyzed..." (history exists)
      insightCard?: {
        type: "PATTERN" | "URGENT" | "GENERAL";
        title: string;
        summary: string;
        evidence: string[];
        recommendations: string[];
        nextSteps: string[];
        confidence: number;
      };
      followUp: string; // The primary next question
      ayushPerspective?: string;
      disclaimer: string;
    }
  `;

  const systemPrompt = `You are the HealthWise Intelligence System. You are a clinical-grade medical assistant designed to "remember and understand the user's body over time."

### CORE PROTOCOLS:
1. **CONTEXT-AWARE MODE (Data Exists)**:
   - If history context is provided, you MUST reference specific past events.
   - Look for patterns (seasonal trends, recurring symptoms).
   - Greeting: "I have analyzed that you have [Condition] based on your records from [Month/Year]..."
   - Output an 'insightCard' highlighting the pattern.

2. **DISCOVERY MODE (No Data/New User)**:
   - If no history exists, your goal is to build a context tree.
   - Ask 1-2 focused, progressive questions.
   - Greeting: "Hi, I'm HealthWise. To understand your body better, I'll ask a few questions. First, do you have any chronic conditions or known allergies?"
   - Do NOT include an 'insightCard' unless user provides specific data in the current turn.

3. **TONE**:
   - High-trust, clinical, minimal. 
   - Prioritize user data over general knowledge.
   - If uncertain, indicate it clearly.

4. **INTELLIGENCE**:
   - Never say "I don't have access to your data." You DO have the context below.
   - Use the 'Patient Clinical History' provided to be highly accurate.`;

  const generated = await generateMistralStructured({
    system: systemPrompt,
    user: `
    ${historyPrompt}
    
    User current message: "${input}"
    
    PATIENT CLINICAL HISTORY (Context):
    ${context}
    
    INSTRUCTIONS:
    - If history exists, cross-reference current symptoms with past dates for pattern detection.
    - If new user, ignore pattern detection and focus on discovery.
    - Strictly match the HealthWiseResponse schema.`,
    schema: chatSchema,
    fallback,
    interfaceName: "HealthWiseResponse",
  });

  return {
    ...generated,
    message: sanitizeMedicalResponse(generated.message),
    insightCard: generated.insightCard ? {
      ...generated.insightCard,
      summary: sanitizeMedicalResponse(generated.insightCard.summary),
      recommendations: generated.insightCard.recommendations.map(r => sanitizeMedicalResponse(r)),
      nextSteps: generated.insightCard.nextSteps.map(s => sanitizeMedicalResponse(s)),
    } : undefined,
    disclaimer: getSafetyDisclaimer(),
  };
}
