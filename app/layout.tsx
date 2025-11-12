import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIWidget from "@/components/AIWidget";
import PasswordGate from "@/components/PasswordGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "blablabuild | AI & Automatisering voor Snelle Groei",
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
      <body className={inter.className}>
        <PasswordGate>
          {children}
          <AIWidget />
        </PasswordGate>
      </body>
    </html>
  );
}

