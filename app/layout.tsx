import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AIWidget from "@/components/AIWidget";
import PasswordGate from "@/components/PasswordGate";

const inter = Inter({ subsets: ["latin"] });

// Ligema custom font for playful loopy "blabla" logo
const loopySans = localFont({
  src: [{
    path: "../public/Ligema DEMO.otf",
    weight: "400",
    style: "normal",
  }],
  variable: '--font-loopy-sans',
  display: 'swap',
});

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
      <body className={`${inter.className} ${loopySans.variable}`}>
        <PasswordGate>
          {children}
          <AIWidget />
        </PasswordGate>
      </body>
    </html>
  );
}

