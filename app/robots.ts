import { NextResponse } from 'next/server';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/insights', '/api/insights/', '/api/team-display', '/api/auth/'],
      },
    ],
  };
}
