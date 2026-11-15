"""
AIML Batchfolio — In-Memory OTP Manager
Tracks active 6-digit verification codes per student with TTL and rate limiting.
"""
import time
import secrets
from typing import Optional, Tuple
from email_service import send_otp_email, mask_email

# In-memory storage: usn -> { "otp": str, "email": str, "name": str, "expires_at": float, "last_sent_at": float, "attempts": int }
_otp_store: dict = {}

OTP_EXPIRY_SECONDS = 600  # 10 minutes
MAX_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30  # Cooldown between new email dispatches


def generate_otp() -> str:
    """Generate secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def create_and_send_otp(usn: str, email: str, student_name: str, force_resend: bool = False) -> dict:
    """
    Generate, cache, and email an OTP for the given student.
    If a valid OTP already exists and force_resend is False, reuse the active OTP
    without dispatching a duplicate email.
    """
    clean_usn = usn.strip().upper()
    clean_email = email.strip()
    now = time.time()

    entry = _otp_store.get(clean_usn)

    # If an active, unexpired OTP already exists for the same email and hasn't exceeded max attempts:
    if (
        entry
        and not force_resend
        and now < entry.get("expires_at", 0)
        and entry.get("attempts", 0) < MAX_ATTEMPTS
        and entry.get("email", "").lower() == clean_email.lower()
    ):
        remaining = int(entry["expires_at"] - now)
        return {
            "status": "ok",
            "already_sent": True,
            "message": f"Verification code already sent to {mask_email(clean_email)}. Check your inbox.",
            "masked_email": mask_email(clean_email),
            "expires_in": remaining,
        }

    # If force_resend was explicitly requested, enforce cooldown
    if entry and force_resend:
        time_since_last = now - entry.get("last_sent_at", 0)
        if time_since_last < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - time_since_last)
            raise ValueError(f"Please wait {wait}s before requesting a new code.")

    otp = generate_otp()

    _otp_store[clean_usn] = {
        "otp": otp,
        "email": clean_email,
        "name": student_name,
        "expires_at": now + OTP_EXPIRY_SECONDS,
        "last_sent_at": now,
        "attempts": 0,
    }

    send_otp_email(clean_email, student_name, otp)

    return {
        "status": "ok",
        "already_sent": False,
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

