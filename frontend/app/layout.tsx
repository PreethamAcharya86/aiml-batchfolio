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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
