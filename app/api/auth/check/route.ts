import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieValue, isAuthConfigured, isSiteAuthed } from '@/lib/site-auth';

export async function GET() {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: await isSiteAuthed() });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
