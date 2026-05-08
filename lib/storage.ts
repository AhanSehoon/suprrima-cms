'use client';

import type { ContentItem, ContentStatus } from '@/types';

const KEY = 'cms-poc:contents';
const LAST_EVENT_KEY = 'cms-poc:lastEventAt';

export function listContents(): ContentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ContentItem[];
  } catch {
    return [];
  }
}

export function saveContents(items: ContentItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addContent(item: ContentItem) {
  const items = listContents();
  items.unshift(item);
  saveContents(items);
}

export function updateStatusByStoryblokId(
  storyblokId: number,
  status: ContentStatus,
  publishedAt?: string,
) {
  const items = listContents();
  const next = items.map((c) =>
    c.storyblokId === storyblokId
      ? { ...c, status, publishedAt: publishedAt ?? c.publishedAt }
      : c,
  );
  saveContents(next);
}

export function getLastEventCheckedAt(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(LAST_EVENT_KEY) ?? '0');
}

export function setLastEventCheckedAt(t: number) {
  localStorage.setItem(LAST_EVENT_KEY, String(t));
}
