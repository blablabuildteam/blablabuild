import { NextRequest, NextResponse } from 'next/server';
import { hasApiKey, getApiKey, isOpenRouter, createOpenAIClient } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to test API key configuration
 * GET /api/debug/api-key
 */
export async function GET(req: NextRequest) {
  try {
    const hasKey = hasApiKey();
    const key = hasKey ? getApiKey() : null;
    const provider = isOpenRouter() ? 'OpenRouter' : 'OpenAI';
    
    // Try to create a client (this will throw if key is invalid)
    let clientCreated = false;
    let clientError: string | null = null;
    
    try {
      const client = createOpenAIClient();
      clientCreated = !!client;
    } catch (err: any) {
      clientError = err.message;
    }
    
    // Try a simple API call to verify the key works
    let apiTestSuccess = false;
    let apiTestError: string | null = null;
    
    if (clientCreated) {
      try {
        const client = createOpenAIClient();
        // Make a minimal test call
        await client.chat.completions.create({
          model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        });
        apiTestSuccess = true;
      } catch (err: any) {
        apiTestError = err.message || JSON.stringify(err);
      }
    }
    
    return NextResponse.json({
      hasApiKey: hasKey,
      apiKeyPrefix: key ? `${key.substring(0, 10)}...` : null,
      apiKeyLength: key?.length || 0,
      provider,
      clientCreated,
      clientError,
      apiTestSuccess,
      apiTestError,
      environment: {
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

