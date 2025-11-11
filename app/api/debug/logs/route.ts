import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/debug/logs - Query application logs
 * 
 * Query parameters:
 * - level: Filter by log level (info, warn, error, debug)
 * - sessionId: Filter by session ID
 * - endpoint: Filter by endpoint
 * - limit: Number of logs to return (default: 100, max: 1000)
 * - offset: Pagination offset (default: 0)
 * - since: ISO timestamp to filter logs after
 * - before: ISO timestamp to filter logs before
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const level = searchParams.get('level');
    const sessionId = searchParams.get('sessionId');
    const endpoint = searchParams.get('endpoint');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const since = searchParams.get('since');
    const before = searchParams.get('before');

    // Build query
    let query = supabaseAdmin
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (level) {
      query = query.eq('level', level);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }

    if (since) {
      query = query.gte('created_at', since);
    }

    if (before) {
      query = query.lte('created_at', before);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin.from('logs').select('*', { count: 'exact', head: true });
    
    if (level) countQuery = countQuery.eq('level', level);
    if (sessionId) countQuery = countQuery.eq('session_id', sessionId);
    if (endpoint) countQuery = countQuery.eq('endpoint', endpoint);
    if (since) countQuery = countQuery.gte('created_at', since);
    if (before) countQuery = countQuery.lte('created_at', before);

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      logs: data || [],
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (totalCount || 0) > offset + limit,
      },
      filters: {
        level: level || null,
        sessionId: sessionId || null,
        endpoint: endpoint || null,
        since: since || null,
        before: before || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/debug/logs - Clear old logs
 * 
 * Query parameters:
 * - olderThan: ISO timestamp - delete logs older than this (required)
 * - level: Optional - only delete logs of this level
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const olderThan = searchParams.get('olderThan');
    const level = searchParams.get('level');

    if (!olderThan) {
      return NextResponse.json(
        { error: 'olderThan parameter is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('logs')
      .delete()
      .lt('created_at', olderThan);

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logs deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

