import { NextRequest, NextResponse } from 'next/server';
import { eventStore } from '@/lib/storage';
import { trackWidgetEvent } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/intake
 * Track intake form submissions and interactions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      action, 
      sessionId, 
      message, 
      suggestionId,
      messageLength 
    } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Track different intake actions
    switch (action) {
      case 'suggestion_selected':
        if (!suggestionId) {
          return NextResponse.json(
            { error: 'suggestionId is required for suggestion_selected action' },
            { status: 400 }
          );
        }
        
        await eventStore.insert({
          session_id: sessionId || 'anonymous',
          type: 'intake_suggestion_selected',
          payload: {
            suggestion_id: suggestionId,
            timestamp: new Date().toISOString(),
          },
        });

        if (sessionId) {
          trackWidgetEvent(sessionId, 'intake_suggestion_selected', {
            suggestion_id: suggestionId,
          });
        }
        break;

      case 'form_submitted':
        if (!message) {
          return NextResponse.json(
            { error: 'message is required for form_submitted action' },
            { status: 400 }
          );
        }

        await eventStore.insert({
          session_id: sessionId || 'anonymous',
          type: 'intake_form_submitted',
          payload: {
            message_length: messageLength || message.length,
            has_suggestion: !!suggestionId,
            suggestion_id: suggestionId,
            timestamp: new Date().toISOString(),
          },
        });

        if (sessionId) {
          trackWidgetEvent(sessionId, 'intake_form_submitted', {
            message_length: messageLength || message.length,
            has_suggestion: !!suggestionId,
          });
        }
        break;

      case 'page_view':
        await eventStore.insert({
          session_id: sessionId || 'anonymous',
          type: 'intake_page_view',
          payload: {
            timestamp: new Date().toISOString(),
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Intake event tracked successfully',
    });
  } catch (error: any) {
    console.error('Error tracking intake event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track intake event' },
      { status: 500 }
    );
  }
}
