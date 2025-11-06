import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import AIWidget from "@/components/AIWidget";
import PasswordGate from "@/components/PasswordGate";

const inter = Inter({ subsets: ["latin"] });

// Caveat font for playful loopy "blabla" logo
const loopySans = Caveat({ 
  weight: "400",
  subsets: ["latin"],
  variable: '--font-loopy-sans',
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

