export type ContentStatus = 'DRAFT' | 'PUBLISHED';

export interface ContentItem {
  id: string;
  storyblokId: number;
  name: string;
  slug: string;
  status: ContentStatus;
  createdAt: string;
  publishedAt?: string;
}

export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  storyId: number;
  action: string;
  receivedAt: string;
}
