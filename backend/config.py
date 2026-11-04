"""
AIML Batchfolio — Backend Configuration
Loads Supabase credentials from the .env file.
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(override=True)

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "")
PROFILE_PICTURES_BUCKET: str = os.getenv(
    "PROFILE_PICTURES_BUCKET", "profile-pictures"
)
RESUMES_BUCKET: str = os.getenv("RESUMES_BUCKET", "resumes")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env")

# Service-role client — bypasses Row Level Security (for admin ops)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

# JWT settings (for signing our own tokens)
JWT_SECRET: str = os.getenv("JWT_SECRET", "")
IS_PRODUCTION = (
    os.getenv("ENVIRONMENT", "").casefold() == "production"
    or os.getenv("RENDER", "").casefold() == "true"
)
if IS_PRODUCTION and len(JWT_SECRET.encode("utf-8")) < 32:
    raise RuntimeError("Set JWT_SECRET to a random value of at least 32 bytes in production")
if not JWT_SECRET:
    JWT_SECRET = "local-development-only-aiml-batchfolio-secret"
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_HOURS: int = 24

# Email Delivery Configuration (Brevo HTTPS REST API for production & SMTP for local dev)
BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "").strip().strip('"').strip("'")
SMTP_HOST: str = os.getenv("SMTP_HOST", "").strip().strip('"').strip("'")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587")) if os.getenv("SMTP_PORT", "587").strip().isdigit() else 587
SMTP_USER: str = os.getenv("SMTP_USER", "").strip().strip('"').strip("'")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").strip().strip('"').strip("'")
SMTP_FROM: str = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "AIML Batchfolio <batchfolio@gmail.com>")).strip().strip('"').strip("'")
SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").casefold() in ("true", "1", "yes")
