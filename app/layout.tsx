import { getLocale } from 'next-intl/server';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Mono accent for labels, indices and readouts. Headlines and body stay on the brand faces.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
