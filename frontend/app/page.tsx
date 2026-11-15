"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import OtpVerificationModal from "./OtpVerificationModal";
import { ApiService, getToken, isOtpVerified } from "./lib/api.js";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; usn: string; email?: string | null; avatar?: string | null } | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    void import("./lib/batchfolio-app.js")
      .then(({ initializeBatchfolioApp }) => initializeBatchfolioApp())
      .catch((error) => console.error("Failed to initialize Batchfolio:", error));

    if (getToken()) {
      void ApiService.getMyProfile()
        .then((profile) => {
          const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=200`;
          setCurrentUser({
            name: profile.name,
            usn: profile.usn,
            email: profile.email,
            avatar: profile.profile_picture_url || avatarFallback,
          });
        })
        .catch((error) => {
          console.error("Could not restore the logged-in student:", error);
        });
    }

    const handleOtpRequest = () => setIsOtpModalOpen(true);
    window.addEventListener("batchfolio:open-otp-verification", handleOtpRequest);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("batchfolio:open-otp-verification", handleOtpRequest);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function openLogin() {
    window.dispatchEvent(new Event("batchfolio:open-login"));
  }

  function scrollToSearch(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    const searchSection = document.getElementById("search-section");
    const searchInput = document.getElementById("student-search-input");
    if (searchSection) {
      const navbar = document.getElementById("main-nav");
      const navHeight = navbar ? navbar.offsetHeight : 74;
      const targetY = searchSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      setTimeout(() => {
        searchInput?.focus({ preventScroll: true });
      }, 350);
    }
  }

  return (
    <div className="dark-theme">
      {"\n  "}
      {"\n  "}
      <div className="glow-orb orb-1"></div>
      {"\n  "}
      <div className="glow-orb orb-2"></div>
      {"\n  "}
      <div className="glow-orb orb-3"></div>
      {"\n\n  "}
      {"\n  "}
      <header className="navbar" id="main-nav">
        <div className="nav-container">
          <a href="#home" className="brand-link" id="brand-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="brand-logo-wrap">
              <img src="/assets/artifera_logo.jpeg" alt="Artifera Logo" className="nav-logo" id="nav-artifera-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                AIML <span className="highlight-text">Batchfolio</span>
              </span>
              <span className="brand-subtitle">Class of 2024–2028</span>
            </div>
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="nav-menu" id="nav-menu">
            <a href="#home" className="nav-item active" id="nav-btn-home">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </a>
            <a href="#search-section" className="nav-item" id="nav-btn-search" onClick={scrollToSearch}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              Search
            </a>
            <Link href="/resumes" className="nav-item" id="nav-btn-resumes">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Resumes
            </Link>
          </nav>

          {/* Desktop Navigation Actions */}
          <div className="nav-actions">
            {currentUser ? (
              <a
                className="btn btn-primary profile-user-btn"
                href="/profile"
                onClick={(e) => {
                  e.preventDefault();
                  if (!currentUser.email || isOtpVerified()) {
                    window.location.href = "/profile";
                  } else {
                    setIsOtpModalOpen(true);
                  }
                }}
                aria-label={`Edit profile for ${currentUser.name}`}
              >
                <span className="nav-avatar-wrap" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=200`}
                    alt={currentUser.name}
                    className="nav-avatar-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=200`;
                    }}
                  />
                </span>
                <span className="nav-avatar-name">{currentUser.name.split(" ")[0]}</span>
              </a>
            ) : (
              <>
                <button className="profile-icon-btn" id="nav-profile-btn" title="Student Login" aria-label="Open User Login" onClick={openLogin}>
                  <span className="profile-avatar-mini" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                </button>
                <button className="btn btn-primary" id="open-login-btn" onClick={openLogin}>
                  <span>Login</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Screen Navbar Toggle Button */}
          <button
            type="button"
            className={`mobile-nav-toggle ${isMobileMenuOpen ? "active" : ""}`}
            id="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {currentUser && (
              <span className="mobile-toggle-user-badge">
                <img
                  src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=200`}
                  alt={currentUser.name}
                  className="mobile-toggle-avatar"
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
            {currentUser ? (
              <div className="mobile-user-card">
                <div className="mobile-user-header">
                  <div className="mobile-user-avatar-wrap">
                    <img
                      src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=200`}
                      alt={currentUser.name}
                      className="mobile-user-avatar"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&size=200`;
                      }}
                    />
                    <span className="mobile-user-status-dot"></span>
                  </div>
                  <div className="mobile-user-info">
                    <h4 className="mobile-user-name">{currentUser.name}</h4>
                    <span className="mobile-user-usn">{currentUser.usn}</span>
                    {currentUser.email && (
                      <span className="mobile-user-email">{currentUser.email}</span>
                    )}
                  </div>
                </div>
                <div className="mobile-user-actions">
                  <a
                    href="/profile"
                    className="btn btn-primary mobile-edit-profile-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      if (!currentUser.email || isOtpVerified()) {
                        window.location.href = "/profile";
                      } else {
                        setIsOtpModalOpen(true);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Edit Profile</span>
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline mobile-logout-btn"
                    onClick={() => {
                      localStorage.removeItem("auth_token");
                      localStorage.removeItem("auth_token_expires_at");
                      localStorage.removeItem("otp_verified");
                      setCurrentUser(null);
                      setIsMobileMenuOpen(false);
                      window.location.reload();
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
            ) : (
              <div className="mobile-guest-card">
                <div className="mobile-guest-header">
                  <div className="mobile-guest-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="mobile-guest-text">
                    <h4 className="mobile-guest-title">Student Account</h4>
                    <p className="mobile-guest-desc">Log in to edit profile & resume</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary mobile-login-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLogin();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  <span>Student Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="mobile-nav-links">
            <a
              href="#home"
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </a>
            <a
              href="#search-section"
              className="mobile-nav-item"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                scrollToSearch(e);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <span>Search Students</span>
            </a>
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
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Resumes Vault</span>
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
      {"\n\n  "}
      {"\n  "}
      <main className="page-main">
        {"\n    \n    "}
        {"\n    "}
        <section className="hero-section" id="home">
          {"\n      "}
          <div className="hero-container">
            {"\n        \n        "}
            {"\n        "}
            <div className="hero-badge animate-fade">
              {"\n          "}
              <span className="badge-dot"></span>
              {"\n          "}
              <span>{"Mangalore Institute of Technology & Engineering • Dept. of AIML"}</span>
              {"\n        "}
            </div>
            {"\n\n        "}
            {"\n        "}
            <div className="hero-content">
              {"\n          "}
              <h1 className="hero-title animate-slide-up">
                {"\n            AIML "}
                <span className="gradient-text">{"Batchfolio"}</span>
                {"\n          "}
              </h1>
              {"\n          "}
              <p className="hero-description animate-slide-up delay-1">{"\n            A unified platform showcasing student profiles, skills, projects and achievements.\n            Empowering the AI engineers and data visionaries of the Class of 2024–2028.\n          "}</p>
              {"\n        "}
            </div>
            {"\n\n        "}
            {"\n        "}
            <div className="hero-stats-grid animate-slide-up delay-2">
              {"\n          \n          "}
              <div className="stat-card">
                {"\n            "}
                <div className="stat-icon-wrap branch-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="m14 9 3 3-3 3"></path>
                  </svg>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="stat-info">
                  {"\n              "}
                  <span className="stat-label">{"Branch"}</span>
                  {"\n              "}
                  <h3 className="stat-value">{"AIML"}</h3>
                  {"\n              "}
                  <p className="stat-sub">{"AI & Machine Learning"}</p>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="stat-card">
                {"\n            "}
                <div className="stat-icon-wrap batch-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="stat-info">
                  {"\n              "}
                  <span className="stat-label">{"Batch"}</span>
                  {"\n              "}
                  <h3 className="stat-value">{"2024–2028"}</h3>
                  {"\n              "}
                  <p className="stat-sub">{"4-Year B.E. Program"}</p>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="stat-card">
                {"\n            "}
                <div className="stat-icon-wrap strength-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="stat-info">
                  {"\n              "}
                  <span className="stat-label">{"Strength"}</span>
                  {"\n              "}
                  <h3 className="stat-value" id="strength-counter">{"63"}</h3>
                  {"\n              "}
                  <p className="stat-sub">{"Enrolled Students"}</p>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="stat-card">
                {"\n            "}
                <div className="stat-icon-wrap hod-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                    <polyline points="10 2 10 10 13 7 16 10 16 2"></polyline>
                  </svg>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="stat-info">
                  {"\n              "}
                  <span className="stat-label">{"HOD"}</span>
                  {"\n              "}
                  <h3 className="stat-value">{"Dr Sunil Kumar"}</h3>
                  {"\n              "}
                  <p className="stat-sub">{"Head of Department"}</p>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n        "}
            </div>
            {"\n\n      "}
          </div>
          {"\n    "}
        </section>
        {"\n\n    "}
        {"\n    "}
        <section className="search-section" id="search-section">
          <div className="search-wrapper">
            <div className="search-bar-row">
              <div className="search-input-container">
                <input
                  type="text"
                  id="student-search-input"
                  className="search-input"
                  placeholder="Search students by name, USN, skills..."
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="search-clear-btn"
                  id="search-clear-btn"
                  aria-label="Clear Search"
                  style={{ display: "none" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button
                  type="button"
                  className="search-action-btn"
                  id="search-action-btn"
                  aria-label="Search"
                  title="Search (Type any key to search)"
                  onClick={scrollToSearch}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="7.5"></circle>
                    <path d="m21 21-4.35-4.35" strokeLinecap="round"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        {"\n\n    "}
        {"\n    "}
        <section className="students-section" id="students-grid-section">
          {"\n      "}
          <div className="section-container">
            {"\n        \n        "}
            <div className="section-title-wrap">
              {"\n          "}
              <h2 className="section-title">
                {"Class of 2024–2028 "}
                <span className="gradient-text">{"Profiles"}</span>
              </h2>
              {"\n          "}
              <p className="section-desc">{"Click any student card to view their complete portfolio, projects, and contact credentials."}</p>
              {"\n        "}
            </div>
            {"\n\n        "}
            {"\n        "}
            <div className="students-grid" id="students-grid">
              {"\n          "}
              {"\n        "}
            </div>
            {"\n\n        "}
            {"\n        "}
            <div className="no-results-state" id="no-results" style={{"display": "none"}}>
              {"\n          "}
              <div className="no-results-icon">{"🔍"}</div>
              {"\n          "}
              <h3>{"No students found"}</h3>
              {"\n          "}
              <p>
                {"We couldn't find any student matching your query. Try searching by USN (e.g. "}
                <code>{"4MT24AI001"}</code>
                {"), name, or clear filters."}
              </p>
              {"\n          "}
              <button className="btn btn-outline" id="reset-search-btn">{"Reset Search"}</button>
              {"\n        "}
            </div>
            {"\n\n      "}
          </div>
          {"\n    "}
        </section>
        {"\n\n  "}
      </main>
      {"\n\n  "}
      {"\n  "}
      <div className="modal-backdrop" id="student-modal" aria-hidden="true" role="dialog">
        {"\n    "}
        <div className="modal-dialog modal-student" id="student-modal-dialog">
          {"\n      "}
          <button className="modal-close-btn" id="close-student-modal" aria-label="Close Profile Modal">
            {"\n        "}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            {"\n      "}
          </button>
          {"\n\n      "}
          {"\n      "}
          <div className="modal-inner-card" id="student-modal-body">
            {"\n        "}
            {"\n      "}
          </div>
          {"\n    "}
        </div>
        {"\n  "}
      </div>
      {"\n\n  "}
      {"\n  "}
      <LoginModal
        onLoginSuccess={(user) => {
          // Set a quick placeholder immediately so the name appears instantly
          const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`;
          setCurrentUser({ name: user.name, usn: user.usn, email: user.email, avatar: avatarFallback });

          // Fetch the full profile in the background to get the real profile picture
          void ApiService.getMyProfile()
            .then((profile) => {
              setCurrentUser({
                name: profile.name,
                usn: profile.usn,
                email: profile.email,
                avatar: profile.profile_picture_url || avatarFallback,
              });
            })
            .catch(() => { /* keep placeholder on error */ });

          if (!user.email || !user.email.trim()) {
            window.location.href = "/profile";
          }
        }}
      />

      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          window.location.href = "/profile";
        }}
      />

      <div className="modal-backdrop" id="resumes-modal" aria-hidden="true" role="dialog">
        {"\n    "}
        <div className="modal-dialog modal-resumes">
          {"\n      "}
          <button className="modal-close-btn" id="close-resumes-modal" aria-label="Close Resumes Modal">
            {"\n        "}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            {"\n      "}
          </button>
          {"\n\n      "}
          <div className="resumes-header">
            {"\n        "}
            <h2 className="resumes-title">{"Batch 2024–2028 Resume Repository"}</h2>
            {"\n        "}
            <p className="resumes-subtitle">{"Browse and download verified student curriculum vitae and technical portfolios."}</p>
            {"\n      "}
          </div>
          {"\n\n      "}
          <div className="resumes-quick-search">
            {"\n        "}
            <input type="text" id="resumes-filter-input" placeholder="Quick filter resumes by student name or USN..." />
            {"\n      "}
          </div>
          {"\n\n      "}
          <div className="resumes-list" id="resumes-list-container">
            {"\n        "}
            {"\n      "}
          </div>
          {"\n    "}
        </div>
        {"\n  "}
      </div>
      {"\n\n  "}
      {"\n  "}
      <div className="toast-container" id="toast-container"></div>
      {"\n\n  "}
      {"\n  "}
      <footer className="page-footer">
        {"\n    "}
        <div className="footer-container">
          {"\n      "}
          <div className="footer-brand">
            {"\n        "}
            <div className="footer-logo-row">
              {"\n          "}
              <img src="/assets/artifera_logo.jpeg" alt="Artifera Logo" className="footer-logo" />
              {"\n          "}
              <span className="footer-title">{"AIML Batchfolio"}</span>
              {"\n        "}
            </div>
            {"\n        "}
            <p className="footer-desc">{"\n          Official digital portfolio platform for the Department of Artificial Intelligence & Machine Learning (Batch 2024–2028), MITE. Managed in collaboration with ARTIFERA Student Forum.\n        "}</p>
            {"\n      "}
          </div>
          {"\n\n      "}
          <div className="footer-links-group">
            {"\n        "}
            <h4>{"Department Leadership"}</h4>
            {"\n        "}
            <p>
              <strong>{"HOD:"}</strong>
              {" Dr Sunil Kumar"}
            </p>
            {"\n        "}
            <p>
              <strong>{"Department:"}</strong>
              {" AI & Machine Learning"}
            </p>
            {"\n        "}
            <p>
              <strong>{"Strength:"}</strong>
              {" "}
              <span id="footer-strength">{"63"}</span>
              {" Enrolled Innovators"}
            </p>
            {"\n        "}
            <p>
              <strong>{"Batch:"}</strong>
              {" 2024 – 2028"}
            </p>
            {"\n      "}
          </div>
          {"\n\n      "}
          <div className="footer-links-group">
            {"\n        "}
            <h4>{"Quick Access"}</h4>
            {"\n        "}
            <ul>
              {"\n          "}
              <li>
                <a href="#home">{"Home Portal"}</a>
              </li>
              {"\n          "}
              <li>
                <a href="#search-section" onClick={scrollToSearch}>{"Search Students"}</a>
              </li>
              {"\n          "}
              <li>
                <Link href="/resumes" id="footer-resumes-link">{"Resume Vault"}</Link>
              </li>
              {"\n          "}
              <li>
                <a
                  href="#open-login"
                  id="footer-login-link"
                  onClick={(event) => {
                    event.preventDefault();
                    openLogin();
                  }}
                >
                  {"Student Login"}
                </a>
              </li>
              {"\n        "}
            </ul>
            {"\n      "}
          </div>
          {"\n    "}
        </div>
        {"\n    "}
        <div className="footer-bottom">
          {"\n      "}
          <p>{"© 2024–2028 Department of AIML, MITE & ARTIFERA. All rights reserved."}</p>
          {"\n    "}
        </div>
        {"\n  "}
      </footer>
      {"\n\n  "}
      {"\n  "}
      {"\n"}
    </div>
  );
}
