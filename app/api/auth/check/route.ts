import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'site_auth';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

export async function GET(req: NextRequest) {
  try {
    // If AUTH_TOKEN is not set, authentication is disabled
    if (!AUTH_TOKEN) {
      return NextResponse.json({
        authenticated: true, // Allow access when auth is disabled
      });
    }

    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

    const isAuthenticated = authCookie?.value === AUTH_TOKEN;

    return NextResponse.json({
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

