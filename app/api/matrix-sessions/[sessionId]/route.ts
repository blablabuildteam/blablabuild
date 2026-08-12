import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const KEY = (id: string) => `ai-matrix:${id.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
const TTL = 60 * 60 * 24 * 90; // 90 days — workshop boards need to outlive the follow-up window

const KV_READY = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

type UseCaseRecord = { id: string; [key: string]: unknown };

async function redisCommand(...args: string[]): Promise<unknown> {
  const res = await fetch(process.env.KV_REST_API_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

function parseHashEntries(entries: unknown): UseCaseRecord[] {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const useCases: UseCaseRecord[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    const raw = entries[i + 1];
    if (typeof raw !== 'string') continue;
    try {
      useCases.push(JSON.parse(raw) as UseCaseRecord);
    } catch {
      // skip malformed entries
    }
  }
  return useCases;
}

async function getUseCases(key: string): Promise<UseCaseRecord[]> {
  const keyType = await redisCommand('TYPE', key);
  if (keyType === 'hash') {
    return parseHashEntries(await redisCommand('HGETALL', key));
  }
  if (keyType === 'string') {
    const data = await kv.get<UseCaseRecord[]>(key);
    return data ?? [];
  }
  return [];
}

async function saveUseCase(key: string, useCase: UseCaseRecord): Promise<UseCaseRecord[]> {
  await redisCommand('HSET', key, useCase.id, JSON.stringify(useCase));
  await redisCommand('EXPIRE', key, String(TTL));
  return getUseCases(key);
}

async function removeUseCase(key: string, id: string): Promise<UseCaseRecord[]> {
  await redisCommand('HDEL', key, id);
  await redisCommand('EXPIRE', key, String(TTL));
  return getUseCases(key);
}

function freezeOriginalIfNeeded(prev: UseCaseRecord, next: UseCaseRecord): UseCaseRecord {
  if (prev.originalInput) return next;
  const copyChanged =
    String(prev.name ?? '') !== String(next.name ?? '') ||
    String(prev.description ?? '') !== String(next.description ?? '') ||
    String(prev.solution ?? '') !== String(next.solution ?? '');
  if (!copyChanged) return next;
  return {
    ...next,
    originalInput: {
      name: String(prev.name ?? ''),
      description: String(prev.description ?? ''),
      solution: prev.solution ? String(prev.solution) : undefined,
      label: prev.label ? String(prev.label) : undefined,
      knockout: prev.knockout,
      scores: prev.scores,
      savedAt: new Date().toISOString(),
    },
  };
}

async function updateUseCase(key: string, useCase: UseCaseRecord): Promise<UseCaseRecord[]> {
  const existing = await getUseCases(key);
  const prev = existing.find((uc) => uc.id === useCase.id);
  if (!prev) throw new Error('Not found');
  const merged = freezeOriginalIfNeeded(prev, { ...prev, ...useCase, id: useCase.id });
  await redisCommand('HSET', key, useCase.id, JSON.stringify(merged));
  await redisCommand('EXPIRE', key, String(TTL));
  return getUseCases(key);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  if (!KV_READY) {
    return NextResponse.json({ useCases: [], kv: false });
  }
  try {
    const key = KEY(params.sessionId);
    const useCases = await getUseCases(key);
    // Opening an active board renews retention so sessions don't silently expire.
    if (useCases.length > 0) {
      await redisCommand('EXPIRE', key, String(TTL));
    }
    return NextResponse.json({ useCases, kv: true });
  } catch {
    return NextResponse.json({ useCases: [], kv: false });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const useCase = (await req.json()) as UseCaseRecord;
  if (!KV_READY) {
    return NextResponse.json({ ok: false, kv: false });
  }
  try {
    const useCases = await saveUseCase(KEY(params.sessionId), useCase);
    return NextResponse.json({ ok: true, kv: true, useCases });
  } catch {
    return NextResponse.json({ ok: false, kv: false });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const useCase = (await req.json()) as UseCaseRecord;
  if (!KV_READY) {
    return NextResponse.json({ ok: false, kv: false });
  }
  try {
    const useCases = await updateUseCase(KEY(params.sessionId), useCase);
    return NextResponse.json({ ok: true, kv: true, useCases });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update';
    if (message === 'Not found') {
      return NextResponse.json({ ok: false, error: 'Not found', kv: true }, { status: 404 });
    }
    return NextResponse.json({ ok: false, kv: false });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { id } = (await req.json()) as { id: string };
  if (!KV_READY) {
    return NextResponse.json({ ok: false, kv: false });
  }
  try {
    const useCases = await removeUseCase(KEY(params.sessionId), id);
    return NextResponse.json({ ok: true, kv: true, useCases });
  } catch {
    return NextResponse.json({ ok: false, kv: false });
  }
}
