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
    // Don't do anything if already on this locale
    if (locale === newLocale) {
      return;
    }
    
    // Get the current pathname (next-intl's usePathname might already strip the locale)
    let currentPath = pathname;
    
    // If pathname is empty or just '/', use '/'
    if (!currentPath || currentPath === '/') {
      currentPath = '/';
    }
    
    // Ensure path starts with /
    if (!currentPath.startsWith('/')) {
      currentPath = '/' + currentPath;
    }
    
    // Build new path based on target locale
    let newPath: string;
    
    if (newLocale === defaultLocale) {
      // Switching to default locale (NL) - no prefix needed
      // If we're coming from a non-default locale, pathname is already without prefix
      newPath = currentPath;
    } else {
      // Switching to non-default locale (EN) - add prefix
      // Remove any existing locale prefix first
      let cleanPath = currentPath;
      for (const loc of locales) {
        if (loc !== defaultLocale && cleanPath.startsWith(`/${loc}`)) {
          cleanPath = cleanPath.replace(`/${loc}`, '') || '/';
          break;
        }
      }
      newPath = `/${newLocale}${cleanPath}`;
    }
    
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
