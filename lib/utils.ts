import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeText(text: string): string {
  // Basic PII redaction patterns
  const patterns = [
    { regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replace: '[EMAIL]' },
    { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replace: '[PHONE]' },
    { regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, replace: '[SSN]' },
  ];
  
  let sanitized = text;
  patterns.forEach(({ regex, replace }) => {
    sanitized = sanitized.replace(regex, replace);
  });
  
  return sanitized;
}

export function calculateProgress(slots: any): number {
  const requiredSlots = [
    'industry',
    'goal',
    'pain_points',
    'score_lead_gen',
    'score_conversion',
    'data_integration',
    'goal_short_term',
  ];
  
  const filled = requiredSlots.filter(slot => slots[slot] !== undefined && slots[slot] !== null);
  const baseProgress = Math.round((filled.length / requiredSlots.length) * 100);
  
  // Cap progress at 70% until we have enough information
  // This prevents premature completion
  return Math.min(baseProgress, 70);
}

export function formatCurrency(amount: number, locale: string = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get OpenAI/OpenRouter API key, trimming any whitespace/newlines
 * Throws an error if no API key is found
 * Auto-detects provider based on key format
 */
export function getApiKey(): string {
  // Check OpenRouter first
  if (process.env.OPENROUTER_API_KEY) {
    const key = process.env.OPENROUTER_API_KEY.trim();
    // If it's a valid OpenRouter key format, use it
    if (key.startsWith('sk-or-v1-')) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API Key] Found OpenRouter key: ${key.substring(0, 15)}... (length: ${key.length})`);
      }
      return key;
    }
    // If it looks like OpenAI key but set as OPENROUTER_API_KEY, warn and use it as OpenAI
    if (key.startsWith('sk-')) {
      console.warn('[API Key] OPENROUTER_API_KEY contains OpenAI-formatted key. Consider using OPENAI_API_KEY instead.');
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API Key] Using as OpenAI key: ${key.substring(0, 10)}... (length: ${key.length})`);
      }
      return key;
    }
  }
  
  // Fall back to OpenAI key
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      'Missing API key: Please set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable. ' +
      'Get your key from https://openrouter.ai/keys or https://platform.openai.com/api-keys'
    );
  }
  const trimmed = key.trim();
  
  // Debug logging (only log first few chars for security)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API Key] Found OpenAI key: ${trimmed.substring(0, 10)}... (length: ${trimmed.length})`);
  }
  
  return trimmed;
}

/**
 * Check if API key is available (without throwing)
 */
export function hasApiKey(): boolean {
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  return !!key && !!key.trim();
}

/**
 * Check if OpenRouter is being used
 * Auto-detects based on key format if OPENROUTER_API_KEY is set but key looks like OpenAI
 */
export function isOpenRouter(): boolean {
  // If OPENROUTER_API_KEY is explicitly set, check if it's actually an OpenRouter key
  if (process.env.OPENROUTER_API_KEY) {
    const key = process.env.OPENROUTER_API_KEY.trim();
    // OpenRouter keys start with "sk-or-v1-", OpenAI keys start with "sk-"
    if (key.startsWith('sk-or-v1-')) {
      return true; // Valid OpenRouter key
    } else if (key.startsWith('sk-')) {
      // Looks like OpenAI key but set as OPENROUTER_API_KEY - warn and treat as OpenAI
      console.warn('[Utils] OPENROUTER_API_KEY appears to be an OpenAI key (starts with "sk-" not "sk-or-v1-"). Using OpenAI endpoint instead.');
      return false;
    }
    return true; // Assume OpenRouter if format is unknown
  }
  return false; // No OPENROUTER_API_KEY set, use OpenAI
}

/**
 * Get the app URL for OpenRouter headers, with fallback
 */
export function getAppUrl(): string {
  // Try NEXT_PUBLIC_APP_URL first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim();
  }
  
  // Try Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to a valid default
  return 'https://blablabuild.com';
}

/**
 * Create OpenAI client instance (lazy initialization)
 * Throws error if API key is not configured
 */
export function createOpenAIClient(): import('openai').OpenAI {
  if (!hasApiKey()) {
    throw new Error(
      'AI API key not configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable.\n' +
      'Get your key from: https://openrouter.ai/keys (recommended) or https://platform.openai.com/api-keys'
    );
  }
  
  const OpenAI = require('openai').default;
  const apiKey = getApiKey();
  const baseURL = isOpenRouter() 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1';
  
  // Debug logging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OpenAI Client] Creating client with baseURL: ${baseURL}`);
    console.log(`[OpenAI Client] API key prefix: ${apiKey.substring(0, 10)}...`);
  }
  
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    defaultHeaders: isOpenRouter() ? {
      'HTTP-Referer': getAppUrl(),
      'X-Title': 'blablabuild',
    } : {},
  });
  
  return client;
}

