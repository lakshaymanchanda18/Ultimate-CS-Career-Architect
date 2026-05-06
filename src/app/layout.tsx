import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerEngine - CS Student Hub",
  description: "Ultimate CS Career Architect for Tier-1 MNCs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
