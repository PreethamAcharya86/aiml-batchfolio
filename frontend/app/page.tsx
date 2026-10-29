"use client";

import { useEffect, useState } from "react";

type LoadState = "loading" | "ready" | "error";

declare global {
  interface Window {
    BATCHFOLIO_API_BASE?: string;
  }
}

export default function HomePage() {
  const [markup, setMarkup] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadLegacyMarkup() {
      try {
        const response = await fetch("/legacy/index.html");
        if (!response.ok) {
          throw new Error(`Could not load the Batchfolio page (${response.status}).`);
        }

        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, "text/html");
        parsed.body.querySelectorAll("script").forEach((script) => script.remove());
        const pageMarkup = parsed.body.innerHTML;

        if (active) {
          document.body.classList.add("dark-theme");
          window.BATCHFOLIO_API_BASE =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
          setMarkup(pageMarkup);
          setLoadState("ready");
        }
      } catch (error) {
        console.error("Failed to load the Batchfolio interface:", error);
        if (active) setLoadState("error");
      }
    }

    void loadLegacyMarkup();

    return () => {
      active = false;
      document.body.classList.remove("dark-theme");
    };
  }, []);

  useEffect(() => {
    if (loadState !== "ready" || document.getElementById("batchfolio-app-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "batchfolio-app-script";
    script.type = "module";
    script.src = "/legacy/app.js";
    script.onerror = () => {
      console.error("Failed to load the Batchfolio application module.");
    };
    document.body.appendChild(script);
  }, [loadState]);

  if (loadState === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Batchfolio could not be loaded</h1>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      </main>
    );
  }

  if (loadState === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <p>Loading AIML Batchfolio…</p>
      </main>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
