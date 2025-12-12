import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "blablabuild | AI Innovaties voor Snelle Groei",
  description: "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
  keywords: "AI, automatisering, business transformation, data, tech",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

