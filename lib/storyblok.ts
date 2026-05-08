import 'server-only';
import type { StoryblokStory } from '@/types';

const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const OAUTH_TOKEN = process.env.STORYBLOK_OAUTH_TOKEN;
const MAPI_BASE = 'https://mapi.storyblok.com/v1';

function assertConfig() {
  if (!SPACE_ID || !OAUTH_TOKEN) {
    throw new Error(
      'STORYBLOK_SPACE_ID and STORYBLOK_OAUTH_TOKEN must be set in .env.local',
    );
  }
}

async function mapi<T>(path: string, init?: RequestInit): Promise<T> {
  assertConfig();
  const res = await fetch(`${MAPI_BASE}/spaces/${SPACE_ID}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: OAUTH_TOKEN!,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storyblok ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function createEmptyStory(name: string, slug: string) {
  const body = {
    story: {
      name,
      slug,
      content: { component: 'page', body: [] },
    },
  };
  return mapi<{ story: StoryblokStory }>('/stories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getStory(storyId: number) {
  return mapi<{ story: StoryblokStory }>(`/stories/${storyId}`);
}
