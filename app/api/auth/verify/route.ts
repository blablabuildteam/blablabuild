import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const AUTH_COOKIE_NAME = 'site_auth';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!SITE_PASSWORD || !AUTH_TOKEN) {
  throw new Error('Missing required environment variables: SITE_PASSWORD or AUTH_TOKEN');
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    if (password === SITE_PASSWORD) {
      // Set authentication cookie
      const response = NextResponse.json({ 
        success: true,
        message: 'Authentication successful' 
      });

      // Set cookie that expires in 7 days
      response.cookies.set(AUTH_COOKIE_NAME, AUTH_TOKEN as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

