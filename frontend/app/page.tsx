"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    void import("./lib/batchfolio-app.js")
      .then(({ initializeBatchfolioApp }) => initializeBatchfolioApp())
      .catch((error) => console.error("Failed to initialize Batchfolio:", error));
  }, []);

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
            <button className="profile-icon-btn" id="nav-profile-btn" title="Student Profile &amp; Quick Info" aria-label="Open User Profile">
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
            <button className="btn btn-primary" id="open-login-btn">
              {"\n          "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              {"\n          "}
              <span>{"Login"}</span>
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
              <p className="hero-description animate-slide-up delay-1">{"\n            A unified platform showcasing student profiles, skills, projects and achievements.\n            Empowering 63 emerging AI engineers and data visionaries of the Class of 2024–2028.\n          "}</p>
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
                <button className="filter-chip active" data-category="ALL">{"All Specializations"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="AI/ML">{"AI & Machine Learning"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="Web Dev">{"Full Stack AI"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="Data Science">{"Data Science"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="Cloud">{"MLOps & Cloud"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="IoT">{"Edge AI & IoT"}</button>
                {"\n            "}
                <button className="filter-chip" data-category="Security">{"Cyber & AI Safety"}</button>
                {"\n          "}
              </div>
              {"\n          "}
              <div className="students-counter" id="students-counter">
                {"\n            Showing "}
                <strong id="visible-count">{"63"}</strong>
                {" of "}
                <strong>{"63"}</strong>
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
      <div className="modal-backdrop" id="auth-modal" aria-hidden="true" role="dialog">
        {"\n    "}
        <div className="modal-dialog modal-auth" id="auth-modal-dialog">
          {"\n      "}
          <button className="modal-close-btn" id="close-auth-modal" aria-label="Close Auth Modal">
            {"\n        "}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            {"\n      "}
          </button>
          {"\n\n      "}
          <div className="auth-header">
            {"\n        "}
            <div className="auth-logo-badge">
              {"\n          "}
              <img src="/assets/artifera_logo.jpeg" alt="Batchfolio" />
              {"\n        "}
            </div>
            {"\n        "}
            <h2 className="auth-title" id="auth-title">{"Welcome to Batchfolio"}</h2>
            {"\n        "}
            <p className="auth-subtitle" id="auth-subtitle">{"Access student portfolio portal & manage your profile"}</p>
            {"\n      "}
          </div>
          {"\n\n      "}
          {"\n      "}
          <div className="auth-switch-tab">
            {"\n        "}
            <button className="auth-tab-btn active" id="tab-login-btn">{"Log In"}</button>
            {"\n        "}
            <button className="auth-tab-btn" id="tab-signup-btn">{"Sign Up"}</button>
            {"\n      "}
          </div>
          {"\n\n      "}
          {"\n      "}
          <div className="auth-form-view" id="login-form-div">
            {"\n        "}
            <form id="login-form" className="auth-form">
              {"\n          "}
              <div className="form-group">
                {"\n            "}
                <label htmlFor="login-identifier">{"USN or Email"}</label>
                {"\n            "}
                <div className="input-with-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {"\n              "}
                  <input type="text" id="login-identifier" placeholder="e.g. 4MT24AI001 or email@mite.ac.in" required={true} />
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-group">
                {"\n            "}
                <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "baseline"}}>
                  {"\n              "}
                  <label htmlFor="login-password">
                    {"Password "}
                    <span style={{"color": "#67e8f9", "fontSize": "0.75rem", "fontWeight": "500"}}>{"(DOB: DDMMYYYY)"}</span>
                  </label>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="input-with-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  {"\n              "}
                  <input type="password" id="login-password" placeholder="e.g. 23112006 (DDMMYYYY)" required={true} />
                  {"\n            "}
                </div>
                {"\n            "}
                <div style={{"marginTop": "0.35rem", "fontSize": "0.75rem", "color": "#94a3b8", "display": "flex", "alignItems": "center", "gap": "0.3rem"}}>
                  {"\n              "}
                  <span>{"🔑"}</span>
                  {"\n              "}
                  <span>
                    {"Default password is your "}
                    <strong>{"DOB in DDMMYYYY"}</strong>
                    {" format (e.g. 23/11/2006 → 23112006)"}
                  </span>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-options">
                {"\n            "}
                <label className="remember-label">
                  {"\n              "}
                  <input type="checkbox" id="login-remember" defaultChecked />
                  {"\n              "}
                  <span>{"Remember me"}</span>
                  {"\n            "}
                </label>
                {"\n            "}
                <a href="#forgot" className="link-forgot" id="forgot-password-link">{"Password Help"}</a>
                {"\n          "}
              </div>
              {"\n\n          "}
              <button type="submit" className="btn btn-primary btn-block" id="btn-submit-login">
                {"\n            "}
                <span>{"Login to Batchfolio"}</span>
                {"\n            "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                {"\n          "}
              </button>
              {"\n        "}
            </form>
            {"\n\n        "}
            <div className="auth-divider">
              {"\n          "}
              <span>{"Don't have an account?"}</span>
              {"\n        "}
            </div>
            {"\n\n        "}
            <button type="button" className="btn btn-secondary btn-block" id="btn-switch-to-signup">{"\n          Create New Student Account\n        "}</button>
            {"\n      "}
          </div>
          {"\n\n      "}
          {"\n      "}
          <div className="auth-form-view" id="signup-form-div" style={{"display": "none"}}>
            {"\n        "}
            <form id="signup-form" className="auth-form">
              {"\n          "}
              <div className="form-row">
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label htmlFor="signup-name">{"Full Name"}</label>
                  {"\n              "}
                  <div className="input-with-icon">
                    {"\n                "}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="7" r="4"></circle>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    </svg>
                    {"\n                "}
                    <input type="text" id="signup-name" placeholder="Full Student Name" required={true} />
                    {"\n              "}
                  </div>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label htmlFor="signup-usn">{"USN"}</label>
                  {"\n              "}
                  <div className="input-with-icon">
                    {"\n                "}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                      <path d="M7 7h10"></path>
                      <path d="M7 12h10"></path>
                      <path d="M7 17h6"></path>
                    </svg>
                    {"\n                "}
                    <input type="text" id="signup-usn" placeholder="4MT24AI..." required={true} />
                    {"\n              "}
                  </div>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-group">
                {"\n            "}
                <label htmlFor="signup-email">{"College Email Address"}</label>
                {"\n            "}
                <div className="input-with-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {"\n              "}
                  <input type="email" id="signup-email" placeholder="student@mite.ac.in" required={true} />
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-group">
                {"\n            "}
                <label htmlFor="signup-dob">
                  {"Date of Birth "}
                  <span style={{"color": "#67e8f9", "fontSize": "0.75rem", "fontWeight": "500", "marginLeft": "0.4rem"}}>{"🔑 Auto-becomes your password (DDMMYYYY)"}</span>
                </label>
                {"\n            "}
                <div className="input-with-icon">
                  {"\n              "}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {"\n              "}
                  <input type="date" id="signup-dob" required={true} max="2010-12-31" min="2000-01-01" />
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-row">
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label htmlFor="signup-phone">{"Phone Number"}</label>
                  {"\n              "}
                  <div className="input-with-icon">
                    {"\n                "}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {"\n                "}
                    <input type="tel" id="signup-phone" placeholder="10-digit mobile" />
                    {"\n              "}
                  </div>
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label htmlFor="signup-year">{"Academic Year"}</label>
                  {"\n              "}
                  <div className="input-with-icon">
                    {"\n                "}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                    {"\n                "}
                    <select id="signup-year" style={{"width": "100%", "background": "transparent", "border": "none", "outline": "none", "color": "#fff", "fontFamily": "inherit", "fontSize": "0.92rem", "padding": "0.75rem 0"}}>
                      {"\n                  "}
                      <option value="" style={{"background": "#111728"}}>{"Select Year"}</option>
                      {"\n                  "}
                      <option value="1" style={{"background": "#111728"}}>{"1st Year"}</option>
                      {"\n                  "}
                      <option value="2" style={{"background": "#111728"}}>{"2nd Year"}</option>
                      {"\n                  "}
                      <option value="3" style={{"background": "#111728"}}>{"3rd Year"}</option>
                      {"\n                  "}
                      <option value="4" style={{"background": "#111728"}}>{"4th Year"}</option>
                      {"\n                "}
                    </select>
                    {"\n              "}
                  </div>
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div className="form-row">
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label>{"Branch"}</label>
                  {"\n              "}
                  <input type="text" id="signup-branch" value="AIML" readOnly={true} className="input-readonly" />
                  {"\n            "}
                </div>
                {"\n            "}
                <div className="form-group">
                  {"\n              "}
                  <label>{"Batch"}</label>
                  {"\n              "}
                  <input type="text" id="signup-batch" value="2024-2028" readOnly={true} className="input-readonly" />
                  {"\n            "}
                </div>
                {"\n          "}
              </div>
              {"\n\n          "}
              <div style={{"background": "rgba(6,182,212,0.08)", "border": "1px solid rgba(6,182,212,0.25)", "borderRadius": "10px", "padding": "0.75rem 1rem", "fontSize": "0.82rem", "color": "#67e8f9", "display": "flex", "alignItems": "flex-start", "gap": "0.5rem"}}>
                {"\n            "}
                <span>{"🔑"}</span>
                {"\n            "}
                <span>
                  {"Your password is auto-set to your "}
                  <strong>{"DOB in DDMMYYYY format"}</strong>
                  {"."}
                  <br />
                  {"Example: DOB 23/11/2006 → Password "}
                  <strong>{"23112006"}</strong>
                </span>
                {"\n          "}
              </div>
              {"\n\n          "}
              <button type="submit" className="btn btn-primary btn-block" id="btn-submit-signup">
                {"\n            "}
                <span>{"Register Student Account"}</span>
                {"\n            "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                {"\n          "}
              </button>
              {"\n        "}
            </form>
            {"\n\n        "}
            <div className="auth-divider">
              <span>{"Already registered?"}</span>
            </div>
            {"\n\n        "}
            <button type="button" className="btn btn-secondary btn-block" id="btn-switch-to-login">{"\n          Sign In with Existing Account\n        "}</button>
            {"\n      "}
          </div>
          {"\n\n    "}
        </div>
        {"\n  "}
      </div>
      {"\n\n  "}
      {"\n  "}
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
              {" 63 Enrolled Innovators"}
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
                <a href="#open-login" id="footer-login-link">{"Student Login"}</a>
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
