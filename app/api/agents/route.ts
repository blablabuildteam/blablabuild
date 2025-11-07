import { NextRequest, NextResponse } from 'next/server';
import { agentRegistry } from '@/lib/agents';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/agents - Get agent statistics and performance
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        const stats = agentRegistry.getStats();
        const allAgents = agentRegistry.getAllAgents().map(a => ({
          role: a.role,
          name: a.name,
          description: a.description,
          triggers: a.triggers,
          priority: a.priority,
        }));

        return NextResponse.json({
          agents: allAgents,
          stats,
        });

      case 'performance':
        const { data: performance } = await supabaseAdmin
          .from('agent_performance')
          .select('*')
          .order('total_executions', { ascending: false });

        return NextResponse.json({ performance });

      case 'analytics':
        const { data: analytics } = await supabaseAdmin
          .from('agent_analytics')
          .select('*')
          .limit(100);

        return NextResponse.json({ analytics });

      case 'session':
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }

        const { data: sessionAgents } = await supabaseAdmin
          .from('session_agent_activity')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        const { data: executions } = await supabaseAdmin
          .from('agent_executions')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        return NextResponse.json({
          summary: sessionAgents,
          executions,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error fetching agent data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

