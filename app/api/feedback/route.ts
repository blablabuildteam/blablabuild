import { NextRequest, NextResponse } from 'next/server';
import { ReinforcementLearning } from '@/lib/reinforcement';

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

    await ReinforcementLearning.recordFeedback(sessionId, rating, comment);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

