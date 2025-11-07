import { NextRequest, NextResponse } from 'next/server';
import { ReinforcementLearning } from '@/lib/reinforcement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics - Get analytics and insights
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        const patterns = await ReinforcementLearning.analyzeConversationPatterns();
        return NextResponse.json(patterns);

      case 'improvements':
        const improvements = await ReinforcementLearning.suggestImprovements();
        return NextResponse.json({ improvements });

      case 'session':
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }
        const metrics = await ReinforcementLearning.calculateMetrics(sessionId);
        return NextResponse.json(metrics);

      case 'abtest':
        const testId = searchParams.get('testId');
        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }
        const results = await ReinforcementLearning.getABTestResults(testId);
        return NextResponse.json(results);

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics - Create A/B test
 */
export async function POST(req: NextRequest) {
  try {
    const { step, questionA, questionB } = await req.json();

    if (!step || !questionA || !questionB) {
      return NextResponse.json(
        { error: 'Step and both question variants are required' },
        { status: 400 }
      );
    }

    const testId = await ReinforcementLearning.createABTest(step, questionA, questionB);

    return NextResponse.json({ testId, success: true });
  } catch (error: any) {
    console.error('Error creating A/B test:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

