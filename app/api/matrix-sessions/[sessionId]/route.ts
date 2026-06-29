import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const KEY = (id: string) => `ai-matrix:${id.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
const TTL = 60 * 60 * 24 * 7; // 7 days

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const data = await kv.get(KEY(params.sessionId));
    return NextResponse.json({ useCases: data ?? [] });
  } catch {
    return NextResponse.json({ useCases: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const useCase = await req.json();
    const key = KEY(params.sessionId);
    const existing: unknown[] = (await kv.get(key)) ?? [];
    const updated = [...existing, useCase];
    await kv.set(key, updated, { ex: TTL });
    return NextResponse.json({ ok: true, useCases: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { id } = await req.json();
    const key = KEY(params.sessionId);
    const existing: { id: string }[] = (await kv.get(key)) ?? [];
    const updated = existing.filter((uc) => uc.id !== id);
    await kv.set(key, updated, { ex: TTL });
    return NextResponse.json({ ok: true, useCases: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
