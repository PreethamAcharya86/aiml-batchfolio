"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import OtpVerificationModal from "./OtpVerificationModal";
import SiteLoader from "./SiteLoader";
import { ApiService, clearToken, getToken, isOtpVerified } from "./lib/api.js";

// Count-up animation hook
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const ease = (t: number) => 1 - Math.pow(1 - t, 3);
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.round(ease(progress) * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function CountUpStat({ target }: { target: number }) {
  const { value, ref } = useCountUp(target);
  return <span ref={ref} className="stat-counter-animated">{value}</span>;
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; usn: string; email?: string | null; avatar?: string | null } | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSiteLoading, setIsSiteLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const startTime = performance.now();
    const minDisplayMs = 700;

    const initPromise = import("./lib/batchfolio-app.js")
      .then(({ initializeBatchfolioApp }) => initializeBatchfolioApp())
      .catch((error) => console.error("Failed to initialize Batchfolio:", error));

    const profilePromise = getToken()
      ? ApiService.getMyProfile()
          .then((profile) => {
            const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=00638E&color=FFFFFF&size=200`;
            setCurrentUser({
              name: profile.name,
              usn: profile.usn,
              email: profile.email,
              avatar: profile.profile_picture_url || avatarFallback,
            });
          })
          .catch((error) => {
            console.error("Could not restore the logged-in student:", error);
          })
      : Promise.resolve();

    Promise.all([initPromise, profilePromise]).finally(() => {
      const elapsed = performance.now() - startTime;
      const delay = Math.max(0, minDisplayMs - elapsed);
      setTimeout(() => {
        setIsSiteLoading(false);
      }, delay);
    });

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

  // Navbar scroll effect
  useEffect(() => {
    let ticking = false;
    const nav = document.getElementById("main-nav");
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (nav) {
          if (window.scrollY > 40) nav.classList.add("nav-scrolled");
          else nav.classList.remove("nav-scrolled");
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Intersection observer for reveal-on-scroll and section-spread
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll, .section-spread");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            (entry.target as HTMLElement).classList.add("is-spread");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    els.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${Math.min(i * 60, 700)}ms`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /**
   * Scroll so the sticky search bar + "Class of 2024–2028 Profiles" section
   * are both visible beneath the navbar. Works from ANY scroll position on
   * both desktop and mobile.
   */
  function scrollToSearch(e?: React.MouseEvent, fromMobile = false) {
    if (e) e.preventDefault();

    const doScroll = () => {
      const studentsSection = document.getElementById("students-grid-section");
      const searchSection = document.getElementById("search-section");
      const navbar = document.getElementById("main-nav");
      const searchInput = document.getElementById("student-search-input") as HTMLInputElement | null;

      const navHeight = navbar ? navbar.offsetHeight : 64;
      const searchHeight = searchSection ? searchSection.getBoundingClientRect().height : 56;

      if (studentsSection) {
        // getBoundingClientRect gives viewport-relative top; + scrollY = absolute doc position
        const absSectionTop = window.scrollY + studentsSection.getBoundingClientRect().top;
        // Target: navbar at top → search bar gap → profiles section starts
        const targetY = Math.max(0, absSectionTop - navHeight - searchHeight);
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } else if (searchSection) {
        const absSearchTop = window.scrollY + searchSection.getBoundingClientRect().top;
        window.scrollTo({ top: Math.max(0, absSearchTop - navHeight), behavior: "smooth" });
      }

      // Focus input after smooth scroll settles (~350ms)
      setTimeout(() => {
        searchInput?.focus({ preventScroll: true });
      }, 350);
    };

    if (fromMobile) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      setTimeout(doScroll, 80);
    } else {
      doScroll();
    }
  }

  function openLogin() {
    window.dispatchEvent(new Event("batchfolio:open-login"));
  }

  function handleLogout() {
    clearToken();
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    window.location.reload();
  }

  return (
    <div className="theme-nordic">
      <SiteLoader isLoading={isSiteLoading} />
      <header className="navbar" id="main-nav">
        <div className="nav-container">
          <a href="#home" className="brand-link" id="brand-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="brand-logo-wrap">
              <img src="/assets/web_icon.ico" alt="Batchfolio Logo" className="nav-logo" id="nav-artifera-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                AIML <span className="highlight-text">Batchfolio</span>
              </span>
              <span className="brand-subtitle">Class of 2024–2028</span>
            </div>
          </a>

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
                    src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00638E&color=FFFFFF&size=200`}
                    alt={currentUser.name}
                    className="nav-avatar-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00638E&color=FFFFFF&size=200`;
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

          {/* Mobile Screen Navbar Controls */}
          <div className="mobile-nav-actions">
            <button
              type="button"
              className="mobile-nav-search-btn"
              id="mobile-nav-search-btn"
              aria-label="Search Students"
              title="Search Students"
              onClick={(e) => {
                if (isMobileMenuOpen) {
                  document.body.style.overflow = "";
                  document.documentElement.style.overflow = "";
                  setIsMobileMenuOpen(false);
                }
                scrollToSearch(e, false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </button>

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
                    src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00638E&color=FFFFFF&size=200`}
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
                      src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00638E&color=FFFFFF&size=200`}
                      alt={currentUser.name}
                      className="mobile-user-avatar"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00638E&color=FFFFFF&size=200`;
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
                    onClick={handleLogout}
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
              id="mobile-drawer-search-btn"
              onClick={(e) => {
                e.preventDefault();
                document.body.style.overflow = "";
                document.documentElement.style.overflow = "";
                setIsMobileMenuOpen(false);
                scrollToSearch(undefined, true);
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
              </svg>
              <span>Resumes</span>
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

      <main className="page-main" ref={mainRef}>
        <section className="hero-section" id="home">
          {/* Broad, soft, flowing blue & cyan aurora light bands across the hero */}
          <div className="hero-aurora-wrap" aria-hidden="true">
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
            <div className="aurora-band aurora-band-3" />
            <div className="aurora-band aurora-band-4" />
            <div className="aurora-ambient-glow" />
            <svg
              className="aurora-particles-svg"
              viewBox="0 0 900 700"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sparse micro-particles & luminous highlights along the aurora flow (Image 1 inspired) */}
              <circle cx="520" cy="220" r="1.5" fill="#BFD8E3" opacity="0.75" />
              <circle cx="580" cy="180" r="1.2" fill="#70d8ff" opacity="0.8" />
              <circle cx="470" cy="270" r="1.8" fill="#FFFFFF" opacity="0.85" className="particle-pulse-1" />
              <circle cx="650" cy="210" r="1.2" fill="#8CB9CC" opacity="0.6" />
              <circle cx="610" cy="140" r="1.5" fill="#BFD8E3" opacity="0.7" />
              <circle cx="430" cy="190" r="1.2" fill="#70d8ff" opacity="0.75" className="particle-pulse-2" />
              <circle cx="710" cy="170" r="1" fill="#8CB9CC" opacity="0.5" />
              <circle cx="550" cy="100" r="1.5" fill="#BFD8E3" opacity="0.65" />

              {/* Delicate warm luminous highlights at the focal base (Image 1 amber inspiration) */}
              <circle cx="560" cy="320" r="1.8" fill="#ffe2c4" opacity="0.7" className="particle-pulse-3" />
              <circle cx="600" cy="340" r="1.2" fill="#ffb885" opacity="0.6" />
              <circle cx="510" cy="350" r="1.5" fill="#ffe2c4" opacity="0.6" />

              {/* Dissolving upward specks */}
              <circle cx="630" cy="270" r="1.2" fill="#70d8ff" opacity="0.65" />
              <circle cx="420" cy="250" r="1" fill="#8CB9CC" opacity="0.45" />
              <circle cx="670" cy="120" r="1.2" fill="#BFD8E3" opacity="0.55" />
              <circle cx="380" cy="210" r="1" fill="#70d8ff" opacity="0.5" />
              <circle cx="620" cy="80" r="1.5" fill="#FFFFFF" opacity="0.75" className="particle-pulse-1" />
              <circle cx="490" cy="130" r="1.2" fill="#8CB9CC" opacity="0.45" />
              <circle cx="570" cy="60" r="1.2" fill="#BFD8E3" opacity="0.6" />
              <circle cx="450" cy="80" r="1.2" fill="#70d8ff" opacity="0.6" />
              <circle cx="660" cy="60" r="1" fill="#8CB9CC" opacity="0.4" />
            </svg>
          </div>
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="hero-line-mask">
                  <span className="hero-line-inner">AIML</span>
                </span>
                <span className="hero-line-mask">
                  <span className="hero-line-inner hero-accent">Batchfolio</span>
                </span>
              </h1>
              <p className="hero-description">
                A unified platform showcasing student profiles, skills, projects and achievements.
                Empowering the AI engineers and data visionaries of the Class of 2024–2028.
              </p>
            </div>
            <div className="hero-stats-grid reveal-on-scroll">
              <div className="stat-card">
                <div className="stat-icon-wrap branch-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="m14 9 3 3-3 3"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Branch</span>
                  <h3 className="stat-value">AIML</h3>
                  <p className="stat-sub">AI &amp; Machine Learning</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap batch-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Batch</span>
                  <h3 className="stat-value">2024–2028</h3>
                  <p className="stat-sub">4-Year B.E. Program</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap strength-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Strength</span>
                  <h3 className="stat-value" id="strength-counter"><CountUpStat target={63} /></h3>
                  <p className="stat-sub">Enrolled Students</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="search-section" id="search-section">
          <div className="search-wrapper">
            <div className="search-bar-row">
              <div className="search-input-container">
                <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <input type="text" id="student-search-input" className="search-input" placeholder="Search any students by name, USN, or skills..." autoComplete="off" />
                <button className="search-clear-btn" id="search-clear-btn" aria-label="Clear Search" style={{ display: "none" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </section>

        <section className="students-section reveal-on-scroll" id="students-grid-section">
          <div className="section-container section-spread">
            <div className="section-title-wrap">
              <h2 className="section-title">
                Class of 2024–2028 <span className="highlight-text">Profiles</span>
              </h2>
              <p className="section-desc">Click any student card to view their complete portfolio, projects, and contact credentials.</p>
            </div>
            <div className="students-grid" id="students-grid"></div>
            <div className="no-results-state" id="no-results" style={{ display: "none" }}>
              <div className="no-results-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.5 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3>No students found</h3>
              <p>
                We couldn&apos;t find any student matching your query. Try searching by USN (e.g. <code>4MT24AI001</code>), name, or clear filters.
              </p>
              <button className="btn btn-outline" id="reset-search-btn">Reset Search</button>
            </div>
          </div>
        </section>
      </main>

      <div className="modal-backdrop" id="student-modal" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-student" id="student-modal-dialog">
          <button className="modal-close-btn" id="close-student-modal" aria-label="Close Profile Modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-inner-card" id="student-modal-body"></div>
        </div>
      </div>

      <LoginModal
        onLoginSuccess={(user) => {
          const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00638E&color=FFFFFF&size=200`;
          setCurrentUser({ name: user.name, usn: user.usn, email: user.email, avatar: avatarFallback });

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
        <div className="modal-dialog modal-resumes">
          <button className="modal-close-btn" id="close-resumes-modal" aria-label="Close Resumes Modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="resumes-header">
            <h2 className="resumes-title">Batch 2024–2028 Resume Repository</h2>
            <p className="resumes-subtitle">Browse and download verified student curriculum vitae and technical portfolios.</p>
          </div>
          <div className="resumes-quick-search">
            <input type="text" id="resumes-filter-input" placeholder="Quick filter resumes by student name or USN..." />
          </div>
          <div className="resumes-list" id="resumes-list-container"></div>
        </div>
      </div>

      <div className="toast-container" id="toast-container"></div>

      <footer className="page-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/assets/web_icon.ico" alt="Batchfolio Logo" className="footer-logo" />
              <span className="footer-title">AIML Batchfolio</span>
            </div>
            <p className="footer-desc">
              Official digital portfolio platform for the Department of Artificial Intelligence &amp; Machine Learning (Batch 2024–2028), MITE. Managed in collaboration with ARTIFERA Student Forum.
            </p>
          </div>
          <div className="footer-links-group">
            <h4>Department Overview</h4>
            <p><strong>Department:</strong> AI &amp; Machine Learning</p>
            <p><strong>Strength:</strong> <span id="footer-strength">63</span> Enrolled Innovators</p>
            <p><strong>Batch:</strong> 2024 – 2028</p>
          </div>
          <div className="footer-links-group">
            <h4>Quick Access</h4>
            <ul>
              <li><a href="#home">Home Portal</a></li>
              <li><a href="#search-section">Search Students</a></li>
              <li><Link href="/resumes" id="footer-resumes-link">Resume Vault</Link></li>
              <li>
                <a
                  href="#open-login"
                  id="footer-login-link"
                  onClick={(event) => {
                    event.preventDefault();
                    openLogin();
                  }}
                >
                  Student Login
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024–2028 Department of AIML, MITE &amp; ARTIFERA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
