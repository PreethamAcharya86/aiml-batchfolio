"""
AIML Batchfolio — Direct Email Delivery Test Tool
Run this script to test if your SMTP settings can send real emails to your inbox:
    python test_email.py your_email@gmail.com
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import BREVO_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
from email_service import send_otp_email

if len(sys.argv) < 2:
    print("Usage: python test_email.py <recipient_email>")
    sys.exit(1)

recipient = sys.argv[1].strip()

print("=" * 60)
print("AIML BATCHFOLIO — EMAIL DISPATCH TEST")
print("=" * 60)
print(f"Brevo API Key: {'[CONFIGURED]' if BREVO_API_KEY else '[NOT SET]'}")
print(f"SMTP Host:     {SMTP_HOST or '[NOT SET]'}")
print(f"SMTP Port:     {SMTP_PORT}")
print(f"SMTP User:     {SMTP_USER or '[NOT SET]'}")
print(f"SMTP Password: {'********' if SMTP_PASSWORD else '[NOT SET]'}")
print(f"SMTP From:     {SMTP_FROM or '[NOT SET]'}")
print(f"Recipient:     {recipient}")
print("-" * 60)

if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
    print("\n[ERROR] SMTP credentials are not configured in backend/.env!")
    print("Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in backend/.env.")
    print("For Gmail:")
    print("  SMTP_HOST=smtp.gmail.com")
    print("  SMTP_PORT=587")
    print("  SMTP_USER=your_email@gmail.com")
    print("  SMTP_PASSWORD=your_16_char_app_password")
    print("  SMTP_FROM=your_email@gmail.com")
    sys.exit(1)

print("\nAttempting to send real test verification email...")
try:
    result = send_otp_email(recipient, "Test Student", "849201")
    print("\n[SUCCESS] Test email sent successfully!")
    print(f"Result: {result}")
    print(f"Check the inbox (and spam folder) of: {recipient}")
except Exception as e:
    print(f"\n[FAILED] Error sending email: {e}")

