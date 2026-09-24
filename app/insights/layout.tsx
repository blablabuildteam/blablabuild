import '../globals.css';

export const metadata = {
  title: 'Site insights · blablabuild',
  robots: 'noindex, nofollow',
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-[#f4f5f7] antialiased">{children}</body>
    </html>
  );
}
