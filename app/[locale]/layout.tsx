import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import "../globals.css";
import PasswordGate from "@/components/PasswordGate";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  const messages = await getMessages({ locale });
  const t = messages.metadata as any;
  const socialTitle = "Talk Less, Build More";
  const socialImagePath = "/img/Preview%20image%201.png";

  return {
    metadataBase: new URL("https://blablabuild.com"),
    title: socialTitle,
    description: t?.description || "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
    keywords: t?.keywords || "AI, automatisering, business transformation, data, tech",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: socialTitle,
      description: t?.description || "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
      images: [
        {
          url: socialImagePath,
          width: 1024,
          height: 537,
          alt: "Talk Less, Build More",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: t?.description || "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
      images: [socialImagePath],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  // Ensure messages are loaded
  if (!messages || typeof messages !== 'object') {
    console.error('Messages not loaded correctly for locale:', locale);
  } else {
    // Debug: Log that messages are loaded
    console.log('Messages loaded for locale:', locale, 'Has hero?', !!messages.hero);
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

