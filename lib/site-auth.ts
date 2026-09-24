import { createHash } from 'crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'site_auth';

/** Cookie value used after successful password entry. */
export function getAuthCookieValue(): string | null {
  const token = process.env.AUTH_TOKEN || process.env.SITE_PASSWORD;
  if (!token) return null;
  // Don't store raw password in cookie when AUTH_TOKEN is missing — hash it.
  if (process.env.AUTH_TOKEN) return process.env.AUTH_TOKEN;
  return createHash('sha256').update(`blablabuild:${token}`).digest('hex').slice(0, 48);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

export async function isSiteAuthed(): Promise<boolean> {
  if (!isAuthConfigured()) return true;
  const expected = getAuthCookieValue();
  if (!expected) return true;
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value === expected;
}
