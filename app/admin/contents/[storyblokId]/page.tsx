'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { StoryblokStory } from '@/types';

export default function ContentDetailPage({
  params,
}: {
  params: { storyblokId: string };
}) {
  const { storyblokId } = params;
  const [story, setStory] = useState<StoryblokStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/contents/${storyblokId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'fetch failed');
        if (!cancelled) setStory(data.story);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storyblokId]);

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 24 }}>
      <Link href="/admin/contents">← 목록</Link>
      <h1 style={{ marginTop: 12 }}>컨텐츠 상세</h1>

      {loading && <p>로딩 중...</p>}

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#fee',
            color: '#900',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          오류: {error}
        </div>
      )}

      {story && (
        <div style={card}>
          <dl style={dl}>
            <dt style={dt}>ID</dt>
            <dd style={dd}>{story.id}</dd>
            <dt style={dt}>이름</dt>
            <dd style={dd}>{story.name}</dd>
            <dt style={dt}>슬러그</dt>
            <dd style={dd}>{story.slug}</dd>
            <dt style={dt}>전체 슬러그</dt>
            <dd style={dd}>{story.full_slug}</dd>
            <dt style={dt}>발행 상태</dt>
            <dd style={dd}>
              {story.published_at ? (
                <span style={{ color: '#0a7a0a' }}>
                  발행됨 ({new Date(story.published_at).toLocaleString('ko-KR')})
                </span>
              ) : (
                <span style={{ color: '#b06000' }}>초안 (Draft)</span>
              )}
            </dd>
            <dt style={dt}>생성일</dt>
            <dd style={dd}>{new Date(story.created_at).toLocaleString('ko-KR')}</dd>
            <dt style={dt}>수정일</dt>
            <dd style={dd}>{new Date(story.updated_at).toLocaleString('ko-KR')}</dd>
          </dl>

          <h3 style={{ marginTop: 32, marginBottom: 8 }}>컨텐츠 (raw JSON)</h3>
          <pre style={pre}>{JSON.stringify(story.content, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

const card: React.CSSProperties = {
  marginTop: 24,
  background: 'white',
  padding: 24,
  borderRadius: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const dl: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px 1fr',
  gap: '8px 16px',
  margin: 0,
};

const dt: React.CSSProperties = { color: '#666', fontSize: 13 };
const dd: React.CSSProperties = { margin: 0, fontSize: 14 };

const pre: React.CSSProperties = {
  background: '#f8f8f8',
  padding: 16,
  borderRadius: 6,
  overflowX: 'auto',
  fontSize: 12,
  margin: 0,
  border: '1px solid #eee',
};
