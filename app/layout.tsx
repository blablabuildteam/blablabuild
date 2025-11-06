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

