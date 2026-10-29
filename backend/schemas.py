"""
AIML Batchfolio — Pydantic Schemas
Request/Response models for all API routes.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    usn: str = Field(..., min_length=1, max_length=20)
    password: str = Field(..., pattern=r"^\d{8}$")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Student Update Schema ──────────────────────────────────────────────────────

class StudentUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[date] = None
    profile_picture_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    portfolio_website_url: Optional[str] = None
    resume_url: Optional[str] = None


# ── Student Response Schema ────────────────────────────────────────────────────

class StudentPublicResponse(BaseModel):
    id: int
    name: str
    usn: str
    email: str
    dept: str
    phone_no: Optional[str] = None
    dob: Optional[date] = None
    profile_picture_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    portfolio_website_url: Optional[str] = None
    resume_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
