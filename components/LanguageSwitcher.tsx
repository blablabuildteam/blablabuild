'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, type Locale, defaultLocale } from '@/i18n/request';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const localeNames: Record<Locale, string> = {
  nl: 'NL',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  // usePathname from next-intl returns pathname WITHOUT locale prefix
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: Locale) => {
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
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-text-primary hover:text-bla-blue transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span>{localeNames[locale]}</span>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white border border-black/10 rounded-lg shadow-lg z-50 min-w-[100px]">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  locale === loc
                    ? 'bg-bla-lime text-black font-semibold'
                    : 'text-text-primary hover:bg-gray-50'
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

