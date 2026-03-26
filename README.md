# HealthWise 🏥

**Your Personal Health Memory for Recurring Illnesses**

HealthWise is a Next.js web application that helps users track recurring illnesses, store prescription history, and receive safe AI-assisted health insights powered by Google Gemini. Built as an MVP with MongoDB persistence and comprehensive medical safety guardrails.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Medical Disclaimer](#-medical-disclaimer)

---

## ✨ Features

- 📝 **Prescription Tracking** - Store and manage recurring illness history
- 🤖 **AI-Powered OCR** - Extract prescription data from images automatically
- 📊 **Health Pattern Reports** - Identify frequency, triggers, and patterns from your history
- 🥗 **Indian Diet Recommendations** - Get personalized diet plans based on your health data
- 💬 **AI Health Assistant** - Conversational chat with emergency symptom detection
- 🔒 **Medical Safety Guardrails** - Conservative responses with disclaimers and emergency escalation
- 💾 **MongoDB Persistence** - Data persists across server restarts
- 🎯 **Graceful Degradation** - Works without Gemini API (fallback mode) and without MongoDB (mock mode)

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB with Mongoose ODM
- **AI:** Google Gemini API (`@google/genai`)
- **Validation:** Zod schemas
- **Fonts:** Space Grotesk (UI), Source Serif 4 (accent)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **MongoDB** 5.x or higher
  - **Option 1:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local install)
  - **Option 2:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud, free tier available)
  - **Option 3:** Docker - `docker run -d -p 27017:27017 --name mongodb mongo:latest`
