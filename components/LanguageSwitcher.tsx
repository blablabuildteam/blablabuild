'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/request';
import { useState, useEffect } from 'react';
import {
  buildLocaleSwitchPath,
  saveScrollForLocaleSwitch,
} from '@/lib/localeSwitch';

const localeNames: Record<Locale, string> = {
  nl: 'NL',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before accessing window
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    if (locale === newLocale) {
      return;
    }

    saveScrollForLocaleSwitch();
    const hash = isMounted && typeof window !== 'undefined' ? window.location.hash : '';
    const newPath = buildLocaleSwitchPath(newLocale, pathname, hash);
    router.push(newPath, { scroll: false });
    router.refresh();
  };

  // Calculate the position of the sliding indicator
  const activeIndex = locales.indexOf(locale);
  const isNL = activeIndex === 0;

  // Prevent hydration mismatch by not rendering indicator until mounted
  if (!isMounted) {
    return (
      <div className="relative inline-flex items-center">
        <div className="relative bg-gray-100 rounded-full p-1 border border-gray-300 shadow-sm flex items-center">
          {locales.map((loc) => (
            <button
              key={loc}
              className="relative px-4 py-1.5 rounded-full text-sm font-medium min-w-[44px] text-gray-700"
              disabled
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div className="relative bg-gray-100 rounded-full p-1 border border-gray-300 shadow-sm flex items-center">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 bg-bla-lime rounded-full transition-all duration-300 ease-in-out shadow-sm z-0"
          style={{
            left: isNL ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 4px)',
          }}
        />
        
        {/* Language buttons */}
        {locales.map((loc, index) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 min-w-[44px] ${
              locale === loc
                ? 'text-black font-semibold'
                : 'text-gray-700 hover:text-black'
            }`}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-pressed={locale === loc}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
