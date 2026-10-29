"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiService } from "./lib/api.js";

type LoginUser = {
  id: number;
  name: string;
  usn: string;
  email: string | null;
};

type LoginModalProps = {
  onLoginSuccess: (user: LoginUser) => void;
};

function isLoginUser(value: unknown): value is LoginUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.usn === "string" &&
    (typeof user.email === "string" || user.email === null)
  );
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [usn, setUsn] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const openModal = () => setIsOpen(true);
    window.addEventListener("batchfolio:open-login", openModal);
    return () => window.removeEventListener("batchfolio:open-login", openModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const [year, month, day] = dob.split("-");
    const password = `${day}${month}${year}`;

    try {
      const result = await ApiService.login({
        usn: usn.trim().toUpperCase(),
        password,
      });
      if (!isLoginUser(result.user)) {
        throw new Error("The server returned an invalid login response.");
      }
      onLoginSuccess(result.user);
      setIsOpen(false);
      setUsn("");
      setDob("");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`modal-backdrop${isOpen ? " active" : ""}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <div className="modal-dialog modal-auth">
        <button
          className="modal-close-btn"
          type="button"
          aria-label="Close login"
          onClick={() => setIsOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-header">
          <div className="auth-logo-badge">
            <img src="/assets/artifera_logo.jpeg" alt="" />
          </div>
          <h2 className="auth-title" id="login-modal-title">
            Student Login
          </h2>
          <p className="auth-subtitle">
            Sign in with your USN and date of birth.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-usn">USN</label>
            <div className="input-with-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                autoComplete="username"
                id="login-usn"
                name="usn"
                onChange={(event) => setUsn(event.target.value)}
                placeholder="e.g. 4MT24AI001"
                required
                type="text"
                value={usn}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-dob">Date of birth</label>
            <div className="input-with-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                autoComplete="current-password"
                id="login-dob"
                name="dob"
                onChange={(event) => setDob(event.target.value)}
                required
                type="date"
                value={dob}
              />
            </div>
            <p className="auth-subtitle">
              Your DOB is used as the password in DDMMYYYY format.
            </p>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            type="submit"
          >
            <span>{isSubmitting ? "Signing in..." : "Login to Batchfolio"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
