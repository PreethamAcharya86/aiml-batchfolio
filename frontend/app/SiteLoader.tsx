"use client";

import { useEffect, useState } from "react";

interface SiteLoaderProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

export default function SiteLoader({
  isLoading,
  title = "AIML Batchfolio",
  subtitle = "Class of 2024–2028",
}: SiteLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFading(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`site-preloader-viewport ${fading ? "preloader-hidden" : ""}`}
      role="status"
      aria-label="Loading Portal"
    >
      <div className="profile-loader-card site-preloader-card">
        <div className="loader-portal">
          <div className="portal-ring ring-outer"></div>
          <div className="portal-ring ring-inner"></div>
          <div className="portal-core site-portal-core">
            <img
              src="/assets/web_icon.ico"
              alt="AIML Batchfolio"
              className="site-loader-icon"
            />
          </div>
        </div>
        <div className="loader-text-box">
          <div className="loader-title">{title}</div>
          <div className="site-loader-subtitle">{subtitle}</div>
          <div className="loader-progress-track">
            <div className="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
