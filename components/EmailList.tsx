'use client';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High: 'var(--high)',
  Medium: 'var(--medium)',
  Low: 'var(--low)',
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Network:   { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6' },
  Hardware:  { bg: 'rgba(168,85,247,0.1)',  text: '#a855f7' },
  Software:  { bg: 'rgba(236,72,153,0.1)',  text: '#ec4899' },
  Access:    { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b' },
  Billing:   { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
  Complaint: { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444' },
  Info:      { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' },
};

const ALL_TAGS = ['Network', 'Hardware', 'Software', 'Access', 'Billing', 'Complaint', 'Info'];
const ALL_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

type EmailItem = {
  id: string;
  subject?: string;
  from_email?: string;
  from_name?: string | null;
  status?: string;
  received_at: string;
  email_analysis?: unknown;
};

export default function EmailList({
  emails, loading, selectedId, onSelect,
}: {
  emails: EmailItem[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return emails.filter(email => {
      const analysis = Array.isArray(email.email_analysis)
        ? email.email_analysis[0]
        : email.email_analysis;

      const matchesSearch =
        !search ||
        email.subject?.toLowerCase().includes(search.toLowerCase()) ||
        email.from_email?.toLowerCase().includes(search.toLowerCase()) ||
        email.from_name?.toLowerCase().includes(search.toLowerCase());

      const matchesTag = !tagFilter || analysis?.tag === tagFilter;
      const matchesPriority = !priorityFilter || analysis?.priority === priorityFilter;

      return matchesSearch && matchesTag && matchesPriority;
    });
  }, [emails, search, tagFilter, priorityFilter]);

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
            Emails
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
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emails..."
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
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

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {ALL_TAGS.map(tag => {
            const style = TAG_COLORS[tag];
            const active = tagFilter === tag;
            return (
              <button key={tag} onClick={() => setTagFilter(active ? null : tag)} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                border: 'none', cursor: 'pointer',
                background: active ? style.bg : 'var(--bg-tertiary)',
                color: active ? style.text : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}>
                {tag}
              </button>
            );
          })}
        </div>

        {/* Priority filters */}
        <div style={{ display: 'flex', gap: 4 }}>
          {ALL_PRIORITIES.map(p => {
            const active = priorityFilter === p;
            return (
              <button key={p} onClick={() => setPriorityFilter(active ? null : p)} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                border: 'none', cursor: 'pointer',
                background: active ? `${PRIORITY_COLOR[p]}18` : 'var(--bg-tertiary)',
                color: active ? PRIORITY_COLOR[p] : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
                fontFamily: 'DM Mono',
                transition: 'all 0.15s',
              }}>
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Email cards */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner className="size-5" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No emails found
          </div>
        ) : filtered.map(email => {
          const analysis = Array.isArray(email.email_analysis)
            ? email.email_analysis[0]
            : email.email_analysis;
          const isSelected = selectedId === email.id;
          const isHovered = hoveredId === email.id;
          const tagStyle = TAG_COLORS[analysis?.tag] ?? TAG_COLORS.Info;

          return (
            <div
              key={email.id}
              onClick={() => onSelect(email.id)}
              onMouseEnter={() => setHoveredId(email.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                position: 'relative',
                background: isSelected
                  ? 'var(--accent-soft)'
                  : isHovered
                  ? 'var(--bg-tertiary)'
                  : 'transparent',
                borderLeft: isSelected
                  ? '3px solid var(--accent)'
                  : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Top row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {email.status === 'unread' && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent)', flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    fontSize: 12, fontWeight: email.status === 'unread' ? 600 : 400,
                    color: 'var(--text-primary)',
                    maxWidth: 140, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {email.from_name ?? email.from_email}
                  </span>
                </div>
                <span style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  fontFamily: 'DM Mono', flexShrink: 0,
                }}>
                  {new Date(email.received_at).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Subject */}
              <div style={{
                fontSize: 12, color: 'var(--text-secondary)',
                marginBottom: 8, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {email.subject}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {analysis?.tag && (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    padding: '2px 7px', borderRadius: 20,
                    background: tagStyle.bg, color: tagStyle.text,
                  }}>
                    {analysis.tag}
                  </span>
                )}
                {analysis?.priority && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: PRIORITY_COLOR[analysis.priority],
                    fontFamily: 'DM Mono',
                  }}>
                    {analysis.priority}
                  </span>
                )}
                {analysis?.escalation && (
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 20,
                    background: 'rgba(220,38,38,0.1)', color: 'var(--critical)',
                  }}>
                    ↑
                  </span>
                )}
              </div>

              {/* Hover tooltip */}
              {isHovered && analysis?.summary && !isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 12, right: 12,
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  padding: '8px 12px',
                  borderRadius: 8, fontSize: 11,
                  lineHeight: 1.5, zIndex: 10,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                  {analysis.summary}
                  <div style={{
                    position: 'absolute', top: '100%', left: 16,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid var(--text-primary)',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}