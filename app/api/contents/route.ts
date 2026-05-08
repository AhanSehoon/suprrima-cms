import { NextRequest, NextResponse } from 'next/server';
import { createEmptyStory } from '@/lib/storyblok';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name: string = body.name ?? `New Content ${Date.now()}`;
  const slug: string = body.slug ?? `content-${Date.now()}`;

  try {
    const { story } = await createEmptyStory(name, slug);
    return NextResponse.json({
      storyblokId: story.id,
      name: story.name,
      slug: story.slug,
      createdAt: story.created_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
