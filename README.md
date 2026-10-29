# AIML Batchfolio

The AIML Batchfolio frontend runs on Next.js, TypeScript, and Tailwind CSS. Its
FastAPI backend remains a separate service and keeps the existing API routes.

## Run locally

### Backend

In PowerShell:

```powershell
Set-Location .\backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `backend\.env`. Set a random
`JWT_SECRET` of at least 32 bytes; production refuses to start without it.
The backend allows the local Next.js origins on port 3000 by default.

### Frontend

In a second PowerShell terminal:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default API URL is
`http://127.0.0.1:8000/api`. Override it by setting
`NEXT_PUBLIC_API_BASE_URL` in `frontend\.env.local`.

## Deploy

### Frontend — Vercel

Import the repository into Vercel and set the project **Root Directory** to
`frontend`. Vercel detects Next.js and runs the build automatically. Add this
environment variable in the Vercel project settings:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND-HOST/api
```

Use the public HTTPS URL of the deployed FastAPI API. Redeploy after changing
this value because `NEXT_PUBLIC_` variables are embedded at build time. The
production build fails if this value is missing. Include the `/api` path and
omit a trailing slash, for example `https://batchfolio-api.onrender.com/api`.

### Backend — separate Python host

Deploy `backend` as a Python web service (for example, on Render):

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

Set these backend environment variables:

- `ENVIRONMENT=production`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (keep this only on the backend; never expose it to the frontend)
- `JWT_SECRET` (a randomly generated value of at least 32 bytes)
- `FRONTEND_ORIGINS` (comma-separated frontend origins, such as
  `https://YOUR-PROJECT.vercel.app,https://www.example.com`; use origins only,
  with no paths or trailing slashes)

The API health check is available at `/api/health`, and the OpenAPI
documentation is available at `/docs`.
