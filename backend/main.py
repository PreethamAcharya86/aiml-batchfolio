"""
AIML Batchfolio — FastAPI Main Application
Password convention: DOB in DDMMYYYY format
  e.g.  DOB 23/11/2006  →  password "23112006"

Endpoints:
  POST /api/auth/signup     — Register a new student (password = DOB as DDMMYYYY)
  POST /api/auth/login      — Login with USN/email + DOB password
  GET  /api/students        — List all students (public)
  GET  /api/students/{usn}  — Get single student by USN
  PUT  /api/students/{usn}  — Edit own profile (JWT required)
  GET  /api/batch-info      — Batch metadata
  GET  /api/health          — Health check
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timezone


def dob_to_password(dob_iso: str) -> str:
    """Convert ISO date 'YYYY-MM-DD' → 'DDMMYYYY' (the student's password)."""
    dt = datetime.strptime(dob_iso, "%Y-%m-%d")
    return dt.strftime("%d%m%Y")

from config import supabase
from schemas import (
    SignupRequest, LoginRequest, TokenResponse,
    StudentUpdateRequest, StudentPublicResponse
)
from auth import (
    create_access_token,
    supabase_create_user,
    supabase_sign_in,
    get_current_student,
)

app = FastAPI(
    title="AIML Batchfolio API",
    description="Backend API for the AIML 2024-2028 Batch Portfolio Platform",
    version="1.0.0",
)

frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health", tags=["System"])
def health():
    return {"status": "ok", "service": "AIML Batchfolio API", "timestamp": datetime.now(timezone.utc).isoformat()}


# ═══════════════════════════════════════════════════════════════════════════════
# BATCH META INFO
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/batch-info", tags=["Batch"])
def get_batch_info():
    return {
        "branch": "AIML",
        "branchFullName": "Artificial Intelligence & Machine Learning",
        "batch": "2024-2028",
        "strength": 63,
        "hod": "Dr Sunil Kumar",
        "institution": "Mangalore Institute of Technology & Engineering (MITE)",
        "club": "ARTIFERA - The AIML Student Association",
        "aboutBranch": (
            "The Department of Artificial Intelligence & Machine Learning at MITE is dedicated to "
            "nurturing future-ready technologists, researchers, and innovators. Equipped with "
            "state-of-the-art computational infrastructure, industry-aligned curricula, and "
            "hands-on laboratory ecosystems, the department empowers students in Deep Learning, "
            "Computer Vision, Natural Language Processing, Autonomous Systems, and Predictive "
            "Analytics. Under the visionary guidance of HOD Dr. Sunil Kumar and the dynamic "
            "student forum ARTIFERA, students cultivate technical mastery, collaborative research, "
            "and real-world problem-solving skills."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH: SIGNUP
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/signup", tags=["Auth"], status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest):
    """
    Register a new AIML student.
    Password is derived automatically from DOB: DDMMYYYY
      e.g. DOB 2006-05-15  →  password "15052006"
    DOB is required for registration.
    """
    # DOB is mandatory — password comes from it
    if not body.dob:
        raise HTTPException(status_code=422, detail="Date of birth (dob) is required for registration")

    # Derive password from DOB
    auto_password = dob_to_password(body.dob.isoformat())

    # Check duplicates
    existing_usn = supabase.table("student").select("id").eq("usn", body.usn.upper()).execute()
    if existing_usn.data:
        raise HTTPException(status_code=409, detail="USN already registered")

    existing_email = supabase.table("student").select("id").eq("email", body.email.lower()).execute()
    if existing_email.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    # 1. Create Supabase Auth user (password = DDMMYYYY)
    auth_uid = supabase_create_user(body.email.lower(), auto_password)

    # 2. Insert into student table
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "name":         body.name,
        "usn":          body.usn.upper(),
        "email":        body.email.lower(),
        "dept":         body.dept,
        "auth_user_id": auth_uid,
        "phone_no":     body.phone_no,
        "dob":          body.dob.isoformat(),
        "created_at":   now,
        "updated_at":   now,
    }
    insert_res = supabase.table("student").insert(row).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to create student record")

    student = insert_res.data[0]

    # 3. Create JWT
    token = create_access_token({"sub": student["usn"], "email": student["email"], "id": student["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": student["id"], "name": student["name"], "usn": student["usn"], "email": student["email"]},
    }


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH: LOGIN
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login", tags=["Auth"])
def login(body: LoginRequest):
    """
    Log in with USN or email.
    Password = DOB in DDMMYYYY format (e.g. DOB 23/11/2006 → "23112006").
    Resolves USN → email → Supabase Auth sign-in → JWT.
    """
    identifier = body.identifier.strip()

    # Resolve: if identifier is not an email, look up by USN
    if "@" not in identifier:
        res = supabase.table("student").select("email").eq("usn", identifier.upper()).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="USN not found")
        email = res.data[0]["email"]
    else:
        email = identifier.lower()

    # Authenticate via Supabase Auth
    try:
        supabase_sign_in(email, body.password)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Fetch student record
    student_res = supabase.table("student").select("*").eq("email", email).execute()
    if not student_res.data:
        raise HTTPException(status_code=404, detail="Student record not found")
    student = student_res.data[0]

    # Create JWT
    token = create_access_token({"sub": student["usn"], "email": student["email"], "id": student["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": student["id"], "name": student["name"], "usn": student["usn"], "email": student["email"]},
    }


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENTS: LIST ALL
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/students", tags=["Students"])
def list_students():
    """
    Return all students sorted by name (public — no auth required).
    Sensitive fields (auth_user_id) are excluded.
    """
    res = supabase.table("student").select(
        "id, name, usn, email, dept, phone_no, dob, "
        "profile_picture_url, github_url, linkedin_url, "
        "instagram_url, portfolio_website_url, resume_url, "
        "created_at, updated_at"
    ).order("name").execute()

    return res.data or []


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENTS: GET BY USN
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/students/{usn}", tags=["Students"])
def get_student(usn: str):
    res = supabase.table("student").select(
        "id, name, usn, email, dept, phone_no, dob, "
        "profile_picture_url, github_url, linkedin_url, "
        "instagram_url, portfolio_website_url, resume_url, "
        "created_at, updated_at"
    ).eq("usn", usn.upper()).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail=f"Student '{usn}' not found")
    return res.data[0]


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENTS: UPDATE OWN PROFILE (JWT required)
# ═══════════════════════════════════════════════════════════════════════════════

@app.put("/api/students/{usn}", tags=["Students"])
def update_student(
    usn: str,
    body: StudentUpdateRequest,
    current_user: dict = Depends(get_current_student),
):
    """
    Edit the authenticated student's own profile.
    A student can only edit their own record.
    """
    # Authorization check
    if current_user["sub"].upper() != usn.upper():
        raise HTTPException(status_code=403, detail="You can only edit your own profile")

    # Build update payload — only include fields that were actually sent
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Serialize date objects
    if "dob" in updates and updates["dob"]:
        updates["dob"] = updates["dob"].isoformat()

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    res = supabase.table("student").update(updates).eq("usn", usn.upper()).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found or update failed")

    return {"message": "Profile updated successfully", "student": res.data[0]}
