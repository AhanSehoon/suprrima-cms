'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { ContentItem } from '@/types';
import {
  listContents,
  addContent,
  updateStatusByStoryblokId,
  getLastEventCheckedAt,
  setLastEventCheckedAt,
} from '@/lib/storage';

export default function ContentListPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => setItems(listContents()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const since = getLastEventCheckedAt();
        const res = await fetch(`/api/events?since=${since}`);
        if (!res.ok) return;
        const { events, now } = (await res.json()) as {
          events: { storyId: number; action: string; receivedAt: string }[];
          now: number;
        };
        let changed = false;
        for (const ev of events) {
          if (ev.action === 'published') {
            updateStatusByStoryblokId(ev.storyId, 'PUBLISHED', ev.receivedAt);
            changed = true;
          } else if (ev.action === 'unpublished') {
            updateStatusByStoryblokId(ev.storyId, 'DRAFT');
            changed = true;
          }
        }
        if (changed) refresh();
        setLastEventCheckedAt(now);
      } catch {
        // ignore polling errors
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [refresh]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const ts = Date.now();
      const name = `Content ${new Date(ts).toLocaleString('ko-KR')}`;
      const slug = `content-${ts}`;
      const res = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'create failed');
      }
      const item: ContentItem = {
        id: crypto.randomUUID(),
        storyblokId: data.storyblokId,
        name: data.name,
        slug: data.slug,
        status: 'DRAFT',
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
      addContent(item);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setCreating(false);
    }
  }, [refresh]);

  return (
    <main style={main}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>컨텐츠 관리</h1>
          <p style={{ margin: '4px 0 0', color: '#888' }}>
            로컬 저장소에 저장됩니다 · 3초마다 webhook 이벤트를 폴링합니다
          </p>
        </div>
        <button onClick={handleCreate} disabled={creating} style={btnPrimary}>
          {creating ? '생성 중...' : '+ 컨텐츠 생성'}
        </button>
      </header>

      {error && <div style={errorBox}>오류: {error}</div>}

      <section style={{ marginTop: 24 }}>
        {items.length === 0 ? (
          <p style={{ color: '#888' }}>생성된 컨텐츠가 없습니다.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>이름</th>
                <th style={th}>Storyblok ID</th>
                <th style={th}>상태</th>
                <th style={th}>생성일</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.storyblokId}</td>
                  <td style={td}>
                    <span style={c.status === 'PUBLISHED' ? badgePub : badgeDraft}>
                      {c.status}
                    </span>
                  </td>
                  <td style={td}>{new Date(c.createdAt).toLocaleString('ko-KR')}</td>
                  <td style={td}>
                    <Link href={`/admin/contents/${c.storyblokId}`}>상세 →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const main: React.CSSProperties = {
  maxWidth: 960,
  margin: '40px auto',
  padding: 24,
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 16px',
  background: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  whiteSpace: 'nowrap',
};

const errorBox: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#fee',
  color: '#900',
  borderRadius: 6,
  fontSize: 13,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
  fontSize: 13,
  color: '#666',
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f5f5f5',
  fontSize: 14,
  verticalAlign: 'middle',
};

const badgeDraft: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  background: '#fff4e5',
  color: '#b06000',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
};

const badgePub: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  background: '#e6f7e6',
  color: '#0a7a0a',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
};