- **Google Gemini API Key** ([Get API Key](https://ai.google.dev/gemini-api/docs/api-key))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AkshatVerma-Code/HealthWise.git
cd HealthWise
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Mongoose, Gemini SDK, and development tools.

---

## ⚙️ Configuration

### 1. Create Environment File

```bash
# On Linux/Mac
cp .env.example .env.local

# On Windows (PowerShell)
Copy-Item .env.example .env.local
```

### 2. Configure Environment Variables

Open `.env.local` and add your credentials:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3-flash-preview

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/HealthWise

# Application Settings
NEXT_PUBLIC_APP_NAME=HealthWise
```

#### Getting a Gemini API Key:

1. Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key and paste it in `.env.local`

#### MongoDB URI Formats:

- **Local:** `mongodb://localhost:27017/HealthWise`
- **Atlas:** `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/HealthWise`
- **Docker:** `mongodb://localhost:27017/HealthWise` (same as local)

---

## 💾 Database Setup

### Option 1: Local MongoDB (Recommended for Development)

If you installed MongoDB locally:

```bash
# Start MongoDB service (Linux)
sudo systemctl start mongod

# Start MongoDB service (Mac with Homebrew)
brew services start mongodb-community

# Start MongoDB service (Windows)
# MongoDB runs as a Windows service automatically after installation
```

### Option 2: MongoDB with Docker

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb-healthwise mongo:latest

# Verify it's running
docker ps
```

### Option 3: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Add your IP to the whitelist
4. Use the connection string in `.env.local`

### Seed Initial Data

Once MongoDB is running, populate the database with demo data:

```bash
npm run db:seed
```

**Expected output:**
```
✅ Connected to MongoDB
📝 Seeding initial prescription data...
✅ Seed data created successfully!
📊 Total prescriptions: 1
```

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

The application will be available at:
- **Local:** http://localhost:3000
- **Network:** http://your-ip:3000

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
HealthWise/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Page components
│   │   ├── dashboard/            # Dashboard page
│   │   ├── prescriptions/        # Prescription management
│   │   ├── report/               # Health pattern reports
│   │   ├── diet/                 # Diet recommendations
│   │   └── chat/                 # AI health assistant
│   ├── api/                      # API route handlers
│   │   ├── prescriptions/        # CRUD for prescriptions
│   │   ├── ocr/                  # Prescription OCR extraction
│   │   ├── report/               # Generate health reports
│   │   ├── diet/                 # Generate diet plans
│   │   └── chat/                 # AI chat endpoint
│   ├── layout.tsx                # Root layout with fonts
│   └── globals.css               # Global styles
├── components/                   # React components
│   └── layout/                   # Layout components
│       └── MainShell.tsx         # Main app shell with navigation
├── lib/                          # Core business logic
│   ├── ai/                       # Gemini AI integration
│   │   ├── geminiClient.ts       # Gemini SDK client
│   │   ├── healthwiseAI.ts       # Structured AI generation
│   │   └── promptContracts.ts    # AI system prompts
│   ├── db/                       # Database layer
│   │   ├── models/               # Mongoose schemas
│   │   │   ├── Prescription.ts   # Prescription model
│   │   │   └── User.ts           # User profile model
│   │   ├── mongodb.ts            # MongoDB connection
│   │   ├── prescriptionService.ts # CRUD operations
│   │   └── errorHandling.ts      # DB error utilities
│   ├── data/                     # Legacy in-memory store (deprecated)
│   ├── safety/                   # Medical guardrails
│   │   └── medicalGuardrails.ts  # Safety checks & disclaimers
│   ├── types/                    # Type definitions
│   │   └── domain.ts             # Zod schemas & TypeScript types
│   └── demoUser.ts               # Demo user profile
├── scripts/                      # Utility scripts
│   └── seed.ts                   # Database seeding script
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Your local config (gitignored)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
└── next.config.ts                # Next.js config
```

---

## 🌐 API Endpoints

All API routes return consistent JSON structure:

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "SERVER_ERROR",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Available Endpoints:

#### **GET /api/prescriptions**
List all prescriptions sorted by date (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "677abc123...",
      "recordedDate": "2026-03-26T00:00:00.000Z",
      "illnessName": "Common cold",
      "symptoms": [{ "name": "cough", "severity": "moderate", "durationDays": 3 }],
      "diagnosis": "Viral infection",
      "medicines": [{ "name": "Cetirizine", "dosage": "10 mg", "frequency": "once daily", "durationDays": 3 }],
      "outcome": "improved",
      "notes": "Recovered in 4 days",
      "source": "manual"
    }
  ]
}
```

#### **POST /api/prescriptions**
Create a new prescription entry.

**Request Body:**
```json
{
  "recordedDate": "2026-03-26T00:00:00.000Z",
  "illnessName": "Fever",
  "symptoms": [{ "name": "fever", "severity": "moderate", "durationDays": 2 }],
  "diagnosis": "Viral fever",
  "medicines": [{ "name": "Paracetamol", "dosage": "500 mg", "frequency": "3x daily", "durationDays": 3 }],
  "outcome": "improved",
  "source": "manual"
}
```

#### **POST /api/ocr**
Extract prescription data from uploaded image.

**Request:** `multipart/form-data` with `file` field (image/pdf)

**Response:**
```json
{
  "success": true,
  "data": {
    "extracted": {
      "illnessName": "...",
      "diagnosis": "...",
      "symptoms": ["..."],
      "medicines": [{ "name": "...", "dosage": "...", "frequency": "..." }],
      "confidence": 0.85
    }
  }
}
```

#### **POST /api/report**
Generate AI health pattern report from prescription history.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "...",
    "frequencyInsights": ["..."],
    "likelyTriggers": ["..."],
    "medicineResponse": ["..."],
    "preventionActions": ["..."],
    "disclaimer": "..."
  }
}
```

#### **POST /api/diet**
Generate Indian diet recommendations based on health history.

**Response:**
```json
{
  "success": true,
  "data": {
    "includeFoods": ["Amla", "Tulsi", "..."],
    "avoidFoods": ["Cold drinks", "..."],
    "weeklySuggestions": ["..."],
    "kadhaRecipe": "...",
    "seasonalTips": ["..."],
    "disclaimer": "..."
  }
}
```

#### **POST /api/chat**
Conversational AI health assistant with context awareness.

