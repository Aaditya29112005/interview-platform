import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { NavBar } from "@/components/nav-bar";
import { CustomCursor } from "@/components/custom-cursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewOS AI — The World's Most Advanced AI Interview Platform",
  description: "Prepare for top-tier technical interviews with real-time AI voice coaching, adaptive questioning, code sandboxes, and forensic performance analytics. Used by engineers at Google, Stripe, and Vercel.",
  keywords: "AI interview, technical interview prep, voice AI, coding interview, system design, Google interview, Stripe engineer",
  openGraph: {
    title: "InterviewOS AI — Flagship AI Interview Platform",
    description: "The most advanced AI-powered interview preparation platform ever built.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#020305] text-[#D7DEE8] font-sans selection:bg-[#7DD3FC]/20 selection:text-white">
        <AuthProvider>
          <CustomCursor />
          <NavBar />
          <main className="flex-1 flex flex-col pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
