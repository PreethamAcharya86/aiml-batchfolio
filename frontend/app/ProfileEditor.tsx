"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
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

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
            onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
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

              {/* Centered Modern Animated Loading Overlay or Hover Hint */}
              {isUploadingAvatar ? (
                <div className="profile-avatar-loading-overlay">
                  <div className="modern-cyber-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-core"></div>
                  </div>
                  <span className="spinner-text">Uploading...</span>
                </div>
              ) : (
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
                  <span>{profilePictureUrl ? "Change" : "Upload"}</span>
                </div>
              )}
            </div>

            {/* If no profile picture and not uploading, show prominent "+" symbol */}
            {!profilePictureUrl && !isUploadingAvatar && (
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

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
