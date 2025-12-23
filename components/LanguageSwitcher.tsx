'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, type Locale, defaultLocale } from '@/i18n/request';

const localeNames: Record<Locale, string> = {
  nl: 'NL',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Allow clicking even if already on this locale (no-op but still clickable)
    
    // Get the pathname without locale prefix
    let pathWithoutLocale = pathname;
    
    // Remove locale prefix if it exists (for non-default locales like /en)
    for (const loc of locales) {
      if (loc !== defaultLocale) {
        // Check if pathname starts with this locale
        if (pathname === `/${loc}`) {
          pathWithoutLocale = '/';
          break;
        } else if (pathname.startsWith(`/${loc}/`)) {
          pathWithoutLocale = pathname.replace(`/${loc}`, '') || '/';
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
    
    // Build new path: add locale prefix only for non-default locale
    const newPath = newLocale === defaultLocale 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    
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
