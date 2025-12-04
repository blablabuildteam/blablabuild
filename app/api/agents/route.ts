import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/agents - Get agent info (simplified)
 */
export async function GET(req: NextRequest) {
  // Return simple info about the AI system
  return NextResponse.json({
    agent: {
      name: 'Senior AI Intake Analist',
      description: 'AI intake assistent voor MKB advies',
      type: 'gemini',
    },
    status: 'active',
  });
}
