"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiService } from "../lib/api.js";

type Student = {
  usn: string;
  fullName: string;
  avatar: string;
  resumeUrl: string | null;
};

export default function ResumesPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentsWithResume, setStudentsWithResume] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState<"with-resume" | "all">("with-resume");
  const [activeResumeStudent, setActiveResumeStudent] = useState<Student | null>(null);

  useEffect(() => {
    ApiService.getStudents()
      .then((all: Student[]) => {
        setAllStudents(all);
        const withRes = all.filter((s) => s.resumeUrl);
        setStudentsWithResume(withRes);
        setFiltered(withRes);
      })
      .catch(() => setError("Could not load resumes. Please verify connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const pool = filterMode === "with-resume" ? studentsWithResume : allStudents;
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(pool);
    } else {
      setFiltered(
        pool.filter(
          (s) =>
            s.fullName.toLowerCase().includes(q) ||
            s.usn.toLowerCase().includes(q)
        )
      );
    }
  }, [query, filterMode, studentsWithResume, allStudents]);

  // Handle ESC key to close centered modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveResumeStudent(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleDownload(student: Student) {
    if (!student.resumeUrl) return;
    const a = document.createElement("a");
    a.href = student.resumeUrl;
    a.download = `${student.usn}_${student.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="dark-theme">
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />

      {/* ── NAVBAR ── */}
      <header className="navbar" id="main-nav">
        <div className="nav-container">
          <Link href="/" className="brand-link" id="brand-logo-link">
            <div className="brand-logo-wrap">
              <img
                src="/assets/artifera_logo.jpeg"
                alt="Artifera Logo"
                className="nav-logo"
              />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                AIML <span className="highlight-text">Batchfolio</span>
              </span>
              <span className="brand-subtitle">Class of 2024–2028</span>
            </div>
          </Link>

          <nav className="nav-menu">
            <Link href="/" className="nav-item">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <Link href="/resumes" className="nav-item active">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Resumes
            </Link>
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="page-main" style={{ paddingTop: "6.5rem", paddingBottom: "5rem" }}>
        <div className="section-container">
          {/* Header Title */}
          <div className="section-title-wrap" style={{ marginBottom: "2rem", textAlign: "center" }}>
            <div className="hero-badge animate-fade" style={{ display: "inline-flex", marginBottom: "0.85rem" }}>
              <span className="badge-dot" />
              <span>Interactive Resume Vault</span>
            </div>
            <h1 className="section-title" style={{ fontSize: "2.3rem", marginBottom: "0.6rem" }}>
              Class of 2024–2028 <span className="gradient-text">Resume Portfolios</span>
            </h1>
            <p className="section-desc" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Click any student resume card to expand and view the full verified document in the center.
            </p>
          </div>

          {/* Controls Bar: Search & Filter Tabs */}
          <div className="search-wrapper" style={{ marginBottom: "2.25rem", maxWidth: "860px", margin: "0 auto 2.25rem" }}>
            <div className="search-bar-row">
              <div className="search-input-container">
                <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search resumes by student name or USN..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {query && (
                  <button
                    className="search-clear-btn"
                    style={{ display: "flex" }}
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="filter-controls-row" style={{ marginTop: "1rem" }}>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${filterMode === "with-resume" ? "active" : ""}`}
                  onClick={() => setFilterMode("with-resume")}
                >
                  Resumes Available ({studentsWithResume.length})
                </button>
                <button
                  className={`filter-chip ${filterMode === "all" ? "active" : ""}`}
                  onClick={() => setFilterMode("all")}
                >
                  All Batch Students ({allStudents.length})
                </button>
              </div>

              <div className="students-counter">
                Showing <strong>{filtered.length}</strong> {filterMode === "with-resume" ? "Verified Resumes" : "Students"}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
              <div className="profile-loading-viewport">
                <div className="profile-loader-card">
                  <div className="loader-portal">
                    <div className="portal-ring ring-1" />
                    <div className="portal-ring ring-2" />
                    <div className="portal-ring ring-3" />
                    <div className="portal-core" />
                  </div>
                  <p className="loader-label">Loading Resumes Vault...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#f87171" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
              <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
              <button
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                ↺ Retry Connection
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
              <h3 style={{ color: "#f1f5f9", marginBottom: "0.5rem", fontSize: "1.3rem" }}>
                {query ? "No matching student resumes found" : "No resumes in this filter"}
              </h3>
              <p style={{ fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                {query
                  ? "Try adjusting your search query or clear the filter."
                  : "Students can upload their verified PDF resume from their Profile Editor."}
              </p>
              {query && (
                <button
                  className="btn btn-outline"
                  onClick={() => setQuery("")}
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}

          {/* Compact 2-per-row grid on desktop, 1-per-row on mobile */}
          {!loading && !error && filtered.length > 0 && (
            <div className="resume-vault-grid">
              {filtered.map((student) => (
                <ResumeCard
                  key={student.usn}
                  student={student}
                  onOpen={() => setActiveResumeStudent(student)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── CENTERED RESUME LIGHTBOX MODAL ── */}
      {activeResumeStudent && (
        <div
          className="modal-backdrop active resume-modal-backdrop"
          onClick={() => setActiveResumeStudent(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-dialog resume-centered-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="resume-modal-header">
              <div className="resume-modal-identity">
                <img
                  src={activeResumeStudent.avatar}
                  alt={activeResumeStudent.fullName}
                  className="resume-modal-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeResumeStudent.fullName)}&background=6366f1&color=fff&size=80`;
                  }}
                />
                <div className="resume-modal-title-block">
                  <h3 className="resume-modal-title">{activeResumeStudent.fullName}</h3>
                  <p className="resume-modal-usn">{activeResumeStudent.usn} • AIML 2024–2028</p>
                </div>
              </div>

              <div className="resume-modal-actions-wrap">
                {activeResumeStudent.resumeUrl && (
                  <div className="resume-modal-actions">
                    <button
                      className="btn btn-primary resume-modal-btn"
                      onClick={() => handleDownload(activeResumeStudent)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download</span>
                    </button>
                    <a
                      href={activeResumeStudent.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary resume-modal-btn"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>Open Tab</span>
                    </a>
                  </div>
                )}
                <button
                  className="resume-modal-close-btn"
                  onClick={() => setActiveResumeStudent(null)}
                  aria-label="Close resume viewer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body: Centered Enlarged PDF Preview */}
            <div className="resume-modal-body">
              {activeResumeStudent.resumeUrl ? (
                <iframe
                  src={`${activeResumeStudent.resumeUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  title={`${activeResumeStudent.fullName} Verified Resume`}
                  className="resume-modal-iframe"
                />
              ) : (
                <div className="resume-vault-pdf-fallback" style={{ height: "400px" }}>
                  <div className="fallback-folder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="46" height="46">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </div>
                  <p className="fallback-title">No Resume Uploaded</p>
                  <p className="fallback-sub">This student has not yet attached a PDF resume.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="page-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/assets/artifera_logo.jpeg" alt="Artifera Logo" className="footer-logo" />
              <span className="footer-title">AIML Batchfolio</span>
            </div>
            <p className="footer-desc">
              Official digital portfolio platform for the Department of Artificial Intelligence &amp; Machine Learning (Batch 2024–2028), MITE.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024–2028 Department of AIML, MITE &amp; ARTIFERA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Resume Card Component Styled Like a Folder Cover ── */
function ResumeCard({
  student,
  onOpen,
  onDownload,
}: {
  student: Student;
  onOpen: () => void;
  onDownload: (s: Student) => void;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div
      className="resume-vault-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      title={`Click to open ${student.fullName}'s resume`}
    >
      {/* Folder Header Tab */}
      <div className="resume-card-folder-tab">
        <div className="folder-tab-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>RESUME COVER</span>
        </div>
        <span className="folder-click-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          Click to expand
        </span>
      </div>

      {/* Opened Resume PDF Preview with Click Indication Overlay */}
      <div className="resume-vault-preview">
        {/* Click Cue Hover Overlay */}
        <div className="resume-click-overlay">
          <div className="resume-click-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Click to Open Resume</span>
          </div>
        </div>

        {student.resumeUrl ? (
          <>
            {!iframeLoaded && (
              <div className="resume-vault-iframe-loading">
                <div className="spinner-core" style={{ width: "22px", height: "22px" }} />
                <span>Loading preview...</span>
              </div>
            )}
            <iframe
              src={`${student.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={`${student.fullName} Resume PDF`}
              className="resume-vault-iframe resume-vault-iframe-preview"
              onLoad={() => setIframeLoaded(true)}
            />
          </>
        ) : (
          <div className="resume-vault-pdf-fallback">
            <div className="fallback-folder-icon" style={{ width: "54px", height: "54px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <p className="fallback-title" style={{ fontSize: "0.92rem" }}>No Resume Uploaded</p>
            <p className="fallback-sub" style={{ fontSize: "0.78rem" }}>Pending student upload</p>
          </div>
        )}
      </div>

      {/* Folder Cover Bottom Strip with Student Profile Image and Name */}
      <div className="resume-vault-cover">
        <div className="resume-vault-identity">
          <div className="resume-avatar-wrapper">
            <img
              src={student.avatar}
              alt={student.fullName}
              className="resume-vault-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff&size=80`;
              }}
            />
          </div>
          <div className="resume-vault-name-block">
            <h4 className="resume-vault-name" title={student.fullName}>{student.fullName}</h4>
            <span className="resume-vault-usn">{student.usn}</span>
          </div>
        </div>

        {student.resumeUrl ? (
          <button
            className="resume-vault-dl-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(student);
            }}
            title={`Download ${student.fullName}'s resume PDF`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </button>
        ) : (
          <span className="resume-pending-badge">Pending</span>
        )}
      </div>
    </div>
  );
}
