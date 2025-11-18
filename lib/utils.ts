import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import OpenAI from "openai"
import { Slots } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Key utilities
export function hasApiKey(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
}

export function getApiKey(): string {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY
  }
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY
  }
  throw new Error('No API key found. Please set OPENROUTER_API_KEY or OPENAI_API_KEY')
}

export function isOpenRouter(): boolean {
  return !!process.env.OPENROUTER_API_KEY
}

export function createOpenAIClient(): OpenAI {
  const apiKey = getApiKey()
  return new OpenAI({
    apiKey,
    baseURL: isOpenRouter() 
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.openai.com/v1',
    defaultHeaders: isOpenRouter() ? {
      'HTTP-Referer': getAppUrl(),
      'X-Title': 'blablabuild',
    } : {},
  })
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

// Text utilities
export function sanitizeText(text: string): string {
  return text.trim().replace(/[<>]/g, '')
}

// Progress calculation
export function calculateProgress(slots: Slots): number {
  const slotKeys = Object.keys(slots) as Array<keyof Slots>
  if (slotKeys.length === 0) return 0
  
  const filledSlots = slotKeys.filter(key => {
    const value = slots[key]
    return value !== undefined && value !== null && value !== ''
  }).length
  
  return Math.round((filledSlots / slotKeys.length) * 100)
}

// Question calculation
export function calculateMaxQuestions(slots: Slots, messages: Array<{ role: string; content: string }>, userMessages: number): number {
  const slotCount = Object.keys(slots).length
  const baseMax = Math.max(5, Math.min(10, slotCount))
  
  // Increase max if conversation is complex
  const hasLongMessages = messages.some(m => m.content.length > 200)
  const complexityBonus = hasLongMessages ? 2 : 0
  
  return baseMax + complexityBonus
}

export function isSimpleTask(messages: Array<{ role: string; content: string }>, slots: Slots): boolean {
  // Simple task if:
  // - Few messages
  // - Short messages
  // - Few slots filled
  const avgMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(messages.length, 1)
  const filledSlots = Object.values(slots).filter(v => v !== undefined && v !== null && v !== '').length
  
  return messages.length <= 5 && avgMessageLength < 100 && filledSlots <= 3
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
