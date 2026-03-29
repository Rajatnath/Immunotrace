# Postgres Migration Plan

## Overview
Migrate the MVP data layer from MongoDB/Mongoose to Vercel Postgres using Prisma ORM. This aligns the project with the original slide deck vision, preparing it for Phase 2 scaling (`pgvector` semantic search instead of Pinecone).

## Project Type
BACKEND / WEB

## Success Criteria
- [ ] Vercel Postgres connection is established
- [ ] Prisma Schema completely replaces Mongoose models
- [ ] All 5 API Routes (`/prescriptions`, `/chat`, `/diet`, `/report`, `/ocr`) function exactly as before but using Prisma Client
- [ ] Zod models remain the source of truth for validation

## Tech Stack
- **Database:** Vercel Postgres (Free Hobby Tier — 256MB storage, 100 hrs compute/mo)
- **ORM:** Prisma (Excellent developer experience, perfect TypeScript safety, and handles relations seamlessly for the User -> Prescriptions model)

## File Structure Changes
```diff
   ImmunoTrace/
- ├── lib/db/mongodb.ts
- ├── lib/db/models/User.ts
- ├── lib/db/models/Prescription.ts
+ ├── prisma/schema.prisma
+ ├── lib/db/prisma.ts
  ├── lib/db/prescriptionService.ts (Updated to use Prisma)
```

## Task Breakdown
1. **[Task 1] Initialize Prisma:** Install `prisma` and `@prisma/client`. Set up `schema.prisma`. Agent: `backend-specialist`. Skill: `database-design`.
   - **Input:** Current Mongoose schemas
   - **Output:** Valid `.prisma` schema file with User, Prescription, Symptom, and Medicine models.
   - **Verify:** `npx prisma format` and `npx prisma validate` pass.
2. **[Task 2] Provision Vercel Postgres:** User creates the DB on Vercel and adds `POSTGRES_URL` to `.env.local`. Agent: `orchestrator`.
   - **Input:** Vercel Dashboard
   - **Output:** `.env.local` configured.
   - **Verify:** `npx prisma db push` succeeds.
3. **[Task 3] Rewrite `prescriptionService.ts`:** Refactor DB service methods. Agent: `backend-specialist`. Skill: `nodejs-best-practices`.
   - **Input:** Existing Mongoose CRUD calls
   - **Output:** Prisma Client queries (`prisma.prescription.create`, etc.)
   - **Verify:** TypeScript compiler throws zero errors.
4. **[Task 4] Update Next.js API Routes:** Remove any leftover Mongoose logic in `app/api/...`. Agent: `backend-specialist`.
   - **Input:** API Routes (`/api/auth/register`, `/api/prescriptions`)
   - **Output:** Clean API routes that only call the Prisma-backed service layer.
   - **Verify:** `npm run build` succeeds.

## Phase X: Verification
- [ ] Lint & TypeScript Check (`npm run lint && npx tsc --noEmit`)
- [ ] E2E Testing of the `/register` and `/prescriptions` flows manually or via scripts
- [ ] Ensure database relations (User -> Prescriptions) enforce referential integrity
