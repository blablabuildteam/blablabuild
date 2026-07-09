import { locales, defaultLocale, type Locale } from '@/i18n/request';

export const LOCALE_SCROLL_KEY = 'blablabuild-locale-scroll-y';

export function stripLocaleFromPath(pathname: string): string {
  for (const loc of locales) {
    if (loc !== defaultLocale) {
      if (pathname === `/${loc}`) return '/';
      if (pathname.startsWith(`/${loc}/`)) {
        return pathname.slice(`/${loc}`.length) || '/';
      }
    }
  }

  return pathname || '/';
}

export function buildLocaleSwitchPath(
  newLocale: Locale,
  pathname: string,
  hash: string = ''
): string {
  const pathWithoutLocale = stripLocaleFromPath(pathname);
  const base =
    newLocale === defaultLocale
      ? pathWithoutLocale
      : pathWithoutLocale === '/'
        ? `/${newLocale}`
        : `/${newLocale}${pathWithoutLocale}`;

  return `${base}${hash}`;
}

export function saveScrollForLocaleSwitch(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LOCALE_SCROLL_KEY, String(window.scrollY));
}

export function restoreLocaleScroll(): void {
  if (typeof window === 'undefined') return;

  const raw = sessionStorage.getItem(LOCALE_SCROLL_KEY);
  if (!raw) return;

  sessionStorage.removeItem(LOCALE_SCROLL_KEY);
  const y = Number(raw);
  if (Number.isNaN(y)) return;

  const scroll = () => window.scrollTo({ top: y, left: 0 });
  scroll();
  requestAnimationFrame(scroll);
  window.setTimeout(scroll, 0);
  window.setTimeout(scroll, 100);
  window.setTimeout(scroll, 300);
}
