# Copilot Instructions for ImmunoTrace

## Project Overview

ImmunoTrace is a Next.js 16 web app that helps users track recurring illnesses, store prescription history, and receive safe AI-assisted health insights powered by Google Gemini. Uses Vercel Postgres with Prisma ORM for persistence and NextAuth v5 for authentication.

## Build, Test, and Lint

```bash
# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Seed database with initial data
npm run db:seed

# Database operations
npx prisma generate       # Generate Prisma Client
npx prisma db push        # Push schema to database
npx prisma studio         # Open database GUI
```

No tests are currently implemented.

## Environment Setup

Required environment variables in `.env.local`:

- `POSTGRES_PRISMA_URL` - Postgres connection (transaction pooling, port 6543)
- `POSTGRES_URL_NON_POOLING` - Postgres direct connection (port 5432)
- `MISTRAL_API_KEY` - Mistral AI API key (Ministral-3B, Pixtral-12B, Mistral-Embed)
- `GEMINI_API_KEY` - Google Gemini API key for AI features (alternative to Mistral)
- `GEMINI_MODEL` - Defaults to `gemini-2.0-flash`
- `AUTH_SECRET` - NextAuth secret for session signing
- `AUTH_TRUST_HOST` - Set to `true` for NextAuth v5
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_APP_NAME` - App display name

**Important:** All AI endpoints gracefully fallback to deterministic responses when API keys are missing or invalid.

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
  ai/            - Gemini/Mistral integration and structured generation
    embeddings.ts       - Vector embeddings (Mistral-Embed)
    geminiClient.ts     - Gemini client setup
    immunoTraceAI.ts    - Core AI generation functions
    promptContracts.ts  - System prompt definitions
  db/
    prisma.ts          - Prisma client singleton
    prescriptionService.ts - Database CRUD operations
    errorHandling.ts   - Error utilities
  safety/        - Medical guardrails and disclaimers
  types/         - Zod schemas and TypeScript types
  auth.ts        - NextAuth v5 configuration
  demoUser.ts    - Demo user profile
app/
  (routes)/      - App Router pages
  api/           - API route handlers
    auth/        - NextAuth v5 handlers
components/
  layout/        - Layout components
  providers/     - React context providers
prisma/
  schema.prisma  - Database schema with pgvector
scripts/
  seed.ts        - Database seed script
```

### Key Patterns

#### Structured AI Generation

All AI responses use a unified pattern in `lib/ai/immunoTraceAI.ts`:

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

#### Postgres/Prisma Persistence

Database operations in `lib/db/prescriptionService.ts`:

- `listPrescriptions(userId)` - returns prescriptions sorted by recordedDate (newest first)
- `addPrescription(userId, entry)` - creates new prescription with vector embeddings
- `getPrescriptionById(userId, id)` - fetch single prescription
- `deletePrescription(userId, id)` - remove prescription by ID
- `findSimilarPrescriptions(userId, query, limit)` - semantic search using pgvector

**Prisma client:**
- `lib/db/prisma.ts` - Singleton pattern with global caching for serverless
- Models: `User`, `Prescription`, `Symptom`, `Medicine`, `PrescriptionEmbedding`
- Schema includes `pgvector` extension for 1024-dimensional embeddings (Mistral-Embed)

**Important patterns:**
- All database operations require `userId` for multi-tenant isolation
- Vector embeddings are automatically generated and stored for semantic search
- Use `include` in Prisma queries to fetch related `symptoms` and `medicines`

#### Authentication

NextAuth v5 configuration in `lib/auth.ts`:

- **Providers:** Credentials (demo mode), Google OAuth
- **Session strategy:** JWT
- **User lookup:** Prisma queries against `User` table by `userId`

Demo user profile (`lib/demoUser.ts`):
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

All API routes use `await auth()` to get session and extract `session.user.id` for database queries.

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

- **Next.js 16:** This project uses Next.js 16 with breaking changes. Uses App Router exclusively.
- **TypeScript strict mode enabled** in `tsconfig.json`
- **Path alias:** `@/*` maps to project root
- **Authentication:** NextAuth v5 with Google OAuth and demo credentials provider
- **Database:** Vercel Postgres with pgvector extension. Run `npx prisma db push` after schema changes.
- **OCR endpoint:** Expects `multipart/form-data` with `file` field (image)
- **Emergency keywords:** Chat API auto-escalates on "chest pain", "difficulty breathing", etc.
- **Vector search:** Uses Mistral-Embed (1024 dimensions) with pgvector for semantic prescription search

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
2. Update Prisma schema if adding new models/fields, then run `npx prisma generate` and `npx prisma db push`
3. Add fallback objects for graceful degradation in AI features
4. Include medical disclaimers on all health-related responses
5. Use `generateStructured()` pattern for AI features
6. Follow existing API response structure
7. Protect API routes with `await auth()` and validate `session.user.id`
8. Test with and without AI API keys configured
