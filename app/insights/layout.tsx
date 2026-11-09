export const metadata = {
  title: 'Site insights · blablabuild',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f4f5f7] antialiased">{children}</div>;
}
