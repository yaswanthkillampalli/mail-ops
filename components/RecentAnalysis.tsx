'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High: 'var(--high)',
  Medium: 'var(--medium)',
  Low: 'var(--low)',
};

const SENTIMENT_EMOJI: Record<string, string> = {
  Angry: '😠',
  Frustrated: '😤',
  Neutral: '😐',
  Positive: '😊',
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

export default function RecentAnalysis({ analysis }: { analysis: any[] }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Recent Analysis
        </span>
        <Link href="/dashboard/monitoring" style={{
          fontSize: 12,
          color: 'var(--accent)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {/* Analysis list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {analysis.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No analysis yet
          </div>
        ) : analysis.map((item) => {
          const email = Array.isArray(item.emails) ? item.emails[0] : item.emails;
          const tagStyle = TAG_COLORS[item.tag] ?? TAG_COLORS.Info;

          return (
            <div key={item.id} style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              {/* Email subject */}
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: 8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {email?.subject ?? 'Unknown subject'}
              </div>

              {/* Core issue */}
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginBottom: 10,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}>
                {item.core_issue}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {item.tag && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: tagStyle.bg,
                    color: tagStyle.text,
                  }}>
                    {item.tag}
                  </span>
                )}
                {item.priority && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: PRIORITY_COLOR[item.priority],
                    fontFamily: 'DM Mono',
                  }}>
                    {item.priority}
                  </span>
                )}
                {item.sentiment && (
                  <span style={{ fontSize: 12 }} title={item.sentiment}>
                    {SENTIMENT_EMOJI[item.sentiment]}
                  </span>
                )}
                {item.escalation && (
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: 'rgba(220,38,38,0.1)',
                    color: 'var(--critical)',
                  }}>
                    ↑ Escalated
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