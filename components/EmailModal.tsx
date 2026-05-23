'use client';
import { useEffect, useState } from 'react';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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

const SENTIMENT_EMOJI: Record<string, string> = {
  Angry: '😠',
  Frustrated: '😤',
  Neutral: '😐',
  Positive: '😊',
};

export default function EmailModal({
  email,
  onClose,
}: {
  email: any;
  onClose: () => void;
}) {
  const analysis = Array.isArray(email.email_analysis)
    ? email.email_analysis[0]
    : email.email_analysis;
  const [ticketState, setTicketState] = useState<'idle' | 'loading' | 'created' | 'exists'>('idle');
  const tagStyle = TAG_COLORS[analysis?.tag] ?? TAG_COLORS.Info;

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleCreateTicket() {
    setTicketState('loading');
    try {
        const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email_id: email.id,
            title: analysis?.core_issue ?? email.subject,
            tag: analysis?.tag ?? 'Info',
            priority: analysis?.priority ?? 'Medium',
        }),
        });

        const data = await res.json();
        if (res.status === 400) setTicketState('exists');
        else if (res.ok) setTicketState('created');
        else setTicketState('idle');
    } catch {
        setTicketState('idle');
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 480,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.2s ease',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {email.subject}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {email.from_name
                ? `${email.from_name} · ${email.from_email}`
                : email.from_email}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: 8,
              border: 'none',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Badges */}
          {analysis && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {analysis.tag && (
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 20,
                  background: tagStyle.bg, color: tagStyle.text,
                }}>
                  {analysis.tag}
                </span>
              )}
              {analysis.priority && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 20,
                  background: `${PRIORITY_COLOR[analysis.priority]}18`,
                  color: PRIORITY_COLOR[analysis.priority],
                  fontFamily: 'DM Mono',
                }}>
                  {analysis.priority}
                </span>
              )}
              {analysis.sentiment && (
                <span style={{
                  fontSize: 11,
                  padding: '4px 10px', borderRadius: 20,
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}>
                  {SENTIMENT_EMOJI[analysis.sentiment]} {analysis.sentiment}
                </span>
              )}
              {analysis.escalation && (
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 20,
                  background: 'rgba(220,38,38,0.1)',
                  color: 'var(--critical)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <AlertTriangle size={10} /> Escalation Required
                </span>
              )}
            </div>
          )}

          {/* Summary */}
          {analysis?.summary && (
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 10,
              padding: '14px 16px',
              borderLeft: '3px solid var(--accent)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Summary
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {analysis.summary}
              </div>
            </div>
          )}

          {/* Core Issue */}
          {analysis?.core_issue && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Core Issue
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {analysis.core_issue}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Original Email */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Original Message
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              fontFamily: 'DM Mono',
              background: 'var(--bg-tertiary)',
              borderRadius: 10,
              padding: '14px 16px',
              maxHeight: 200,
              overflow: 'auto',
            }}>
              {email.body_text ?? 'No body content'}
            </div>
          </div>

          {/* Received At and Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
              Received: {new Date(email.received_at).toLocaleString()}
            </span>
            <span style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              background: email.status === 'unread' ? 'var(--bg-tertiary)' : 'var(--accent)',
              color: email.status === 'unread' ? 'var(--text-secondary)' : 'white',
            }}>
              {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
  
            {/* Ticket status feedback */}
            {ticketState === 'created' && (
                <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(22,163,74,0.1)',
                color: 'var(--low)', fontSize: 12, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
                }}>
                ✅ Ticket created successfully! Check Pending Tickets.
                </div>
            )}
            {ticketState === 'exists' && (
                <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.1)',
                color: 'var(--medium)', fontSize: 12, fontWeight: 500,
                }}>
                ⚠️ A ticket already exists for this email.
                </div>
            )}

            {/* Buttons row */}
            <div style={{ display: 'flex', gap: 10 }}>
                <Link href={`/dashboard/emails?id=${email.id}`} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10,
                background: 'var(--accent)', color: 'white',
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                Open Full View <ArrowRight size={14} />
                </Link>

                <button
                onClick={handleCreateTicket}
                disabled={ticketState === 'loading' || ticketState === 'created' || ticketState === 'exists'}
                style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: ticketState === 'created' ? 'rgba(22,163,74,0.1)' : 'var(--bg-tertiary)',
                    color: ticketState === 'created' ? 'var(--low)' : 'var(--text-secondary)',
                    fontSize: 13, cursor: ticketState === 'idle' ? 'pointer' : 'not-allowed',
                    fontWeight: 500,
                }}
                >
                {ticketState === 'loading' ? 'Creating...'
                    : ticketState === 'created' ? '✅ Ticket Created'
                    : ticketState === 'exists' ? 'Already Exists'
                    : '🎫 Create Ticket'}
                </button>

                <button onClick={onClose} style={{
                padding: '10px 16px', borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 13, cursor: 'pointer',
                }}>
                Close
                </button>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}