"""
AIML Batchfolio — Email & OTP Delivery Service
Supports:
1. Brevo HTTPS REST API (Port 443) — Recommended for production on Render / Vercel.
2. SMTP (Gmail / Custom) — Works for local development.
3. Console Fallback — For offline development without credentials.
"""
import json
import logging
import re
import smtplib
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import (
    BREVO_API_KEY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
    SMTP_TLS,
)

logger = logging.getLogger("batchfolio.email")


def mask_email(email: str) -> str:
    """Mask email for privacy, e.g. preetham@example.com -> p***m@example.com"""
    if not email or "@" not in email:
        return email or ""
    local_part, domain = email.split("@", 1)
    if len(local_part) <= 2:
        masked_local = local_part[0] + "***"
    else:
        masked_local = local_part[0] + "***" + local_part[-1]
    return f"{masked_local}@{domain}"


def _parse_sender(raw_from: str, default_user: str):
    """Extract display name and email address from formatted sender string."""
    clean = (raw_from or default_user or "batchfolio@gmail.com").strip()
    match = re.search(r"^(.*?)\s*<([^>]+)>", clean)
    if match:
        name = match.group(1).strip().strip('"').strip("'") or "AIML Batchfolio"
        email = match.group(2).strip()
        return name, email
    return "AIML Batchfolio", clean


def _dispatch_brevo(api_key: str, sender_name: str, sender_email: str, recipient_email: str, recipient_name: str, subject: str, html_content: str, text_content: str):
    """
    Send email via Brevo's HTTPS REST API (Port 443).
    Unblocked across all cloud providers (Render, Vercel, AWS).
    """
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "Accept": "application/json",
        "api-key": api_key,
        "Content-Type": "application/json",
        "User-Agent": "AIML-Batchfolio/1.0",
    }
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": recipient_email, "name": recipient_name}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode("utf-8")
            logger.info("Email delivered via Brevo API: %s", res_body)
            return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="replace")
        logger.error("Brevo API HTTP %d error: %s", e.code, err_msg)
        raise RuntimeError(f"Brevo API error ({e.code}): {err_msg}")
    except Exception as e:
        logger.error("Brevo API request failed: %s", e)
        raise RuntimeError(f"Brevo network error: {str(e)}")


def _dispatch_smtp(host: str, port: int, user: str, password: str, from_header: str, envelope_sender: str, recipient: str, subject: str, html_content: str, text_content: str, use_tls: bool):
    """
    Send email via standard SMTP socket (Gmail / Mailgun / etc).
    Ideal for local development.
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = recipient

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=12)
    else:
        server = smtplib.SMTP(host, port, timeout=12)
        if use_tls:
            server.starttls()

    with server:
        server.login(user, password)
        server.sendmail(envelope_sender, [recipient], msg.as_string())


def send_otp_email(to_email: str, student_name: str, otp: str) -> dict:
    """
    Deliver 6-digit OTP to student's email address.
    Tries Brevo HTTPS API first (Render production), then SMTP (local dev), then console fallback.
    """
    subject = f"Your AIML Batchfolio Verification Code: {otp}"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 24px;
    }}
    .card {{
      max-width: 500px;
      margin: 0 auto;
      background-color: #111728;
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }}
    .logo {{
      font-size: 1.25rem;
      font-weight: 800;
      color: #818cf8;
      margin-bottom: 20px;
      letter-spacing: 0.05em;
    }}
    .title {{
      font-size: 1.35rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 12px;
    }}
    .desc {{
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 24px;
    }}
    .otp-box {{
      background: rgba(99, 102, 241, 0.12);
      border: 1px dashed rgba(99, 102, 241, 0.6);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }}
    .otp-code {{
      font-family: 'Courier New', Courier, monospace;
      font-size: 2.2rem;
      font-weight: 800;
      color: #67e8f9;
      letter-spacing: 0.3em;
      margin: 0;
    }}
    .footer {{
      margin-top: 28px;
      font-size: 0.8rem;
      color: #64748b;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ AIML BATCHFOLIO • 2024–2028</div>
    <h2 class="title">Profile Verification Code</h2>
    <p class="desc">Hello <strong>{student_name}</strong>,<br>You requested access to edit your AIML Batchfolio student profile. Use the verification code below to confirm your identity:</p>
    
    <div class="otp-box">
      <div class="otp-code">{otp}</div>
    </div>
    
    <p class="desc" style="font-size: 0.85rem;">This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
    
    <div class="footer">
      Department of AI & Machine Learning, MITE • ARTIFERA Student Forum
    </div>
  </div>
</body>
</html>"""

    text_content = (
        f"AIML Batchfolio Verification Code\n\n"
        f"Hello {student_name},\n\n"
        f"Your one-time verification code is: {otp}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this, please ignore this email.\n"
    )

    sender_name, sender_email = _parse_sender(SMTP_FROM, SMTP_USER)
    clean_recipient = to_email.strip()

    # 1. Primary for Production: Brevo HTTPS REST API (Port 443)
    if BREVO_API_KEY:
        try:
            _dispatch_brevo(
                api_key=BREVO_API_KEY,
                sender_name=sender_name,
                sender_email=sender_email,
                recipient_email=clean_recipient,
                recipient_name=student_name,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )
            logger.info("Sent verification email via Brevo to %s", mask_email(clean_recipient))
            return {"sent": True, "method": "brevo_api", "masked_email": mask_email(clean_recipient)}
        except Exception as e:
            logger.error("Failed to send email via Brevo API: %s", e)
            raise

    # 2. Local Development: Direct SMTP (Gmail / Custom)
    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            from_header = f"{sender_name} <{sender_email}>"
            _dispatch_smtp(
                host=SMTP_HOST,
                port=SMTP_PORT,
                user=SMTP_USER,
                password=SMTP_PASSWORD,
                from_header=from_header,
                envelope_sender=sender_email,
                recipient=clean_recipient,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                use_tls=SMTP_TLS,
            )
            logger.info("Sent verification email via SMTP to %s", mask_email(clean_recipient))
            return {"sent": True, "method": "smtp", "masked_email": mask_email(clean_recipient)}
        except Exception as e:
            logger.error("Failed to send email via SMTP: %s", e)
            raise RuntimeError(f"SMTP delivery failed: {str(e)}")

    # 3. Offline / Dev Fallback: Print OTP to console
    print(f"\n[OTP SERVICE] Verification OTP for {student_name} ({clean_recipient}): >>> {otp} <<<\n", flush=True)
    return {"sent": True, "method": "local_dev", "masked_email": mask_email(clean_recipient)}
