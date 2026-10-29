"use client";

import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; usn: string } | null>(null);

  useEffect(() => {
    void import("./lib/batchfolio-app.js")
      .then(({ initializeBatchfolioApp }) => initializeBatchfolioApp())
      .catch((error) => console.error("Failed to initialize Batchfolio:", error));
  }, []);

  function openLogin() {
    window.dispatchEvent(new Event("batchfolio:open-login"));
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
        {"\n    "}
        <div className="nav-container">
          {"\n      "}
          <a href="#home" className="brand-link" id="brand-logo-link">
            {"\n        "}
            <div className="brand-logo-wrap">
              {"\n          "}
              <img src="/assets/artifera_logo.jpeg" alt="Artifera Logo" className="nav-logo" id="nav-artifera-logo" />
              {"\n        "}
            </div>
            {"\n        "}
            <div className="brand-text">
              {"\n          "}
              <span className="brand-title">
                {"AIML "}
                <span className="highlight-text">{"Batchfolio"}</span>
              </span>
              {"\n          "}
              <span className="brand-subtitle">{"Class of 2024–2028"}</span>
              {"\n        "}
            </div>
            {"\n      "}
          </a>
          {"\n\n      "}
          {"\n      "}
          <nav className="nav-menu" id="nav-menu">
            {"\n        "}
            <a href="#home" className="nav-item active" id="nav-btn-home">
              {"\n          "}
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {"\n          Home\n        "}
            </a>
            {"\n        "}
            <a href="#search-section" className="nav-item" id="nav-btn-search">
              {"\n          "}
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              {"\n          Search\n        "}
            </a>
            {"\n        "}
            <a href="#resumes" className="nav-item" id="nav-btn-resumes">
              {"\n          "}
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {"\n          Resumes\n        "}
            </a>
            {"\n      "}
          </nav>
          {"\n\n      "}
          {"\n      "}
          <div className="nav-actions">
            {"\n        "}
            <button className="profile-icon-btn" id="nav-profile-btn" title="Student Profile &amp; Quick Info" aria-label="Open User Profile" onClick={openLogin}>
              {"\n          "}
              <div className="profile-avatar-mini" id="nav-avatar-icon">
                {"\n            "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {"\n          "}
              </div>
              {"\n        "}
            </button>
            {"\n\n        "}
            <button className="btn btn-primary" id="open-login-btn" onClick={openLogin}>
              {"\n          "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              {"\n          "}
              <span>{currentUser?.name ?? "Login"}</span>
              {"\n        "}
            </button>
            {"\n      "}
          </div>
          {"\n    "}
        </div>
        {"\n  "}
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
          {"\n      "}
          <div className="search-wrapper">
            {"\n        "}
            <div className="search-bar-row">
              {"\n          "}
              <div className="search-input-container">
                {"\n            "}
                <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {"\n              "}
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                  {"\n            "}
                </svg>
                {"\n            "}
                <input type="text" id="student-search-input" className="search-input" placeholder="Search any students by name, USN, or skills..." autoComplete="off" />
                {"\n            "}
                <button className="search-clear-btn" id="search-clear-btn" aria-label="Clear Search" style={{"display": "none"}}>
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  {"\n            "}
                </button>
                {"\n          "}
              </div>
              {"\n        "}
            </div>
            {"\n\n        "}
            {"\n        "}
            <div className="filter-controls-row">
              {"\n          "}
              <div className="filter-chips" id="filter-chips-container">
                {"\n            "}
                <button className="filter-chip active" data-category="ALL">{"All Students"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="AI/ML">{"AI & Machine Learning"}</button>
                {"\n            "}
                {"\n          "}
              </div>
              {"\n          "}
              <div className="students-counter" id="students-counter">
                {"\n            Showing "}
                <strong id="visible-count">{"63"}</strong>
                {" of "}
                <strong id="total-count">{"63"}</strong>
                {" Students\n          "}
              </div>
              {"\n        "}
            </div>
            {"\n      "}
          </div>
          {"\n    "}
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
        onLoginSuccess={(user) =>
          setCurrentUser({ name: user.name, usn: user.usn })
        }
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
                <a href="#search-section">{"Search Students"}</a>
              </li>
              {"\n          "}
              <li>
                <a href="#resumes" id="footer-resumes-link">{"Resume Vault"}</a>
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