**Request Body:**
```json
{
  "message": "I have a cough and sore throat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on your history...",
    "shouldEscalate": false,
    "disclaimer": "..."
  }
}
```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run db:seed` | Populate MongoDB with demo data |

### Key Development Patterns

#### 1. **Zod-First Validation**
All domain types are defined in `lib/types/domain.ts`:

```typescript
import { prescriptionEntrySchema } from "@/lib/types/domain";

const parsed = prescriptionEntrySchema.safeParse(data);
if (!parsed.success) {
  // Handle validation error
}
```

#### 2. **Structured AI Generation**
Use the `generateStructured()` pattern for all AI features:

```typescript
import { generateStructured } from "@/lib/ai/healthwiseAI";

const result = await generateStructured({
  system: "System prompt",
  user: "User prompt with context",
  schema: zodSchema,
  fallback: { ... }, // Always provide fallback!
});
```

#### 3. **Medical Safety Guardrails**
All health responses must include safety measures:

```typescript
import { getSafetyDisclaimer, containsEmergencySignal, sanitizeMedicalResponse } from "@/lib/safety/medicalGuardrails";

// Check for emergency keywords
if (containsEmergencySignal(message)) {
  // Escalate to emergency
}

// Always include disclaimer
const disclaimer = getSafetyDisclaimer();

// Sanitize dosage information
const sanitized = sanitizeMedicalResponse(response);
```

#### 4. **MongoDB Operations**
Use the service layer for database operations:

```typescript
import { listPrescriptions, addPrescription, getPrescriptionById, deletePrescription } from "@/lib/db/prescriptionService";

// All operations handle connection failures gracefully
const prescriptions = await listPrescriptions(); // Returns [] if DB not connected
```

---

## 🔍 Troubleshooting

### Issue: "Failed to save prescription"

**Cause:** MongoDB connection error or database name conflict

**Solutions:**
1. Verify MongoDB is running: `mongosh` or check MongoDB Compass
2. Check `MONGODB_URI` in `.env.local` is correct
3. Ensure database name is `HealthWise` (case-sensitive)
4. Check MongoDB logs for connection errors

### Issue: "Gemini API quota exceeded"

**Cause:** Free tier API limits reached

**Solutions:**
1. Wait for quota reset (daily/hourly limits)
2. App continues working with fallback responses
3. Upgrade to paid plan if needed
4. Monitor usage at [Google AI Studio](https://ai.dev/rate-limit)

### Issue: "Port 3000 already in use"

**Cause:** Another process is using port 3000

**Solutions:**
```bash
# Next.js will automatically use port 3001
# Or kill the existing process:

# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: TypeScript errors after changes

**Solution:**
```bash
# Check for type errors
npx tsc --noEmit

# Restart dev server
npm run dev
```

### Issue: OCR not working

**Causes & Solutions:**
1. **File size too large** - Gemini has file size limits (~10MB)
2. **Invalid file format** - Use JPG, PNG, or PDF
3. **API quota exceeded** - Check Gemini console
4. **Low confidence** - OCR requires manual review if confidence < 75%

---

## 🩺 Medical Disclaimer

**IMPORTANT:** HealthWise is an informational tool and NOT a substitute for professional medical advice.

- ✅ Use it to track your health history
- ✅ Use it for general wellness suggestions
- ❌ Do NOT use it for medical diagnosis
- ❌ Do NOT use it for dosage instructions
- ❌ Do NOT delay seeking professional help

**Emergency symptoms** (chest pain, difficulty breathing, severe bleeding, etc.) trigger automatic escalation with instructions to seek immediate medical care.

---

## 🤝 Contributing

This is an MVP project. Contributions are welcome! Please follow the existing code patterns:

1. Define Zod schemas in `lib/types/domain.ts` first
2. Include fallback objects for graceful degradation
3. Add medical disclaimers on all health-related features
4. Use the `generateStructured()` pattern for AI features
5. Follow the existing API response structure
6. Test with and without `GEMINI_API_KEY` configured

---

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Next.js team for the amazing framework
- MongoDB for reliable data persistence

---

**Built with ❤️ for better health tracking**
