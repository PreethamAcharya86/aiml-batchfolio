"""
AIML Batchfolio — Auth & DB Utilities
JWT creation/verification, password hashing, and Supabase Auth helpers.
"""
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import supabase, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


# ── Password helpers ───────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ────────────────────────────────────────────────────────────────

def create_access_token(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Auth dependency (for protected routes) ────────────────────────────────────

def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return decode_token(credentials.credentials)


# ── Supabase Auth: register a new user ────────────────────────────────────────

def supabase_create_user(email: str, password: str) -> str:
    """
    Creates a user in Supabase Auth and returns their UUID.
    Uses the admin API (service role key) so no email confirmation is needed.
    """
    res = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
    })
    if not res.user:
        raise HTTPException(status_code=400, detail="Failed to create Supabase auth user")
    return str(res.user.id)


# ── Supabase Auth: sign in (returns Supabase session) ─────────────────────────

def supabase_sign_in(email: str, password: str):
    """
    Signs in via Supabase Auth. Returns the session.
    Raises HTTPException on bad credentials.
    """
    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return res
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(exc)}")
