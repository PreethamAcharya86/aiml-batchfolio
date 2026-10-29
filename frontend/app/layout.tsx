import type { Metadata } from "next";
import "../src/style.css";
import "./globals.css";

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
      </head>
      <body>{children}</body>
    </html>
  );
}
