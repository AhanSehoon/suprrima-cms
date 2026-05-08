import 'server-only';
import { kv } from '@vercel/kv';
import type { WebhookEvent } from '@/types';

const KEY = 'cms-poc:events';
const MAX_EVENTS = 200;

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function appendEvent(event: WebhookEvent) {
  if (!isKvConfigured()) {
    throw new Error(
      'Vercel KV not configured. Connect a KV store in Vercel dashboard and run `vercel env pull .env.local`.',
    );
  }
  const score = new Date(event.receivedAt).getTime();
  await kv.zadd(KEY, { score, member: event });
  await kv.zremrangebyrank(KEY, 0, -MAX_EVENTS - 1);
}

export async function listEventsSince(since: number): Promise<WebhookEvent[]> {
  if (!isKvConfigured()) return [];
  const min = since > 0 ? `(${since}` : '-inf';
  const events = await kv.zrange<WebhookEvent[]>(KEY, min, '+inf', {
    byScore: true,
  });
  return events ?? [];
}
