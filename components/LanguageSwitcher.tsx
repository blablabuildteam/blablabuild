'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, type Locale, defaultLocale } from '@/i18n/request';
import { useState, useEffect } from 'react';

const localeNames: Record<Locale, string> = {
  nl: 'NL',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('/');

  // Get the actual browser pathname (includes locale prefix if present)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Don't do anything if already on this locale
    if (locale === newLocale) {
      return;
    }
    
    // Get the actual browser pathname
    const browserPath = typeof window !== 'undefined' ? window.location.pathname : currentPath;
    
    // Extract path without locale prefix
    let pathWithoutLocale = browserPath;
    
    // Remove any existing locale prefix
    for (const loc of locales) {
      if (loc !== defaultLocale) {
        if (browserPath === `/${loc}`) {
          pathWithoutLocale = '/';
          break;
        } else if (browserPath.startsWith(`/${loc}/`)) {
          pathWithoutLocale = browserPath.replace(`/${loc}`, '') || '/';
          break;
        }
      }
    }
    
    // Ensure path starts with /
    if (!pathWithoutLocale || pathWithoutLocale === '') {
      pathWithoutLocale = '/';
    }
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }
    
    // Build new path based on target locale
    const newPath = newLocale === defaultLocale 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    
    // Navigate to the new path
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="relative inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 z-10 ${
            locale === loc
              ? 'bg-bla-lime text-black shadow-sm'
              : 'text-text-primary hover:text-bla-blue'
          }`}
          aria-label={`Switch to ${localeNames[loc]}`}
          aria-pressed={locale === loc}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
