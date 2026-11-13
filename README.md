# AIML Batchfolio

The AIML Batchfolio frontend runs on Next.js, TypeScript, and Tailwind CSS. Its FastAPI backend remains a separate service and keeps the existing API routes.

A centralized batch portfolio platform for the Department of Artificial Intelligence & Machine Learning (AIML 2024–2028). The platform provides student directory exploration, interactive portfolio profiles, resume viewing and downloads, student authentication (USN + Date of Birth), and OTP-verified profile management.

---

## Prerequisites

Ensure you have the following installed on your machine before getting started:

- **Git**: [Download Git](https://git-scm.com/)
- **Python**: 3.10 or higher ([Download Python](https://www.python.org/))
- **Node.js**: 18.x or higher with npm ([Download Node.js](https://nodejs.org/))

---

## Getting Started

### 1. Clone the Repository

Open your terminal or command prompt and clone the repository:

```bash
git clone https://github.com/PreethamAcharya86/aiml-batchfolio.git
cd aiml-batchfolio
```

---

### 2. Backend Setup (FastAPI)

The backend runs on Python FastAPI and connects to Supabase for the database and file storage.

#### Step 2.1 — Navigate to the backend directory

```bash
cd backend
```

#### Step 2.2 — Create and activate a virtual environment

  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Step 2.3 — Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Step 2.4 — Configure environment variables

Copy the example environment file to create your local `.env`:

- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

Open `backend/.env` in your text editor and fill in the required values:

```env
# Supabase credentials (required)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SECRET_KEY=your-supabase-service-role-key

# JWT secret (required - generate a random 32-byte hex key)
# Run in terminal to generate: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET=your-random-32-byte-secret-key-here

# CORS Origins
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Environment mode
ENVIRONMENT=development

# Storage buckets in Supabase
PROFILE_PICTURES_BUCKET=profile-pictures
RESUMES_BUCKET=resumes

# Email & OTP Settings (Optional for local testing)
# If left empty, OTP codes are printed directly to the backend terminal for easy testing.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM=AIML Batchfolio <your_email@gmail.com>
SMTP_TLS=true
```

#### Step 2.5 — Start the backend server

Run the FastAPI development server with auto-reload enabled:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

The backend is now live at:
- **API Base:** [http://127.0.0.1:8001/api](http://127.0.0.1:8001/api)
- **Interactive API Docs (Swagger):** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Health Check:** [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)

---

### 3. Frontend Setup (Next.js)

Open a **new terminal window** (keep the backend server running in the first one).

#### Step 3.1 — Navigate to the frontend directory

From the root project directory:

```bash
cd frontend
```

#### Step 3.2 — Install Node.js dependencies

```bash
npm install
```

#### Step 3.3 — Configure frontend environment (Optional)

The frontend automatically points to `http://127.0.0.1:8001/api` by default when running locally. If you wish to explicitly set it, copy the example environment file:

- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env.local
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env.local
  ```

Ensure `frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
```

#### Step 3.4 — Start the frontend development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
aiml-batchfolio/
├── backend/
│   ├── auth.py              # JWT authentication & student resolution
│   ├── config.py            # Environment & Supabase initialization
│   ├── database.py          # Database helper operations
│   ├── email_service.py     # OTP dispatch (Brevo HTTPS API & Gmail SMTP)
│   ├── main.py              # FastAPI endpoints & route handlers
│   ├── otp_service.py       # OTP generation, storage & verification
│   ├── requirements.txt     # Python backend dependencies
│   ├── schemas.py           # Pydantic request/response models
│   ├── test_email.py        # Standalone email test script
│   └── .env.example         # Template for backend environment variables
│
├── frontend/
│   ├── app/
│   │   ├── globals.css      # Global styles and Tailwind directives
│   │   ├── layout.tsx       # Root layout & page metadata
│   │   ├── page.tsx         # Home directory & student cards
│   │   ├── LoginModal.tsx   # Student login modal (USN + DOB)
│   │   ├── OtpVerificationModal.tsx # OTP verification popup
│   │   ├── ProfileEditor.tsx# Profile editing modal
│   │   ├── lib/             # API client, session helpers & data utils
│   │   ├── profile/         # Dedicated student profile view
│   │   └── resumes/         # Batch resume gallery & PDF previewer
│   ├── package.json         # Frontend dependencies & scripts
│   └── .env.example         # Template for frontend environment variables
│
└── README.md                # Project documentation & setup guide
```

---

## Authentication & Verification Flow

1. **Student Login**: Students log in using their **USN** (case-insensitive) and their **Date of Birth** in `DDMMYYYY` format as the password.
2. **First-Time / Missing Email**: If a student's email address is not yet saved, the user is directed to input and save their email.
3. **One-Time Password (OTP)**: When editing a profile with an existing email, a 6-digit OTP is generated and sent to the registered student email.
4. **Local Testing Without Email**: If SMTP credentials are not configured in `backend/.env`, the OTP is printed directly to the backend terminal console for instant local testing.
