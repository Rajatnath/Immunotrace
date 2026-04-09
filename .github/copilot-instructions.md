# Copilot Instructions for HealthWise

## Project Overview

HealthWise is a Next.js web app (MVP) that helps users track recurring illnesses, store prescription history, and receive safe AI-assisted health insights powered by Google Gemini. Currently single-user with in-memory persistence (data resets on server restart).

## Build, Test, and Lint

```bash
# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Seed MongoDB with initial data
npm run db:seed
```

No tests are currently implemented.

## Environment Setup

Required environment variables in `.env.local` (see `.env.example`):

- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `GEMINI_MODEL` - Defaults to `gemini-2.0-flash`
- `MONGODB_URI` - MongoDB connection (scaffold only, not yet functional)
- `NEXT_PUBLIC_APP_NAME` - App display name

**Important:** All AI endpoints gracefully fallback to deterministic responses when `GEMINI_API_KEY` is missing or invalid. MongoDB operations fall back to mock mode when `MONGODB_URI` is not configured.

## Architecture

### Core Components

- **App Router pages:** `/dashboard`, `/prescriptions`, `/report`, `/diet`, `/chat`
- **API Routes:** All in `app/api/` directory
  - `GET/POST /api/prescriptions` - CRUD for prescription history
  - `POST /api/ocr` - Extract prescription data from images (multipart upload with `file` field)
  - `POST /api/report` - Generate health pattern reports from history
  - `POST /api/diet` - Generate Indian diet recommendations
  - `POST /api/chat` - Conversational health assistant with emergency escalation

### Directory Structure

```
lib/
  ai/            - Gemini integration and structured generation
  data/          - Legacy in-memory data stores (deprecated)
  db/
    models/      - Mongoose schemas (Prescription, User)
    mongodb.ts   - MongoDB connection with caching
    prescriptionService.ts - Database CRUD operations
    errorHandling.ts - MongoDB error utilities
  safety/        - Medical guardrails and disclaimers
  types/         - Zod schemas and TypeScript types
  demoUser.ts    - Hardcoded demo user profile
app/
  (route)/       - App Router pages
  api/           - API route handlers
components/
  layout/        - Layout components (MainShell)
scripts/
  seed.ts        - MongoDB seed script
```

### Key Patterns

#### Structured AI Generation

All AI responses use a unified pattern in `lib/ai/healthwiseAI.ts`:

```typescript
generateStructured({
  system: "system prompt",
  user: "user prompt with context",
  schema: zodSchema,
  fallback: { ... }, // deterministic fallback if API fails
  extraParts: [ ... ] // optional for multimodal (OCR)
})
```

- **Always include fallback objects** - enables demo mode without API keys
- Responses are JSON with `responseMimeType: "application/json"`
- Use `extractFirstJsonObject()` to strip markdown fences if present

#### Zod-First Validation

All domain types live in `lib/types/domain.ts` as Zod schemas:

- Define schema with `.min()`, `.max()`, `.default()`, `.optional()` constraints
- Export TypeScript type with `z.infer<typeof schema>`
- Validate in API routes with `schema.safeParse()` and return structured errors:

```typescript
const parsed = prescriptionEntrySchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid prescription payload.",
      details: parsed.error.flatten(),
    },
  }, { status: 400 });
}
```

#### Medical Safety Guardrails

**Critical:** All medical responses must include:

1. Safety disclaimer via `getSafetyDisclaimer()` from `lib/safety/medicalGuardrails.ts`
2. Emergency detection via `containsEmergencySignal()` for keywords like "chest pain", "difficulty breathing", etc.
3. Response sanitization via `sanitizeMedicalResponse()` to strip dosage values in conservative mode

**Never:**

- Provide direct diagnoses
- Give specific dosage instructions (sanitized to "[dosage removed]")
- Skip the disclaimer in any AI-generated health response

#### MongoDB Persistence

Database operations in `lib/db/prescriptionService.ts`:

- `listPrescriptions()` - returns prescriptions sorted by recordedDate (newest first)
- `addPrescription(entry)` - creates new prescription with MongoDB _id
- `getPrescriptionById(id)` - fetch single prescription
- `deletePrescription(id)` - remove prescription by ID

**Graceful degradation:**
- If `MONGODB_URI` is not set, API routes return mock data or empty arrays
- Connection uses global caching to avoid duplicate connections in serverless
- Run `npm run db:seed` to populate initial demo prescription

**Mongoose models:**
- `lib/db/models/Prescription.ts` - Maps to Zod `prescriptionEntrySchema`
- `lib/db/models/User.ts` - Maps to Zod `userProfileSchema` (future auth)
- Uses `models.X || model()` pattern to prevent hot-reload recompilation

#### In-Memory Data Store (Deprecated)

`lib/data/prescriptionsStore.ts` is kept for reference but no longer used. All persistence now goes through MongoDB service layer.

#### Demo User Profile

`lib/demoUser.ts` exports hardcoded profile:

```typescript
{
  userId: "demo-user-1",
  age: 27,
  city: "Bengaluru",
  allergies: ["dust"],
  sleepHours: 6.5,
  dietType: "vegetarian",
  activityLevel: "moderate"
}
```

Used as context for AI report/diet/chat generation. No auth system in MVP.

### Prompt Contracts

AI system prompts are centralized in `lib/ai/promptContracts.ts` with explicit output shapes for documentation. These define behavior boundaries:

- `healthReportPromptContract` - observational health patterns, no diagnosis
- `dietPromptContract` - Indian diet recommendations, no medical dosage advice
- `chatPromptContract` - conservative assistant with escalation for severe symptoms

## Styling and Fonts

- Tailwind CSS v4 with `@tailwindcss/postcss`
- Custom fonts: Space Grotesk (UI) and Source Serif 4 (accent), defined in `app/layout.tsx`
- CSS variables: `--font-space-grotesk` and `--font-source-serif`

## Important Notes

- **Next.js 16:** This project uses Next.js 16 with breaking changes. Consult `node_modules/next/dist/docs/` for current API conventions. Existing AGENTS.md warns about training data mismatches.
- **TypeScript strict mode enabled** in `tsconfig.json`
- **Path alias:** `@/*` maps to project root
- **No authentication:** Single demo-user workflow for MVP speed
- **MongoDB:** Run `npm run db:seed` after setting up MongoDB. Connection helper caches globally for serverless compatibility.
- **OCR endpoint:** Expects `multipart/form-data` with `file` field (image)
- **Emergency keywords:** Chat API auto-escalates on "chest pain", "difficulty breathing", etc.

## API Response Format

All API routes follow consistent structure:

```typescript
// Success
{ success: true, data: { ... } }

// Error
{
  success: false,
  error: {
    code: "VALIDATION_ERROR" | "SERVER_ERROR",
    message: "...",
    details: { ... } // optional Zod error details
  }
}
```

## Extending the Codebase

When adding features:

1. Define Zod schemas in `lib/types/domain.ts` first
2. Add fallback objects for graceful degradation
3. Include medical disclaimers on all health-related responses
4. Use `generateStructured()` pattern for AI features
5. Follow existing API response structure
6. Test with and without `GEMINI_API_KEY` configured
