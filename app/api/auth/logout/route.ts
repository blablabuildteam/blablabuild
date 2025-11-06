import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'site_auth';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

    // Clear authentication cookie
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

