import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://careerengine.dev"),
  title: "CareerEngine | CS Career Architect",
  description: "Technical career preparation workspace for computer science candidates. ATS resume audit, technical interview simulations, portfolio architecture designs, and application tracking.",
  keywords: "Software Engineer, ATS Resume Audit, System Design, Technical Interview Preparation, Computer Science Career",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
        <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
      </head>
      <body className="antialiased transition-colors duration-200">
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
