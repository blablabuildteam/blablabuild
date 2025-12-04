import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback - Record user feedback
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, rating, comment } = await req.json();

    if (!sessionId || !rating) {
      return NextResponse.json(
        { error: 'Session ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Store feedback as an event
    await supabaseAdmin.from('events').insert({
      session_id: sessionId,
      type: 'feedback',
      payload: {
        rating,
        comment,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
