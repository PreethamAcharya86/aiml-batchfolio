"use client";

import { useEffect, useState } from "react";

let initialSiteLoaded = false;

export function markSiteLoaded() {
  initialSiteLoaded = true;
}

export function hasSiteLoaded() {
  return initialSiteLoaded;
}

interface SiteLoaderProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

export default function SiteLoader({ isLoading }: SiteLoaderProps) {
  const [visible, setVisible] = useState(isLoading);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!visible) return;
      setFading(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFading(false);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div
      className={`site-preloader-viewport ${fading ? "preloader-hidden" : ""}`}
      role="status"
      aria-label="Loading Portal"
    >
      {/* Only the web_icon and surrounding load animation — no square box */}
      <div className="site-portal-loader-wrap">
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
      </div>
    </div>
  );
}
