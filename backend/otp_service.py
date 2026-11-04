"""
AIML Batchfolio — In-Memory OTP Manager
Tracks active 6-digit verification codes per student with TTL and rate limiting.
"""
import time
import secrets
from typing import Optional, Tuple
from email_service import send_otp_email, mask_email

# In-memory storage: usn -> { "otp": str, "email": str, "name": str, "expires_at": float, "attempts": int }
_otp_store: dict = {}

OTP_EXPIRY_SECONDS = 600  # 10 minutes
MAX_ATTEMPTS = 5


def generate_otp() -> str:
    """Generate secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def create_and_send_otp(usn: str, email: str, student_name: str) -> dict:
    """
    Generate, cache, and email an OTP for the given student.
    """
    clean_usn = usn.strip().upper()
    clean_email = email.strip()

    otp = generate_otp()
    now = time.time()

    _otp_store[clean_usn] = {
        "otp": otp,
        "email": clean_email,
        "name": student_name,
        "expires_at": now + OTP_EXPIRY_SECONDS,
        "attempts": 0,
    }

    delivery_result = send_otp_email(clean_email, student_name, otp)

    return {
        "status": "ok",
        "message": f"Verification code sent to {mask_email(clean_email)}",
        "masked_email": mask_email(clean_email),
    }


def verify_otp(usn: str, candidate_otp: str) -> Tuple[bool, str]:
    """
    Verify the candidate OTP.
    Returns (success: bool, message: str).
    """
    clean_usn = usn.strip().upper()
    entry = _otp_store.get(clean_usn)

    if not entry:
        return False, "No active verification code found. Please request a new OTP."

    if time.time() > entry["expires_at"]:
        _otp_store.pop(clean_usn, None)
        return False, "Verification code has expired. Please request a new OTP."

    entry["attempts"] += 1
    if entry["attempts"] > MAX_ATTEMPTS:
        _otp_store.pop(clean_usn, None)
        return False, "Too many incorrect attempts. Please request a new OTP."

    if candidate_otp.strip() != entry["otp"]:
        remaining = MAX_ATTEMPTS - entry["attempts"]
        return False, f"Incorrect verification code. {remaining} attempt(s) remaining."

    # Successful verification — clear used OTP
    _otp_store.pop(clean_usn, None)
    return True, "Verification successful."

