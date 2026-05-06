import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "CareerEngine | Ultimate CS Career Architect",
  description: "AI-powered career intelligence for CS students. Optimize your resume for ATS, generate high-impact projects, and track your job applications all in one platform.",
  keywords: "CS Career, ATS Resume, Software Engineering Projects, Interview Prep, AI Career Coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f7f9fb" />
      </head>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
