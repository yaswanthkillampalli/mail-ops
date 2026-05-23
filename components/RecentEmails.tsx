'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import EmailModal from './EmailModal';

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

export default function RecentEmails({ emails }: { emails: any[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  return (
    <>
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
            Recent Emails
            </span>
            <Link href="/dashboard/emails" style={{
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

        {/* Email list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
            {emails.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No emails yet
            </div>
            ) : emails.map((email) => {
            const analysis = Array.isArray(email.email_analysis)
                ? email.email_analysis[0]
                : email.email_analysis;
            const isHovered = hoveredId === email.id;
            const tag = analysis?.tag;
            const tagStyle = TAG_COLORS[tag] ?? TAG_COLORS.Info;

            return (
                <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                onMouseEnter={() => setHoveredId(email.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isHovered ? 'var(--bg-tertiary)' : 'transparent',
                    transition: 'background 0.15s',
                    position: 'relative',
                }}
                >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Unread dot */}
                    {email.status === 'unread' && (
                        <div style={{
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        flexShrink: 0,
                        }} />
                    )}
                    <span style={{
                        fontSize: 13,
                        fontWeight: email.status === 'unread' ? 600 : 400,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 180,
                    }}>
                        {email.from_name ?? email.from_email}
                    </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono', flexShrink: 0 }}>
                    {new Date(email.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Subject */}
                <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {email.subject}
                </div>

                {/* Badges row */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {tag && (
                    <span style={{
                        fontSize: 10,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: tagStyle.bg,
                        color: tagStyle.text,
                    }}>
                        {tag}
                    </span>
                    )}
                    {analysis?.priority && (
                    <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: PRIORITY_COLOR[analysis.priority] ?? 'var(--text-muted)',
                        fontFamily: 'DM Mono',
                    }}>
                        {analysis.priority}
                    </span>
                    )}
                    {analysis?.escalation && (
                    <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: 'rgba(220,38,38,0.1)',
                        color: 'var(--critical)',
                        fontWeight: 500,
                    }}>
                        ↑ Escalate
                    </span>
                    )}
                </div>

                {/* Hover summary tooltip */}
                {isHovered && analysis?.summary && (
                    <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 20, right: 20,
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    lineHeight: 1.5,
                    zIndex: 10,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}>
                    {analysis.summary}
                    <div style={{
                        position: 'absolute',
                        top: '100%', left: 20,
                        width: 0, height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid var(--text-primary)',
                    }} />
                    </div>
                )}
                </div>
            );
            })}
        </div>


        </div>

        {selectedEmail && (
            <EmailModal
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            />
        )}
        </>
  );
}