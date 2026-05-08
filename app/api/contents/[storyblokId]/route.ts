import { NextRequest, NextResponse } from 'next/server';
import { getStory } from '@/lib/storyblok';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { storyblokId: string } },
) {
  const id = Number(params.storyblokId);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  try {
    const { story } = await getStory(id);
    return NextResponse.json({ story });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
