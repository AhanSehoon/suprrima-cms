import { NextRequest, NextResponse } from 'next/server';
import { listEventsSince } from '@/lib/events-store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const since = Number(req.nextUrl.searchParams.get('since') ?? '0');
  const events = await listEventsSince(Number.isFinite(since) ? since : 0);
  return NextResponse.json({ events, now: Date.now() });
}
