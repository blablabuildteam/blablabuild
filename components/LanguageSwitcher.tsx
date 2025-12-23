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
    // Don't switch if already on this locale
    if (newLocale === locale) return;
    
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
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            locale === loc
              ? 'bg-bla-lime text-black shadow-sm'
              : 'text-text-primary hover:text-bla-blue hover:bg-white/5'
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
