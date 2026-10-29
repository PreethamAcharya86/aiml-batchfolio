"""
AIML Batchfolio — FastAPI Main Application
Login uses a student's USN and date of birth as DDMMYYYY.

Endpoints:
  POST /api/auth/login      — Login with USN + DOB password
  GET  /api/students        — List all students (public)
  GET  /api/students/{usn}  — Get single student by USN
  PUT  /api/students/{usn}  — Edit own profile (JWT required)
  GET  /api/batch-info      — Batch metadata
  GET  /api/health          — Health check
"""
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timezone
import hmac
import os

from config import supabase
from schemas import LoginRequest, StudentUpdateRequest
from auth import (
    create_access_token,
    get_current_student,
    decode_token,
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

STUDENT_PROFILE_COLUMNS = (
    "id, name, dob, usn, phone_no, dept, bio, skills, email, "
    "profile_picture_url, github_url, linkedin_url, instagram_url, "
    "portfolio_website_url, resume_url, created_at, updated_at"
)
STUDENT_PROFILE_RESPONSE_COLUMNS = STUDENT_PROFILE_COLUMNS
STUDENT_PUBLIC_COLUMNS = STUDENT_PROFILE_RESPONSE_COLUMNS.replace("dob, ", "")


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
# AUTH: LOGIN
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login", tags=["Auth"])
def login(body: LoginRequest):
    """
    Authenticate a student by USN and DOB in DDMMYYYY format.
    """
    student_res = (
        supabase.table("student")
        .select("id, name, usn, email, dob")
        .eq("usn", body.usn.strip().upper())
        .execute()
    )
    if not student_res.data:
        raise HTTPException(status_code=401, detail="Invalid USN or date of birth")
    student = student_res.data[0]
    student_dob = student.get("dob")
    if not student_dob:
        raise HTTPException(status_code=401, detail="Invalid USN or date of birth")

    expected_password = date.fromisoformat(str(student_dob)).strftime("%d%m%Y")
    if not hmac.compare_digest(body.password, expected_password):
        raise HTTPException(status_code=401, detail="Invalid USN or date of birth")

    # Create JWT
    token = create_access_token(
        {"sub": student["usn"], "email": student.get("email"), "id": student["id"]}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student["id"],
            "name": student["name"],
            "usn": student["usn"],
            "email": student.get("email"),
        },
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
    res = (
        supabase.table("student")
        .select(STUDENT_PUBLIC_COLUMNS)
        .order("name")
        .execute()
    )

    return res.data or []


@app.get("/api/students/me", tags=["Students"])
def get_my_profile(current_user: dict = Depends(get_current_student)):
    """Return the authenticated student's complete editable profile."""
    usn = current_user.get("sub")
    if not isinstance(usn, str) or not usn:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    res = (
        supabase.table("student")
        .select(STUDENT_PROFILE_RESPONSE_COLUMNS)
        .eq("usn", usn.upper())
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return res.data[0]


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENTS: GET BY USN
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/students/{usn}", tags=["Students"])
def get_student(
    usn: str,
    request: Request,
):
    if usn.casefold() == "me":
        scheme, separator, token = request.headers.get("authorization", "").partition(" ")
        if scheme.casefold() != "bearer" or not separator or not token:
            raise HTTPException(status_code=401, detail="Authentication required")

        current_user = decode_token(token)
        current_usn = current_user.get("sub")
        if not isinstance(current_usn, str) or not current_usn:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        res = (
            supabase.table("student")
            .select(STUDENT_PROFILE_RESPONSE_COLUMNS)
            .eq("usn", current_usn.upper())
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return res.data[0]

    res = supabase.table("student").select(
        STUDENT_PUBLIC_COLUMNS
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
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "name" in updates and not updates["name"]:
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    if "dob" in updates and updates["dob"] is None:
        raise HTTPException(status_code=422, detail="Date of birth cannot be empty")
    if "skills" in updates and updates["skills"] is None:
        updates["skills"] = []

    # Serialize date objects
    if "dob" in updates and updates["dob"] is not None:
        updates["dob"] = updates["dob"].isoformat()

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    res = (
        supabase.table("student")
        .update(updates)
        .eq("usn", usn.upper())
        .select(STUDENT_PROFILE_RESPONSE_COLUMNS)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found or update failed")

    return {"message": "Profile updated successfully", "student": res.data[0]}
