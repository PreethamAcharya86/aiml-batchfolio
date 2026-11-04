"""
AIML Batchfolio — Email & OTP Delivery Service
Sends branded OTP emails via SMTP or logs them in development mode.
"""
import logging
import smtplib
import socket
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
    SMTP_TLS,
    IS_PRODUCTION,
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


def _dispatch_smtp(host: str, port: int, user: str, password: str, envelope_sender: str, recipient: str, message_str: str, use_tls: bool):
    """
    Dispatch message via SMTP, forcing IPv4 to prevent '[Errno 101] Network is unreachable'
    on cloud environments like Render that lack IPv6 outbound routing.
    """
    orig_getaddrinfo = socket.getaddrinfo

    def ipv4_getaddrinfo(h, p, family=0, type=0, proto=0, flags=0):
        return orig_getaddrinfo(h, p, socket.AF_INET, type, proto, flags)

    socket.getaddrinfo = ipv4_getaddrinfo
    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=15)
        else:
            server = smtplib.SMTP(host, port, timeout=15)
            if use_tls:
                server.starttls()

        with server:
            server.login(user, password)
            server.sendmail(envelope_sender, [recipient], message_str)
    finally:
        socket.getaddrinfo = orig_getaddrinfo


def send_otp_email(to_email: str, student_name: str, otp: str) -> dict:
    """
    Deliver 6-digit OTP to student's email address.
    If SMTP is not configured, logs to stdout and allows seamless local testing.
    """
    subject = f"Your AIML Batchfolio Verification Code: {otp}"

    html_content = f"""
    <!DOCTYPE html>
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
    </html>
    """

    text_content = (
        f"AIML Batchfolio Verification Code\n\n"
        f"Hello {student_name},\n\n"
        f"Your one-time verification code is: {otp}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this, please ignore this email.\n"
    )

    clean_host = SMTP_HOST.strip().strip('"').strip("'")
    clean_user = SMTP_USER.strip().strip('"').strip("'")
    clean_password = SMTP_PASSWORD.strip().strip('"').strip("'")
    clean_from_raw = SMTP_FROM.strip().strip('"').strip("'") if SMTP_FROM else clean_user
    clean_port = int(SMTP_PORT) if str(SMTP_PORT).isdigit() else 587

    # If SMTP is configured, attempt actual network delivery
    if clean_host and clean_user and clean_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = clean_from_raw or clean_user
            msg["To"] = to_email.strip()

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            # Pure email address for the RFC-5321 envelope sender
            envelope_match = re.search(r"<([^>]+)>", clean_from_raw)
            envelope_sender = envelope_match.group(1).strip() if envelope_match else clean_user

            try:
                _dispatch_smtp(clean_host, clean_port, clean_user, clean_password, envelope_sender, to_email.strip(), msg.as_string(), SMTP_TLS)
            except Exception as primary_err:
                # If port 587 fails with network issue, try SSL on port 465 as backup
                if clean_port == 587 and ("unreachable" in str(primary_err).lower() or "timeout" in str(primary_err).lower()):
                    logger.warning("Port 587 failed, attempting backup SSL port 465...")
                    _dispatch_smtp(clean_host, 465, clean_user, clean_password, envelope_sender, to_email.strip(), msg.as_string(), False)
                else:
                    raise primary_err

            logger.info("Sent verification email to %s", mask_email(to_email))
            return {"sent": True, "method": "smtp", "masked_email": mask_email(to_email)}
        except Exception as e:
            logger.error("Failed to send email via SMTP: %s", e)
            raise RuntimeError(f"SMTP email delivery failed: {str(e)}")

    # Fallback / Dev mode: print to console for instant developer verification
    print(f"\n[OTP SERVICE] Verification OTP for {student_name} ({to_email}): >>> {otp} <<<\n", flush=True)
    return {"sent": True, "method": "local_dev", "masked_email": mask_email(to_email)}
