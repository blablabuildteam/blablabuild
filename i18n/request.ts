import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { IntlErrorCode } from 'next-intl';

export const locales = ['nl', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'nl';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load messages
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to default locale if loading fails
    messages = (await import(`../messages/${defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages,
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Return a more helpful message for missing translations
        console.warn(`Missing translation: ${path} for locale: ${locale}`);
        return path; // Return the key path as fallback
      }
      
      return path;
    },
  };
});

