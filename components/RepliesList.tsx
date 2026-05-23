'use client';
import { useState, useMemo } from 'react';
import { Search, X, Bot, User } from 'lucide-react';

export default function RepliesList({
  replies, loading, selectedId, onSelect,
}: {
  replies: any[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return replies.filter(r => {
      const email = Array.isArray(r.emails) ? r.emails[0] : r.emails;
      return !search ||
        email?.subject?.toLowerCase().includes(search.toLowerCase()) ||
        email?.from_email?.toLowerCase().includes(search.toLowerCase()) ||
        r.reply_body?.toLowerCase().includes(search.toLowerCase());
    });
  }, [replies, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '20px 16px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Replies
          </h2>
          <span style={{
            fontSize: 11, fontFamily: 'DM Mono',
            color: 'var(--text-muted)',
            background: 'var(--bg-tertiary)',
            padding: '2px 8px', borderRadius: 20,
          }}>
            {filtered.length}
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search replies..."
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12, outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
            }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* AI vs Manual filter chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
            {filtered.filter(r => r.was_ai_suggestion).length} AI ·{' '}
            {filtered.filter(r => !r.was_ai_suggestion).length} Manual
          </span>
        </div>
      </div>

      {/* Reply cards */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No replies yet
          </div>
        ) : filtered.map(reply => {
          const email = Array.isArray(reply.emails) ? reply.emails[0] : reply.emails;
          const isSelected = selectedId === reply.id;
          const isHovered = hoveredId === reply.id;

          return (
            <div
              key={reply.id}
              onClick={() => onSelect(reply.id)}
              onMouseEnter={() => setHoveredId(reply.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: isSelected
                  ? 'var(--accent-soft)'
                  : isHovered ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: isSelected
                  ? '3px solid var(--accent)'
                  : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Top row — to + time */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 5,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: 'var(--text-primary)',
                  maxWidth: 140, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {email?.from_name ?? email?.from_email ?? 'Unknown'}
                </span>
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  fontFamily: 'DM Mono', flexShrink: 0,
                }}>
                  {new Date(reply.sent_at).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Subject */}
              <div style={{
                fontSize: 11, color: 'var(--text-secondary)',
                marginBottom: 8, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                Re: {email?.subject ?? '(no subject)'}
              </div>

              {/* Reply preview */}
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
                marginBottom: 8,
              }}>
                {reply.reply_body}
              </div>

              {/* AI / Manual badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {reply.was_ai_suggestion ? (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(139,92,246,0.1)',
                    color: '#8b5cf6',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Bot size={9} /> AI Suggestion
                  </span>
                ) : (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    padding: '2px 8px', borderRadius: 20,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <User size={9} /> Manual
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}