"""
AIML Batchfolio — Pydantic Schemas
Request/Response models for all API routes.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    usn: str = Field(..., min_length=10, max_length=15, pattern=r"^[0-9A-Za-z]+$")
    email: EmailStr
    dob: date  # Required — password is derived as DDMMYYYY
    phone_no: Optional[str] = None
    dept: str = "AIML"
    year: Optional[int] = Field(None, ge=1, le=4)

class LoginRequest(BaseModel):
    identifier: str    # USN or email
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Student Update Schema ──────────────────────────────────────────────────────

class StudentUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[date] = None
    year: Optional[int] = Field(None, ge=1, le=4)
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
    year: Optional[int] = None
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
