"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load your profile.",
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
      profile_picture_url:
        String(formData.get("profile_picture_url") ?? "").trim() || null,
      github_url: String(formData.get("github_url") ?? "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || null,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      portfolio_website_url:
        String(formData.get("portfolio_website_url") ?? "").trim() || null,
      resume_url: String(formData.get("resume_url") ?? "").trim() || null,
    };

    try {
      await ApiService.updateProfile(profile.usn, updates);
      const updatedProfile: unknown = await ApiService.getMyProfile();
      if (!isStudentProfile(updatedProfile)) {
        throw new Error("Profile saved, but the refreshed profile response was invalid.");
      }
      setProfile(updatedProfile);
      setSkills(updatedProfile.skills.join(", "));
      setNotice("Your profile has been saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save your profile.",
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
          <p className="profile-message" role="alert">{error}</p>
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
              Update your student details and portfolio links.
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
          <span><strong>Student ID:</strong> {profile.id}</span>
          <span><strong>USN:</strong> {profile.usn}</span>
          <span><strong>Department:</strong> {profile.dept}</span>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="profile-name">Full name</label>
              <input className="profile-input" id="profile-name" name="name" required defaultValue={profile.name} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-usn">USN</label>
              <input className="profile-input" id="profile-usn" readOnly value={profile.usn} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-dob">Date of birth</label>
              <input className="profile-input" id="profile-dob" name="dob" type="date" required defaultValue={asInputValue(profile.dob)} />
              <p className="profile-hint">Your date of birth is also your login password.</p>
            </div>
            <div className="form-group">
              <label htmlFor="profile-phone">Mobile number</label>
              <input className="profile-input" id="profile-phone" name="phone_no" type="tel" defaultValue={asInputValue(profile.phone_no)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input className="profile-input" id="profile-email" name="email" type="email" defaultValue={asInputValue(profile.email)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-picture">Profile picture URL</label>
              <input className="profile-input" id="profile-picture" name="profile_picture_url" type="url" defaultValue={asInputValue(profile.profile_picture_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-github">GitHub URL</label>
              <input className="profile-input" id="profile-github" name="github_url" type="url" defaultValue={asInputValue(profile.github_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-linkedin">LinkedIn URL</label>
              <input className="profile-input" id="profile-linkedin" name="linkedin_url" type="url" defaultValue={asInputValue(profile.linkedin_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-instagram">Instagram URL</label>
              <input className="profile-input" id="profile-instagram" name="instagram_url" type="url" defaultValue={asInputValue(profile.instagram_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-portfolio">Portfolio website URL</label>
              <input className="profile-input" id="profile-portfolio" name="portfolio_website_url" type="url" defaultValue={asInputValue(profile.portfolio_website_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-resume">Resume URL</label>
              <input className="profile-input" id="profile-resume" name="resume_url" type="url" defaultValue={asInputValue(profile.resume_url)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-skills">Skills</label>
              <input
                className="profile-input"
                id="profile-skills"
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Python, Machine Learning"
                value={skills}
              />
            </div>
            <div className="form-group profile-bio-field">
              <label htmlFor="profile-bio">Bio</label>
              <textarea className="profile-textarea" id="profile-bio" name="bio" rows={5} defaultValue={asInputValue(profile.bio)} />
            </div>
          </div>

          <div className="profile-record-meta">
            <span><strong>Created:</strong> {formatTimestamp(profile.created_at)}</span>
            <span><strong>Last updated:</strong> {formatTimestamp(profile.updated_at)}</span>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}
          {notice && <p className="profile-success" role="status">{notice}</p>}

          <button className="btn btn-primary" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
