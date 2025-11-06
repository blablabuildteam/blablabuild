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
  return Math.round((filled.length / requiredSlots.length) * 100);
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

