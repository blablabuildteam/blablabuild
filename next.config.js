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
    return [
      {
        source: '/tools/ai-matrix',
        destination: 'https://tools-lake-three.vercel.app/tools/ai-matrix',
        permanent: false,
      },
      {
        source: '/en/tools/ai-matrix',
        destination: 'https://tools-lake-three.vercel.app/tools/ai-matrix',
        permanent: false,
      },
      {
        source: '/tools/ai-matrix/:path*',
        destination: 'https://tools-lake-three.vercel.app/tools/ai-matrix/:path*',
        permanent: false,
      },
      {
        source: '/en/tools/ai-matrix/:path*',
        destination: 'https://tools-lake-three.vercel.app/tools/ai-matrix/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

