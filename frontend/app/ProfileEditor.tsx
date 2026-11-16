"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ApiService, clearToken, getToken, isOtpVerified, setOtpVerified } from "./lib/api.js";

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

const POPULAR_SKILLS = [
  "Python",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "PyTorch",
  "TensorFlow",
  "Scikit-Learn",
  "Computer Vision",
  "Natural Language Processing (NLP)",
  "Large Language Models (LLMs)",
  "Generative AI",
  "Data Science",
  "Pandas",
  "NumPy",
  "OpenCV",
  "Keras",
  "MLOps",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Data Engineering",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "FastAPI",
  "Flask",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "C++",
  "Java",
  "AWS",
  "Google Cloud (GCP)",
  "Microsoft Azure",
  "Linux",
  "REST APIs",
  "Prompt Engineering",
  "Reinforcement Learning",
  "Neural Networks",
  "Hugging Face",
  "LangChain",
  "RAG",
  "Data Visualization",
  "Matplotlib",
  "Seaborn",
  "Tailwind CSS",
];

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

export default function ProfileEditor() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isOtpVerifiedState, setIsOtpVerifiedState] = useState<boolean>(false);

  useEffect(() => {
    setIsOtpVerifiedState(isOtpVerified());
  }, []);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const skillDropdownRef = useRef<HTMLDivElement | null>(null);
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
          setSkillsList(result.skills || []);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSkillDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── Skill Tag Management ───────────────────────────────────────────────────
  function addSkill(skillName: string) {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const exists = skillsList.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      setSkillsList((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
    setIsSkillDropdownOpen(false);
  }

  function removeSkill(skillToRemove: string) {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (skillInput.trim()) {
        addSkill(filteredSuggestions[0] || skillInput.trim());
      }
    } else if (event.key === "Backspace" && !skillInput && skillsList.length > 0) {
      removeSkill(skillsList[skillsList.length - 1]);
    }
  }

  const filteredSuggestions = POPULAR_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.trim().toLowerCase()) &&
      !skillsList.some((s) => s.toLowerCase() === skill.toLowerCase()),
  ).slice(0, 8);

  const isExactMatch = POPULAR_SKILLS.some(
    (s) => s.toLowerCase() === skillInput.trim().toLowerCase(),
  );

  // ── Avatar Upload Handlers ──────────────────────────────────────────────────
  // Opens the crop modal; actual upload happens after the user confirms the crop
  function handleAvatarFile(file: File) {
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
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setCropSrc(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Called by ImageCropModal with the cropped Blob
  async function handleCroppedBlob(blob: Blob) {
    if (!profile) return;
    setCropSrc(null);
    setError("");
    setNotice("");
    setIsUploadingAvatar(true);
    try {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      const res = await ApiService.uploadProfilePicture(profile.usn, file);
      const newUrl = res.url || res.student?.profile_picture_url;
      setProfilePictureUrl(newUrl);
      setProfile({ ...profile, profile_picture_url: newUrl });
      setNotice("Profile picture uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload profile picture.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function handleAvatarInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarFile(file);
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
      handleAvatarFile(file);
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

  // ── Form Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setError("");
    setNotice("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const emailVal = String(formData.get("email") ?? "").trim();
    if (!emailVal) {
      setError("Email address is required. Please provide a valid email.");
      setIsSaving(false);
      return;
    }
    const updates = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      dob: String(formData.get("dob") ?? "") || null,
      phone_no: String(formData.get("phone_no") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      skills: skillsList,
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
      setSkillsList(updatedProfile.skills || []);
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

  const renderMobileNavbar = () => (
    <header className="navbar profile-mobile-navbar" id="main-nav">
      <div className="nav-container">
        <Link href="/" className="brand-link" id="brand-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="brand-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/artifera_logo.jpeg" alt="Artifera Logo" className="nav-logo" id="nav-artifera-logo" />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              AIML <span className="highlight-text">Batchfolio</span>
            </span>
            <span className="brand-subtitle">Class of 2024–2028</span>
          </div>
        </Link>

        {/* Mobile Screen Navbar Toggle Button */}
        <button
          type="button"
          className={`mobile-nav-toggle ${isMobileMenuOpen ? "active" : ""}`}
          id="mobile-nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {profile && (
            <span className="mobile-toggle-user-badge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profilePictureUrl || profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=00638E&color=FFFFFF&size=200`}
                alt={profile.name}
                className="mobile-toggle-avatar"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=00638E&color=FFFFFF&size=200`;
                }}
              />
              <span className="mobile-toggle-mini-dot"></span>
            </span>
          )}
          <span className="mobile-toggle-icon">
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`} id="mobile-nav-drawer">
        {/* Profile Section */}
        <div className="mobile-profile-section">
          {profile && (
            <div className="mobile-user-card">
              <div className="mobile-user-header">
                <div className="mobile-user-avatar-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profilePictureUrl || profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=00638E&color=FFFFFF&size=200`}
                    alt={profile.name}
                    className="mobile-user-avatar"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=00638E&color=FFFFFF&size=200`;
                    }}
                  />
                  <span className="mobile-user-status-dot"></span>
                </div>
                <div className="mobile-user-info">
                  <h4 className="mobile-user-name">{profile.name}</h4>
                  <span className="mobile-user-usn">{profile.usn}</span>
                  {profile.email && (
                    <span className="mobile-user-email">{profile.email}</span>
                  )}
                </div>
              </div>
              <div className="mobile-user-actions">
                <Link
                  href="/"
                  className="btn btn-primary mobile-edit-profile-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Students</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-outline mobile-logout-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mobile-nav-links">
          <Link
            href="/"
            className="mobile-nav-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home (Students)</span>
          </Link>
          <Link
            href="/resumes"
            className="mobile-nav-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Resume Portfolios</span>
          </Link>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );

  if (isLoading) {
    return (
      <main className="profile-page profile-loading-viewport">
        <div className="profile-loader-card">
          <div className="loader-portal">
            <div className="portal-ring ring-outer"></div>
            <div className="portal-ring ring-inner"></div>
            <div className="portal-core">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div className="loader-text-box">
            <div className="loader-title">Loading Profile</div>
            <div className="loader-progress-track">
              <div className="loader-progress-bar"></div>
            </div>
          </div>
        </div>
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

  if (profile.email && !isOtpVerifiedState) {
    return (
      <>
        {renderMobileNavbar()}
        <main className="profile-page">
          <section className="profile-panel" style={{ maxWidth: "500px", margin: "2rem auto" }}>
            <ProfileInlineOtp
              studentName={profile.name}
              onVerified={() => setIsOtpVerifiedState(true)}
            />
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      {renderMobileNavbar()}
      <main className="profile-page">
      <section className="profile-panel">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">AIML Batchfolio</p>
            <h1 className="profile-title">Edit your profile</h1>
            <p className="profile-message">
              Update your student details, photo, skills, and portfolio links.
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

        {!profile.email && (
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(234, 179, 8, 0.4)",
              borderRadius: "12px",
              color: "#facc15",
              margin: "1.5rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>Email Address Required</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#fef08a" }}>
                You must enter and save your valid email address below to enable OTP verification for your account.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TOP CENTER: PROFILE PICTURE WITH HOVER EDIT
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

          {/* Circular avatar with hover crop/upload overlay */}
          <button
            className="profile-avatar-edit-btn"
            disabled={isUploadingAvatar}
            onClick={() => {
              if (profilePictureUrl) {
                setCropSrc(profilePictureUrl);
              } else {
                avatarInputRef.current?.click();
              }
            }}
            title={profilePictureUrl ? "Click to crop current photo" : "Upload profile photo"}
            type="button"
            aria-label={profilePictureUrl ? "Crop profile photo" : "Upload profile photo"}
          >
            {/* Photo or silhouette */}
            {profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={profile.name}
                className="profile-avatar-circle-img"
                src={profilePictureUrl}
              />
            ) : (
              <div className="profile-avatar-circle-default">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}

            {/* Upload spinner */}
            {isUploadingAvatar ? (
              <div className="profile-avatar-circle-overlay">
                <div className="modern-cyber-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-core"></div>
                </div>
                <span className="spinner-text">Uploading...</span>
              </div>
            ) : profilePictureUrl ? (
              /* Hover crop overlay for existing photo */
              <div className="profile-avatar-circle-overlay profile-avatar-edit-overlay">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="22" height="22">
                  <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                  <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                </svg>
                <span>Crop Photo</span>
              </div>
            ) : (
              /* Hover upload overlay when no photo */
              <div className="profile-avatar-circle-overlay profile-avatar-edit-overlay">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="22" height="22">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <span>Upload Photo</span>
              </div>
            )}
          </button>

          {/* Action buttons: Change Photo & Remove Photo */}
          <div className="profile-avatar-actions" style={{ marginTop: "0.85rem", display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="avatar-action-btn"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              type="button"
            >
              <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              {isUploadingAvatar
                ? "Uploading..."
                : profilePictureUrl
                ? "Change Photo"
                : "Upload Photo"}
            </button>

            {profilePictureUrl && !isUploadingAvatar && (
              <button
                className="avatar-action-btn btn-remove"
                disabled={isUploadingAvatar}
                onClick={handleRemoveAvatar}
                type="button"
              >
                <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Remove Photo
              </button>
            )}
          </div>
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
              <label htmlFor="profile-email">
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="profile-input"
                defaultValue={asInputValue(profile.email)}
                id="profile-email"
                name="email"
                type="email"
                required
                placeholder="e.g. yourname@gmail.com"
              />
              {!profile.email ? (
                <p className="profile-hint" style={{ color: "#facc15" }}>
                  ⚠️ Email is required to enable secure login verification for your account.
                </p>
              ) : (
                <p className="profile-hint">
                  Your registered email used for OTP security verification.
                </p>
              )}
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

            {/* ═════════════════════════════════════════════════════════════════
                BIO TEXTBOX (Positioned above Skills section)
                ═════════════════════════════════════════════════════════════════ */}
            <div className="form-group profile-bio-field">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                className="profile-textarea"
                defaultValue={asInputValue(profile.bio)}
                id="profile-bio"
                name="bio"
                placeholder="Share a short summary about yourself..."
                rows={4}
              />
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                SKILLS: LINKEDIN-STYLE AUTOSUGGEST & PILL BOXES
                ═════════════════════════════════════════════════════════════════ */}
            <div className="form-group skills-full-row">
              <label htmlFor="skills-search-input">Skills</label>

              {/* Added Skill Pill Boxes */}
              <div className="skills-tags-container">
                {skillsList.length === 0 ? (
                  <span className="skill-empty-hint">
                    No skills added yet. Search or type below to add skills.
                  </span>
                ) : (
                  skillsList.map((skill) => (
                    <div className="skill-pill-box" key={skill}>
                      <span>{skill}</span>
                      <button
                        aria-label={`Remove ${skill}`}
                        className="skill-pill-remove"
                        onClick={() => removeSkill(skill)}
                        title="Remove skill"
                        type="button"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* LinkedIn-style Search Input & Popup Dropdown */}
              <div className="skills-input-wrapper" ref={skillDropdownRef}>
                <input
                  autoComplete="off"
                  className="profile-input"
                  id="skills-search-input"
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setIsSkillDropdownOpen(true);
                  }}
                  onFocus={() => setIsSkillDropdownOpen(true)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill (e.g. Python, PyTorch, React, SQL)..."
                  value={skillInput}
                />

                {isSkillDropdownOpen && (
                  <div className="skills-dropdown-popup">
                    {filteredSuggestions.map((suggestion) => (
                      <div
                        className="skills-dropdown-item"
                        key={suggestion}
                        onClick={() => addSkill(suggestion)}
                      >
                        <span>{suggestion}</span>
                        <span className="skills-item-plus">+</span>
                      </div>
                    ))}

                    {skillInput.trim() &&
                      !isExactMatch &&
                      !skillsList.some(
                        (s) =>
                          s.toLowerCase() === skillInput.trim().toLowerCase(),
                      ) && (
                        <div
                          className="skills-dropdown-item add-custom"
                          onClick={() => addSkill(skillInput.trim())}
                        >
                          <span>Add &quot;{skillInput.trim()}&quot;</span>
                          <span className="skills-item-plus">+</span>
                        </div>
                      )}

                    {!skillInput.trim() && filteredSuggestions.length === 0 && (
                      <div
                        className="skills-dropdown-item"
                        style={{ color: "var(--text-dim)", cursor: "default" }}
                      >
                        Type keyword to search or add custom skills
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="profile-hint">
                Select from suggestions or press Enter to add any custom skill.
                Click &times; to delete.
              </p>
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
            </div>
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

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center", marginTop: "1.5rem" }}>
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      {/* Image Crop Modal */}
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={(blob) => { void handleCroppedBlob(blob); }}
        />
      )}
    </main>
  </>
  );
}


/* ── Image Crop Modal (canvas-based, no external deps) ─────────────────────── */
function ImageCropModal({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Crop state: offset (px) and scale relative to the 300px canvas
  const CANVAS_SIZE = 300;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load image and auto-fit (handles both data URL and remote HTTP URLs safely)
  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function initImage() {
      let finalSrc = src;
      if (src.startsWith("http://") || src.startsWith("https://")) {
        try {
          const res = await fetch(src);
          if (res.ok) {
            const blob = await res.blob();
            objectUrl = URL.createObjectURL(blob);
            finalSrc = objectUrl;
          }
        } catch {
          // Fall back to direct src if fetch fails
          finalSrc = src;
        }
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!active) return;
        imgRef.current = img;
        const fit = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight);
        setScale(fit);
        setOffset({
          x: (CANVAS_SIZE - img.naturalWidth * fit) / 2,
          y: (CANVAS_SIZE - img.naturalHeight * fit) / 2,
        });
      };
      img.src = finalSrc;
    }

    void initImage();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  // Draw on every state change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    ctx.drawImage(
      img,
      offset.x,
      offset.y,
      img.naturalWidth * scale,
      img.naturalHeight * scale,
    );

    // Dark overlay ONLY outside the circle (even-odd fill rule — leaves circle clear)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);           // outer rectangle
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2, true); // CCW = hole
    ctx.fill("evenodd");
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = "rgba(99,102,241,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [offset, scale]);

  // Mouse drag
  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  function onMouseUp() { dragging.current = false; }

  // Touch drag
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    dragging.current = true;
    lastPos.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - lastPos.current.x;
    const dy = t.clientY - lastPos.current.y;
    lastPos.current = { x: t.clientX, y: t.clientY };
    setOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  function onTouchEnd() { dragging.current = false; }

  // Zoom via slider
  function onZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
  }

  // Export cropped circle as JPEG blob
  function handleConfirm() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const out = document.createElement("canvas");
    out.width = CANVAS_SIZE;
    out.height = CANVAS_SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);

    out.toBlob(
      (blob) => { if (blob) onConfirm(blob); },
      "image/jpeg",
      0.92,
    );
  }

  const minScale = imgRef.current
    ? Math.max(CANVAS_SIZE / imgRef.current.naturalWidth, CANVAS_SIZE / imgRef.current.naturalHeight) * 0.8
    : 0.5;

  return (
    <div className="crop-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="crop-modal-dialog">
        <div className="crop-modal-header">
          <span>Crop Profile Photo</span>
          <button className="crop-modal-close" onClick={onCancel} type="button" aria-label="Cancel crop">✕</button>
        </div>

        <p className="crop-modal-hint">Drag to reposition · Zoom slider to fit</p>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="crop-canvas"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: "grab", userSelect: "none" }}
        />

        <div className="crop-zoom-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <input
            className="crop-zoom-slider"
            type="range"
            min={minScale}
            max={minScale * 4}
            step={0.01}
            value={scale}
            onChange={onZoomChange}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <div className="crop-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} type="button">
            ✓ Crop &amp; Upload
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── In-page OTP Verification Card (Used when accessing /profile directly) ── */
function ProfileInlineOtp({
  studentName,
  onVerified,
}: {
  studentName: string;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const sendOtpCode = async (isResend: boolean = false) => {
    setIsSending(true);
    setError("");
    try {
      const res = await ApiService.sendOtp(isResend);
      setMaskedEmail(res.masked_email || "your registered email");
      if (res.already_sent) {
        setNotice(`Verification code was already sent to ${res.masked_email || "your email"}. Check your inbox or enter it below.`);
      } else {
        setNotice(`Verification code sent to ${res.masked_email || "your email"}`);
        setCooldown(30);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    void sendOtpCode(false);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (e: FormEvent) => {
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
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <div className="auth-header" style={{ marginBottom: "1.75rem" }}>
        <div className="auth-logo-badge" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" width="28" height="28">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="auth-title" style={{ fontSize: "1.45rem" }}>
          Verify Your Identity
        </h2>
        <p className="auth-subtitle" style={{ fontSize: "0.88rem", marginTop: "0.35rem" }}>
          Hello <strong>{studentName}</strong>, enter the 6-digit code sent to{" "}
          <strong style={{ color: "#67e8f9" }}>{maskedEmail || "your email"}</strong> to unlock profile editing.
        </p>
      </div>

      {notice && !error && (
        <div style={{ padding: "0.6rem 0.85rem", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", color: "#34d399", fontSize: "0.82rem", marginBottom: "1.25rem", textAlign: "center" }}>
          {notice}
        </div>
      )}

      <form onSubmit={handleVerify} className="auth-form">
        <div className="form-group">
          <label htmlFor="inline-otp-input" style={{ textAlign: "center", display: "block" }}>
            One-Time Password (OTP)
          </label>
          <input
            id="inline-otp-input"
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
            {isVerifying ? "Verifying..." : "Verify & Unlock Profile"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void sendOtpCode(true)}
            disabled={isSending || cooldown > 0}
            style={{ width: "100%", padding: "0.55rem", justifyContent: "center", fontSize: "0.82rem", border: "1px solid rgba(255, 255, 255, 0.12)", color: "var(--text-muted)" }}
          >
            {isSending ? "Sending code..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <Link
            className="btn btn-secondary"
            href="/"
            style={{ width: "100%", padding: "0.55rem", justifyContent: "center", fontSize: "0.82rem", textAlign: "center" }}
          >
            Cancel &amp; Return to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
