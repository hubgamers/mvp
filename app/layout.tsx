import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { AuthToastListener } from "@/components/auth-toast-listener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HubGamers — Plateforme SaaS Esport & Tournois",
  description:
    "Organisez, diffusez et pilotez vos tournois eSport. Arbres de tournoi automatisés, studio d'overlay broadcast OBS, gestion des équipes et arbitrage en direct.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-cyan selection:text-brand-ink">
        <Suspense fallback={null}>
          <AuthToastListener />
        </Suspense>
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            className: "glass-panel text-sm font-medium border-white/10 shadow-xl",
          }}
        />
      </body>
    </html>
  );
}
