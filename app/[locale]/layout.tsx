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

  return {
    title: t?.title || "blablabuild | AI Innovaties voor Snelle Groei",
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
      title: t?.title || "blablabuild | AI Innovaties voor Snelle Groei",
      description: t?.description || "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
      images: [
        {
          url: "/img/preview-image.jpg",
          width: 1200,
          height: 630,
          alt: "blablabuild - talk less, build more",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t?.title || "blablabuild | AI Innovaties voor Snelle Groei",
      description: t?.description || "We transformeren complexiteit naar flow. AI-gedreven oplossingen voor moderne bedrijven.",
      images: ["/img/preview-image.jpg"],
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

