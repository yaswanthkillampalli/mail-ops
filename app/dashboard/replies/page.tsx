'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeRefresh } from '@/lib/realtime';
import RepliesList from '@/components/RepliesList';
import ReplyDetail from '@/components/ReplyDetail';

export default function RepliesPage() {
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchReplies = useCallback(async () => {
    const data = await fetch('/api/replies').then(r => r.json());
    setReplies(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReplies(); }, [fetchReplies]);
  useRealtimeRefresh(['replies'], fetchReplies);

  const selectedReply = replies.find(r => r.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 30% — Replies List */}
      <div style={{
        width: '30%',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <RepliesList
          replies={replies}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* 60% — Reply Detail */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ReplyDetail reply={selectedReply} />
      </div>
    </div>
  );
}