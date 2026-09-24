import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieValue,
  isAuthConfigured,
} from '@/lib/site-auth';

export async function POST(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Authentication not configured',
      });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (password !== process.env.SITE_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const cookieValue = getAuthCookieValue();
    if (!cookieValue) {
      return NextResponse.json({ error: 'Auth misconfigured' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });

    response.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
