// Root layout - minimal wrapper
// The actual layout with metadata is in app/[locale]/layout.tsx
// Middleware handles routing to locale-specific routes
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
