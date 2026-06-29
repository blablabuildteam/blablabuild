import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const KEY = (id: string) => `ai-matrix:${id.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
const TTL = 60 * 60 * 24 * 7; // 7 days

// KV is only usable when its connection env vars are present. Without them the
// @vercel/kv client throws, so we detect availability up front and degrade
// gracefully to a client-side (localStorage) fallback.
const KV_READY = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  if (!KV_READY) {
    return NextResponse.json({ useCases: [], kv: false });
  }
  try {
    const data = await kv.get(KEY(params.sessionId));
    return NextResponse.json({ useCases: data ?? [], kv: true });
  } catch {
    return NextResponse.json({ useCases: [], kv: false });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const useCase = await req.json();
  if (!KV_READY) {
    return NextResponse.json({ ok: false, kv: false });
  }
  try {
    const key = KEY(params.sessionId);
    const existing: unknown[] = (await kv.get(key)) ?? [];
    const updated = [...existing, useCase];
    await kv.set(key, updated, { ex: TTL });
    return NextResponse.json({ ok: true, kv: true, useCases: updated });
  } catch {
    return NextResponse.json({ ok: false, kv: false });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { id } = await req.json();
  if (!KV_READY) {
    return NextResponse.json({ ok: false, kv: false });
  }
  try {
    const key = KEY(params.sessionId);
    const existing: { id: string }[] = (await kv.get(key)) ?? [];
    const updated = existing.filter((uc) => uc.id !== id);
    await kv.set(key, updated, { ex: TTL });
    return NextResponse.json({ ok: true, kv: true, useCases: updated });
  } catch {
    return NextResponse.json({ ok: false, kv: false });
  }
}
