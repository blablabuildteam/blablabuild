const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  transpilePackages: ['@react-three/fiber', '@react-three/drei'],
  async redirects() {
    // Live site sends the matrix to the tools host. Keep it on localhost in `next dev`.
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      {
        source: '/tools/ai-matrix',
        destination: 'https://tools.blablabuild.com/tools/ai-matrix',
        permanent: false,
      },
      {
        source: '/en/tools/ai-matrix',
        destination: 'https://tools.blablabuild.com/tools/ai-matrix',
        permanent: false,
      },
      {
        source: '/tools/ai-matrix/:path*',
        destination: 'https://tools.blablabuild.com/tools/ai-matrix/:path*',
        permanent: false,
      },
      {
        source: '/en/tools/ai-matrix/:path*',
        destination: 'https://tools.blablabuild.com/tools/ai-matrix/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

