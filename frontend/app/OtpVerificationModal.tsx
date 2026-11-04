"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiService, setOtpVerified } from "./lib/api.js";

type OtpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function OtpVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Send OTP automatically when modal opens
  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setError("");
      setNotice("");
      setDevOtp(null);
      return;
    }

    sendCode();
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function sendCode() {
    setIsSending(true);
    setError("");
    setNotice("");

    try {
      const result = await ApiService.sendOtp();
      setMaskedEmail(result.masked_email || "your registered email");
      setNotice(`Verification code sent to ${result.masked_email || "your email"}`);
      if (result.dev_otp) {
        setDevOtp(result.dev_otp);
      }
      setResendCooldown(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      await ApiService.verifyOtp(otp.trim());
      setOtpVerified(true);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setIsVerifying(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active"
      style={{ zIndex: 3500 }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-auth"
        style={{ maxWidth: "460px", padding: "2.25rem 2rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Close verification dialog"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-header" style={{ marginBottom: "1.75rem" }}>
          <div className="auth-logo-badge" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" width="28" height="28">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="auth-title" style={{ fontSize: "1.5rem" }}>
            Security Verification
          </h2>
          <p className="auth-subtitle" style={{ fontSize: "0.88rem", marginTop: "0.35rem" }}>
            Enter the 6-digit code sent to{" "}
            <strong style={{ color: "#67e8f9" }}>{maskedEmail || "your email"}</strong> to access profile editing.
          </p>
        </div>

        {notice && !error && (
          <div
            style={{
              padding: "0.6rem 0.85rem",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              color: "#34d399",
              fontSize: "0.82rem",
              marginBottom: "1.25rem",
              textAlign: "center",
            }}
          >
            {notice}
          </div>
        )}

        {devOtp && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "rgba(234, 179, 8, 0.12)",
              border: "1px dashed rgba(234, 179, 8, 0.4)",
              borderRadius: "8px",
              color: "#facc15",
              fontSize: "0.8rem",
              marginBottom: "1.25rem",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          >
            Local test code: <strong>{devOtp}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp-input" style={{ textAlign: "center", display: "block" }}>
              One-Time Password (OTP)
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              style={{
                fontFamily: "monospace",
                fontSize: "1.8rem",
                letterSpacing: "0.45em",
                textAlign: "center",
                padding: "0.75rem 0.5rem",
                borderRadius: "10px",
                border: "1px solid rgba(99, 102, 241, 0.45)",
                background: "rgba(10, 14, 26, 0.85)",
                color: "#67e8f9",
                width: "100%",
              }}
              autoFocus
            />
          </div>

          {error && (
            <p className="login-error" role="alert" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isVerifying || otp.length < 6}
              style={{ width: "100%", padding: "0.75rem", justifyContent: "center" }}
            >
              {isVerifying ? "Verifying..." : "Verify & Edit Profile"}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={sendCode}
              disabled={isSending || resendCooldown > 0}
              style={{
                width: "100%",
                padding: "0.55rem",
                justifyContent: "center",
                fontSize: "0.82rem",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--text-muted)",
              }}
            >
              {isSending
                ? "Sending code..."
                : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

