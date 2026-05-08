import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { appendEvent } from '@/lib/events-store';

export const runtime = 'nodejs';

interface StoryblokWebhookPayload {
  text?: string;
  action?: string;
  story_id?: number | string;
  space_id?: number | string;
  full_slug?: string;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.STORYBLOK_WEBHOOK_SECRET;

  if (secret) {
    const sig = req.headers.get('webhook-signature');
    const expected = crypto.createHmac('sha1', secret).update(raw).digest('hex');
    if (!sig || sig !== expected) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  }

  let payload: StoryblokWebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const action = payload.action ?? 'unknown';
  const storyId = Number(payload.story_id ?? 0);

  if (storyId > 0) {
    await appendEvent({
      id: crypto.randomUUID(),
      storyId,
      action,
      receivedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
