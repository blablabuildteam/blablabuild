import { locales, defaultLocale } from '@/i18n/request';

// Root layout that redirects to locale-specific route
// The actual layout with metadata is in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This should not be reached due to middleware, but just in case
  return children;
}
