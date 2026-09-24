import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Private display names for the public site.
 * Disallowed in robots.txt + X-Robots-Tag so crawlers should not fetch/index this.
 * Humans still see the full name via client JS.
 */
const PRIVATE_NAMES: Record<string, string> = {
  kevin: 'Kevin Roos van Raadshooven',
};

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || '';
  const name = PRIVATE_NAMES[id];

  if (!name) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { id, name },
    {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}
