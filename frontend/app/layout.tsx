import type { Metadata } from "next";
import "../src/style.css";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "AIML Batchfolio | 2024-2028 Batch Portal",
  description:
    "A unified platform showcasing student profiles, skills, projects and achievements of the AIML 2024-2028 Batch.",
  icons: {
    icon: "/assets/artifera_logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Suppress unhandled runtime errors originating from third-party browser extensions (e.g. Mobile Simulator, crxemulator) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                function isExtensionError(err) {
                  if (!err) return false;
                  var msg = typeof err === 'string' ? err : (err.message || '');
                  var stack = err && err.stack ? err.stack : '';
                  return (
                    msg.indexOf('chrome: call method') !== -1 ||
                    msg.indexOf('Window message') !== -1 ||
                    msg.indexOf('crxemulator') !== -1 ||
                    stack.indexOf('chrome-extension://') !== -1 ||
                    stack.indexOf('moz-extension://') !== -1
                  );
                }
                window.addEventListener('unhandledrejection', function(event) {
                  if (isExtensionError(event.reason)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('error', function(event) {
                  if (
                    isExtensionError(event.error) ||
                    isExtensionError(event.message) ||
                    (event.filename && (event.filename.indexOf('chrome-extension://') !== -1 || event.filename.indexOf('moz-extension://') !== -1))
                  ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
