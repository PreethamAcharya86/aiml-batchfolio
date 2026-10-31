"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ApiService, clearToken, getToken } from "./lib/api.js";

type StudentProfile = {
  id: number;
  name: string;
  dob: string | null;
  usn: string;
  phone_no: string | null;
  dept: string;
  bio: string | null;
  skills: string[];
  email: string | null;
  profile_picture_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  portfolio_website_url: string | null;
  resume_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function isStudentProfile(value: unknown): value is StudentProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "number" &&
    typeof profile.name === "string" &&
    typeof profile.usn === "string" &&
    typeof profile.dept === "string" &&
    Array.isArray(profile.skills)
  );
}

function asInputValue(value: string | null) {
  return value ?? "";
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not available";
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? value : timestamp.toLocaleString();
}

export default function ProfileEditor() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showResumeUrlInput, setShowResumeUrlInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      setError("Log in with your USN and date of birth to view your profile.");
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    ApiService.getMyProfile()
      .then((result: unknown) => {
        if (!isStudentProfile(result)) {
          throw new Error("The server returned an invalid student profile.");
        }
        if (active) {
          setProfile(result);
          setSkills(result.skills.join(", "));
          setProfilePictureUrl(result.profile_picture_url);
          setResumeUrl(result.resume_url);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your profile.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // ── Avatar Upload Handlers ──────────────────────────────────────────────────
  async function handleAvatarFile(file: File) {
    if (!profile) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5MB.");
      return;
    }

    setError("");
    setNotice("");
    setIsUploadingAvatar(true);

    try {
      const res = await ApiService.uploadProfilePicture(profile.usn, file);
      const newUrl = res.url || res.student?.profile_picture_url;
      setProfilePictureUrl(newUrl);
      if (profile) {
        setProfile({ ...profile, profile_picture_url: newUrl });
      }
      setNotice("Profile picture uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload profile picture.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function handleAvatarInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleAvatarFile(file);
    }
    event.target.value = "";
  }

  function handleAvatarDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAvatar(true);
  }

  function handleAvatarDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAvatar(false);
  }

  function handleAvatarDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAvatar(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleAvatarFile(file);
    }
  }

  async function handleRemoveAvatar() {
    if (!profile) return;
    setError("");
    setNotice("");
    setIsUploadingAvatar(true);

    try {
      await ApiService.removeProfilePicture(profile.usn);
      setProfilePictureUrl(null);
      setProfile({ ...profile, profile_picture_url: null });
      setNotice("Profile picture removed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove profile picture.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  // ── Resume Upload Handlers ──────────────────────────────────────────────────
  async function handleResumeFile(file: File) {
    if (!profile) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF document for your resume.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file must be less than 10MB.");
      return;
    }

    setError("");
    setNotice("");
    setIsUploadingResume(true);

    try {
      const res = await ApiService.uploadResume(profile.usn, file);
      const newUrl = res.url || res.student?.resume_url;
      setResumeUrl(newUrl);
      if (profile) {
        setProfile({ ...profile, resume_url: newUrl });
      }
      setNotice("Resume PDF uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload resume.",
      );
    } finally {
      setIsUploadingResume(false);
    }
  }

  function handleResumeInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleResumeFile(file);
    }
    event.target.value = "";
  }

  function handleResumeDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingResume(true);
  }

  function handleResumeDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingResume(false);
  }

  function handleResumeDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingResume(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleResumeFile(file);
    }
  }

  async function handleRemoveResume() {
    if (!profile) return;
    setError("");
    setNotice("");
    setIsUploadingResume(true);

    try {
      await ApiService.removeResume(profile.usn);
      setResumeUrl(null);
      setProfile({ ...profile, resume_url: null });
      setNotice("Resume removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove resume.",
      );
    } finally {
      setIsUploadingResume(false);
    }
  }

  // ── Delete Profile Handler (Preserves Login) ────────────────────────────────
  async function handleDeleteProfileConfirm() {
    if (!profile) return;
    setError("");
    setNotice("");
    setIsDeletingProfile(true);

    try {
      const res = await ApiService.deleteProfile(profile.usn);
      const updated = res.student;
      setProfile(updated);
      setSkills("");
      setProfilePictureUrl(null);
      setResumeUrl(null);
      setShowDeleteModal(false);
      setNotice(
        "Your profile details have been deleted. Your student login account remains active.",
      );

      // Reset form input values
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete profile.",
      );
    } finally {
      setIsDeletingProfile(false);
    }
  }

  // ── Form Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setError("");
    setNotice("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const updates = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      dob: String(formData.get("dob") ?? "") || null,
      phone_no: String(formData.get("phone_no") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      profile_picture_url: profilePictureUrl,
      github_url: String(formData.get("github_url") ?? "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      portfolio_website_url:
        String(formData.get("portfolio_website_url") ?? "").trim() || null,
      resume_url: resumeUrl,
    };

    try {
      await ApiService.updateProfile(profile.usn, updates);
      const updatedProfile: unknown = await ApiService.getMyProfile();
      if (!isStudentProfile(updatedProfile)) {
        throw new Error(
          "Profile saved, but the refreshed profile response was invalid.",
        );
      }
      setProfile(updatedProfile);
      setSkills(updatedProfile.skills.join(", "));
      setProfilePictureUrl(updatedProfile.profile_picture_url);
      setResumeUrl(updatedProfile.resume_url);
      setNotice("Your profile has been saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function logout() {
    clearToken();
    router.push("/");
  }

  if (isLoading) {
    return (
      <main className="profile-page">
        <p className="profile-message">Loading your profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page">
        <section className="profile-panel">
          <h1 className="profile-title">Student Profile</h1>
          <p className="profile-message" role="alert">
            {error}
          </p>
          <Link className="btn btn-primary" href="/">
            Return to Batchfolio
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">AIML Batchfolio</p>
            <h1 className="profile-title">Edit your profile</h1>
            <p className="profile-message">
              Update your student details, photo, and portfolio links.
            </p>
          </div>
          <div className="profile-actions">
            <Link className="btn btn-secondary" href="/">
              Back to students
            </Link>
            <button className="btn btn-secondary" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>

        <div className="profile-identity">
          <span>
            <strong>Student ID:</strong> {profile.id}
          </span>
          <span>
            <strong>USN:</strong> {profile.usn}
          </span>
          <span>
            <strong>Department:</strong> {profile.dept}
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TOP CENTER: PROFILE PICTURE DRAG & DROP / UPLOAD
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="profile-avatar-center-section">
          {/* Hidden file input */}
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            aria-label="Upload profile photo"
            onChange={handleAvatarInputChange}
            ref={avatarInputRef}
            style={{ display: "none" }}
            type="file"
          />

          <div
            aria-label="Upload or drop profile picture"
            className={`profile-avatar-dropzone ${isDraggingAvatar ? "dragging" : ""}`}
            onClick={() => avatarInputRef.current?.click()}
            onDragEnter={handleAvatarDragOver}
            onDragLeave={handleAvatarDragLeave}
            onDragOver={handleAvatarDragOver}
            onDrop={handleAvatarDrop}
            role="button"
            tabIndex={0}
            title="Click or drop an image to upload"
          >
            <div className="profile-avatar-img-wrap">
              {profilePictureUrl ? (
                <img
                  alt={profile.name}
                  className="profile-editor-avatar-img"
                  src={profilePictureUrl}
                />
              ) : (
                /* Default silhouette taking reference from home screen avatar div */
                <div className="profile-avatar-default">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}

              {/* Hover / Drag Overlay Hint */}
              <div className="profile-avatar-overlay-hint">
                <svg
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>{isUploadingAvatar ? "Uploading..." : "Change"}</span>
              </div>
            </div>

            {/* If no profile picture, show prominent "+" symbol */}
            {!profilePictureUrl && (
              <div className="profile-avatar-plus-badge" title="Add profile picture">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <line x1="12" x2="12" y1="5" y2="19"></line>
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                </svg>
              </div>
            )}
          </div>

          <div className="profile-avatar-actions">
            <button
              className="avatar-action-btn"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              type="button"
            >
              <svg
                fill="none"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="15"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg>
              {isUploadingAvatar
                ? "Uploading..."
                : profilePictureUrl
                ? "Change Photo"
                : "Upload Photo"}
            </button>

            {profilePictureUrl && (
              <button
                className="avatar-action-btn btn-remove"
                disabled={isUploadingAvatar}
                onClick={handleRemoveAvatar}
                type="button"
              >
                <svg
                  fill="none"
                  height="15"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="15"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove Photo
              </button>
            )}
          </div>

          <p className="profile-hint">
            Drag & drop an image or click to browse (JPEG, PNG, WebP up to 5MB)
          </p>

          <button
            className="url-toggle-btn"
            onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
            type="button"
          >
            {showAvatarUrlInput ? "Hide image URL field" : "Or enter photo URL directly"}
          </button>

          {showAvatarUrlInput && (
            <div style={{ maxWidth: 420, width: "100%", marginTop: "0.5rem" }}>
              <input
                className="profile-input"
                onChange={(e) => setProfilePictureUrl(e.target.value || null)}
                placeholder="https://example.com/avatar.jpg"
                type="url"
                value={profilePictureUrl || ""}
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            MAIN PROFILE FORM
            ═══════════════════════════════════════════════════════════════════════ */}
        <form className="profile-form" onSubmit={handleSubmit} ref={formRef}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="profile-name">Full name</label>
              <input
                className="profile-input"
                defaultValue={profile.name}
                id="profile-name"
                name="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-usn">USN</label>
              <input
                className="profile-input"
                id="profile-usn"
                readOnly
                value={profile.usn}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-dob">Date of birth</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.dob)}
                id="profile-dob"
                name="dob"
                required
                type="date"
              />
              <p className="profile-hint">
                Your date of birth is also your login password.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="profile-phone">Mobile number</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.phone_no)}
                id="profile-phone"
                name="phone_no"
                type="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.email)}
                id="profile-email"
                name="email"
                type="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-skills">Skills</label>
              <input
                className="profile-input"
                id="profile-skills"
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Python, Machine Learning, TensorFlow"
                value={skills}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-github">GitHub URL</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.github_url)}
                id="profile-github"
                name="github_url"
                type="url"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-linkedin">LinkedIn URL</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.linkedin_url)}
                id="profile-linkedin"
                name="linkedin_url"
                type="url"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-instagram">Instagram URL</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.instagram_url)}
                id="profile-instagram"
                name="instagram_url"
                type="url"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-portfolio">Portfolio website URL</label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.portfolio_website_url)}
                id="profile-portfolio"
                name="portfolio_website_url"
                type="url"
              />
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                RESUME UPLOAD: DRAG & DROP OR SYSTEM UPLOAD
                ═════════════════════════════════════════════════════════════════ */}
            <div className="form-group resume-field-container">
              <label>Resume (PDF)</label>
              <input
                accept="application/pdf"
                aria-label="Upload resume PDF"
                onChange={handleResumeInputChange}
                ref={resumeInputRef}
                style={{ display: "none" }}
                type="file"
              />

              <div
                className={`resume-dropzone ${isDraggingResume ? "dragging" : ""}`}
                onClick={() => resumeInputRef.current?.click()}
                onDragEnter={handleResumeDragOver}
                onDragLeave={handleResumeDragLeave}
                onDragOver={handleResumeDragOver}
                onDrop={handleResumeDrop}
                role="button"
                tabIndex={0}
              >
                <div className="resume-icon-circle">
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" x2="8" y1="13" y2="13"></line>
                    <line x1="16" x2="8" y1="17" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {isUploadingResume
                      ? "Uploading resume..."
                      : "Drag & drop your resume PDF, or click to upload from system"}
                  </p>
                  <p className="profile-hint">Supported format: PDF up to 10MB</p>
                </div>
              </div>

              {/* Current Resume Banner */}
              {resumeUrl && (
                <div className="resume-current-card">
                  <div className="resume-current-info">
                    <svg
                      fill="none"
                      height="20"
                      stroke="#10b981"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                        Resume Attached
                      </p>
                      <a
                        href={resumeUrl}
                        rel="noreferrer"
                        style={{
                          color: "var(--secondary)",
                          fontSize: "0.8rem",
                          textDecoration: "underline",
                        }}
                        target="_blank"
                      >
                        Preview / Download current resume
                      </a>
                    </div>
                  </div>
                  <div className="resume-current-actions">
                    <button
                      className="avatar-action-btn"
                      onClick={() => resumeInputRef.current?.click()}
                      type="button"
                    >
                      Replace
                    </button>
                    <button
                      className="avatar-action-btn btn-remove"
                      onClick={handleRemoveResume}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <button
                className="url-toggle-btn"
                onClick={() => setShowResumeUrlInput(!showResumeUrlInput)}
                type="button"
              >
                {showResumeUrlInput ? "Hide resume URL field" : "Or enter resume URL directly"}
              </button>

              {showResumeUrlInput && (
                <div style={{ marginTop: "0.5rem" }}>
                  <input
                    className="profile-input"
                    onChange={(e) => setResumeUrl(e.target.value || null)}
                    placeholder="https://example.com/resume.pdf"
                    type="url"
                    value={resumeUrl || ""}
                  />
                </div>
              )}
            </div>

            <div className="form-group profile-bio-field">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                className="profile-textarea"
                defaultValue={asInputValue(profile.bio)}
                id="profile-bio"
                name="bio"
                rows={5}
              />
            </div>
          </div>

          <div className="profile-record-meta">
            <span>
              <strong>Created:</strong> {formatTimestamp(profile.created_at)}
            </span>
            <span>
              <strong>Last updated:</strong> {formatTimestamp(profile.updated_at)}
            </span>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="profile-success" role="status">
              {notice}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>

        {/* ═══════════════════════════════════════════════════════════════════════
            DANGER ZONE: DELETE PROFILE (PRESERVES LOGIN ACCOUNT)
            ═══════════════════════════════════════════════════════════════════════ */}
        <section className="profile-danger-zone">
          <div className="danger-zone-content">
            <h3>Delete Profile Details</h3>
            <p>
              Clears your public profile details, bio, skills, profile picture,
              resume, and links from the Batchfolio directory.
              <br />
              <strong>Note:</strong> Your student login credentials (USN &amp;
              Date of Birth) are preserved, allowing you to log back in anytime.
            </p>
          </div>
          <button
            className="btn-danger"
            disabled={isDeletingProfile}
            onClick={() => setShowDeleteModal(true)}
            type="button"
          >
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
            Delete Profile
          </button>
        </section>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="confirm-modal-backdrop" role="dialog">
            <div className="confirm-modal-box">
              <h3>
                <svg
                  fill="none"
                  height="22"
                  stroke="#ef4444"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="22"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" x2="12" y1="9" y2="13"></line>
                  <line x1="12" x2="12.01" y1="17" y2="17"></line>
                </svg>
                Delete Profile Details?
              </h3>
              <p>
                Are you sure you want to delete your profile details? This will
                clear your photo, resume, bio, skills, and portfolio links from
                the batch directory.
                <br />
                <br />
                <strong>Your login is safe:</strong> Your student account (USN &amp;
                Date of Birth) will NOT be deleted permanently. You can log back
                in anytime to re-enter your details.
              </p>
              <div className="confirm-modal-actions">
                <button
                  className="btn btn-secondary"
                  disabled={isDeletingProfile}
                  onClick={() => setShowDeleteModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  disabled={isDeletingProfile}
                  onClick={handleDeleteProfileConfirm}
                  type="button"
                >
                  {isDeletingProfile ? "Deleting..." : "Yes, Delete Profile"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
