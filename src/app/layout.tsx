import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MODO Creator Verse | AI-Powered IP Creation Platform",
  description: "Transform your vision into production-ready IP Bibles. Generate characters, create worlds, build stories, and distribute to your audience with AI.",
  keywords: ["IP creation", "AI", "film production", "story generation", "character design", "Indonesia"],
  authors: [{ name: "MODO" }],
  openGraph: {
    title: "MODO Creator Verse",
    description: "AI-Powered IP Creation Platform for the Film Industry",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
