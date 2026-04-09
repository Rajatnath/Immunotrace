# ImmunoTrace
#### **Personal health intelligence system for longitudinal history tracking and pattern detection.**

---

### **Overview**
ImmunoTrace is a specialized health intelligence platform designed to store, retrieve, and reason over a user's medical history. Unlike general-purpose assistants, it maintains a persistent context of past illnesses to identify recurring trends and provide data-driven insights.

*   **Longitudinal Tracking**: Stores prescriptions, symptoms, and diagnoses to build a multi-year health profile.
*   **Pattern Recognition**: Detects seasonal or environmental correlations in recurring symptoms.
*   **Structured Intelligence**: Transforms unstructured medical documents into actionable clinical data via RAG (Retrieval-Augmented Generation).

---

### **Key Features**
*   **Prescription OCR**: Extracts standardized medication and dosage data from uploaded medical documents.
*   **Context-Aware Chat**: Cross-references current symptoms with historical records to identify previous similar incidents.
*   **Diagnostic Discovery**: Uses a progressive questioning protocol to build a baseline profile for new users.
*   **Semantic Search**: Utilizes vector embeddings to retrieve relevant history for clinical reasoning.

---

### **Example Output**

**User Input:**
> "I have a persistent dry cough and mild fever. It feels similar to what I had last year around this time."

**ImmunoTrace Intelligence Response:**

| Section | Detail |
| :--- | :--- |
| **Clinical Summary** | Symptoms indicate an Upper Respiratory Tract Infection (URTI). Current presentation matches records from **March 2025** and **April 2024** (Bilateral OME). |
| **Pattern Insight** | **Seasonal Exacerbation Risk**: A clear recurring pattern is detected during the spring transition months. This suggests a potential environmental or seasonal trigger. |
| **Recommendations** | Monitor respiratory rate. If cough persists or wheezing develops, consult a physician to rule out secondary bacterial infection. |
| **Next Steps** | Request a physical examination of the tympanic membrane to check for effusion, as seen in previous spring episodes. |

---

### **How It Works**
1.  **Ingestion**: User uploads a prescription or enters symptoms.
2.  **Extraction**: Pixtral-12B identifies clinical entities (medications, symptoms, dates).
3.  **Retrieval**: The system queries the `pgvector` database for semantically similar historical events.
4.  **Reasoning**: Ministral-3B analyzes the current state against retrieved history to detect patterns.
5.  **Output**: A structured insight card is generated with evidence-based recommendations.

---

### **Tech Stack**

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Database** | Supabase (Postgres) with `pgvector` |
| **ORM** | Prisma |
| **Auth** | Auth.js (v5) with Google OAuth |
| **AI Models** | Ministral-3B (Reasoning), Pixtral-12B (Vision), Mistral-Embed |

---

### **Getting Started**

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/AkshatVerma-Code/ImmunoTrace.git
    cd ImmunoTrace
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Database & Prisma Setup**:
    - Ensure your Supabase project has `pgvector` enabled.
    - Generate the Prisma client and push the schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
4.  **Run the application**:
    ```bash
    npm run dev
    ```

---

### **Environment Variables**

> [!TIP]
> **Configuration**: Create a `.env.local` file in the root directory and populate it with the following keys. Refer to the respective provider dashboards (Google Cloud, Mistral AI, Supabase) to obtain these values.

```env
# --- NEXTAUTH (OAUTH) ---
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"
# Required for ngrok/tunnels
AUTH_TRUST_HOST=true

# --- GOOGLE OAUTH ---
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# --- AI INFRASTRUCTURE ---
# Mistral AI (Reasoning & Vision)
MISTRAL_API_KEY="your_mistral_api_key_here"
# Google Gemini (Analytics)
GEMINI_API_KEY="your_gemini_api_key_here"

# --- DATABASE (SUPABASE) ---
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="your_supabase_host_here"
POSTGRES_PASSWORD="your_database_password_here"
POSTGRES_USER="postgres"

# Prisma Pooling (Transaction - Port 6543)
POSTGRES_URL="postgresql://postgres.[REF]:[PW]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
POSTGRES_PRISMA_URL="postgresql://postgres.[REF]:[PW]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (Migrations/Maintenance - Port 5432)
POSTGRES_URL_NON_POOLING="postgresql://postgres.[REF]:[PW]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# --- SUPABASE INFRASTRUCTURE ---
SUPABASE_URL="https://your_project_ref.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"
```

---

### **Limitations**
*   **Offline Access**: Requires a stable internet connection for AI reasoning and database retrieval.
*   **OCR Accuracy**: Handwritten text quality can affect data extraction precision.
*   **History Density**: Pattern detection improves significantly as more historical data points are added.

---

### **Medical Disclaimer**
ImmunoTrace is an informational health tracking tool and **is not a substitute for professional medical diagnosis**. Always consult a certified healthcare provider for medical decisions. In emergencies, contact your local emergency services immediately.
# Immunotrace
