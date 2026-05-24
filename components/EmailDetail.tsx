'use client';
import { useState } from 'react';
import {
  Mail, Ticket, Archive, AlertTriangle,
  CheckCircle, RefreshCw, Send, X
} from 'lucide-react';

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
  Angry: '😠', Frustrated: '😤', Neutral: '😐', Positive: '😊',
};

type EmailAnalysis = {
  tag?: string | null;
  priority?: string | null;
  sentiment?: string | null;
  escalation?: boolean | null;
  summary?: string | null;
  core_issue?: string | null;
  reply_suggestions?: string[] | string | null;
};

type EmailDetailRecord = {
  id: string;
  subject: string;
  from_email: string;
  from_name: string | null;
  received_at: string;
  body_text: string | null;
  status: string;
  email_analysis?: EmailAnalysis | EmailAnalysis[] | null;
};

export default function EmailDetail({
  email, onUpdate,
}: {
  email: EmailDetailRecord | null;
  onUpdate: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [ticketState, setTicketState] = useState<'idle' | 'loading' | 'created' | 'exists'>('idle');
  const [statusLoading, setStatusLoading] = useState(false);
  const [reanalyzeLoading, setReanalyzeLoading] = useState(false);

  if (!email) return (
    <div style={{
      height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
      color: 'var(--text-muted)',
    }}>
      <Mail size={32} strokeWidth={1} />
      <div style={{ fontSize: 13 }}>Select an email to view</div>
    </div>
  );

  const currentEmail = email;

  const analysis = Array.isArray(currentEmail.email_analysis)
    ? currentEmail.email_analysis[0]
    : currentEmail.email_analysis;

  const tagKey = analysis?.tag && analysis.tag in TAG_COLORS ? analysis.tag : 'Info';
  const tagStyle = TAG_COLORS[tagKey];

  const replySuggestions: string[] = (() => {
    if (!analysis?.reply_suggestions) return [];
    if (Array.isArray(analysis.reply_suggestions)) return analysis.reply_suggestions;
    try { return JSON.parse(analysis.reply_suggestions); } catch { return []; }
  })();

  async function handleStatusUpdate(status: string) {
    setStatusLoading(true);
    await fetch(`/api/emails/${currentEmail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setStatusLoading(false);
    onUpdate();
  }

  async function handleCreateTicket() {
    setTicketState('loading');
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_id: currentEmail.id,
        title: analysis?.core_issue ?? currentEmail.subject,
        tag: analysis?.tag ?? 'Info',
        priority: analysis?.priority ?? 'Medium',
      }),
    });
    setTicketState(res.status === 400 ? 'exists' : res.ok ? 'created' : 'idle');
  }

  async function handleReanalyze() {
    setReanalyzeLoading(true);

    const response = await fetch(`/api/emails/${currentEmail.id}/reanalyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    setReanalyzeLoading(false);

    if (!response.ok) {
      return;
    }

    onUpdate();
  }

  async function handleSendReply(body: string, wasAi: boolean) {
    setReplySending(true);
    await fetch(`/api/emails/${currentEmail.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: currentEmail.from_email,
        subject: currentEmail.subject,
        body,
        was_ai_suggestion: wasAi,
      }),
    });
    setReplySending(false);
    setReplySuccess(true);
    setReplyOpen(false);
    setReplyBody('');
    onUpdate();
    setTimeout(() => setReplySuccess(false), 3000);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          {currentEmail.subject}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {currentEmail.from_name
              ? `${currentEmail.from_name} · ${currentEmail.from_email}`
              : currentEmail.from_email}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            {new Date(currentEmail.received_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Badges */}
        {analysis && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {analysis.tag && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                padding: '4px 12px', borderRadius: 20,
                background: tagStyle.bg, color: tagStyle.text,
              }}>
                {analysis.tag}
              </span>
            )}
            {analysis.priority && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: '4px 12px', borderRadius: 20,
                background: `${PRIORITY_COLOR[analysis.priority]}18`,
                color: PRIORITY_COLOR[analysis.priority],
                fontFamily: 'DM Mono',
              }}>
                {analysis.priority}
              </span>
            )}
            {analysis.sentiment && (
              <span style={{
                fontSize: 11, padding: '4px 12px', borderRadius: 20,
                background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              }}>
                {SENTIMENT_EMOJI[analysis.sentiment]} {analysis.sentiment}
              </span>
            )}
            {analysis.escalation && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                padding: '4px 12px', borderRadius: 20,
                background: 'rgba(220,38,38,0.1)', color: 'var(--critical)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <AlertTriangle size={11} /> Escalation Required
              </span>
            )}
          </div>
        )}

        {/* AI Analysis Card */}
        {analysis && (
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 12, padding: '16px',
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {/* Summary */}
            {analysis.summary && (
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 6,
                }}>
                  AI Summary
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {analysis.summary}
                </div>
              </div>
            )}

            {/* Core Issue */}
            {analysis.core_issue && (
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6,
                }}>
                  Core Issue
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {analysis.core_issue}
                </div>
              </div>
            )}

            {/* Reply Suggestions */}
            {replySuggestions.length > 0 && (
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8,
                }}>
                  AI Reply Suggestions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {replySuggestions.map((suggestion: string, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        setReplyBody(suggestion);
                        setReplyOpen(true);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: 'var(--accent)', marginRight: 8,
                      }}>
                        {i + 1}.
                      </span>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Original email body */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8,
          }}>
            Original Message
          </div>
          <div style={{
            padding: '16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-tertiary)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            fontFamily: 'DM Mono',
          }}>
            {currentEmail.body_text ?? 'No body content'}
          </div>
        </div>
      </div>

      {/* Reply panel */}
      {replyOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Reply to {currentEmail.from_email}
            </span>
            <button onClick={() => setReplyOpen(false)} style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="Type your reply or click a suggestion above..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'DM Sans',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setReplyOpen(false)} style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 12, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              onClick={() => handleSendReply(replyBody, replyBody === replySuggestions[0] || replyBody === replySuggestions[1] || replyBody === replySuggestions[2])}
              disabled={!replyBody.trim() || replySending}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--accent)', color: 'white',
                border: 'none', fontSize: 12,
                cursor: replyBody.trim() ? 'pointer' : 'not-allowed',
                opacity: replyBody.trim() ? 1 : 0.5,
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 500,
              }}
            >
              <Send size={13} />
              {replySending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons footer */}
      <div style={{
        padding: '14px 24px',
        borderTop: replyOpen ? 'none' : '1px solid var(--border)',
        display: 'flex', gap: 8, flexShrink: 0,
        background: 'var(--bg-secondary)',
        flexWrap: 'wrap',
      }}>

        {/* Reply */}
        {!replyOpen && (
          <button onClick={() => setReplyOpen(true)} style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'var(--accent)', color: 'white',
            border: 'none', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
          }}>
            <Send size={13} /> Reply
          </button>
        )}

        {/* Create Ticket */}
        <button
          onClick={handleCreateTicket}
          disabled={ticketState === 'loading' || ticketState === 'created' || ticketState === 'exists'}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: ticketState === 'created' ? 'rgba(22,163,74,0.1)' : 'var(--bg-tertiary)',
            color: ticketState === 'created' ? 'var(--low)' : 'var(--text-secondary)',
            fontSize: 12, cursor: ticketState === 'idle' ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Ticket size={13} />
          {ticketState === 'loading' ? 'Creating...'
            : ticketState === 'created' ? '✅ Ticket Created'
            : ticketState === 'exists' ? 'Ticket Exists'
            : 'Create Ticket'}
        </button>

        {/* Reanalyze */}
        <button
          onClick={handleReanalyze}
          disabled={reanalyzeLoading}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontSize: 12, cursor: reanalyzeLoading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <RefreshCw size={13} />
          {reanalyzeLoading ? 'Reanalyzing...' : 'Reanalyze'}
        </button>

        {/* Mark as read */}
          {currentEmail.status === 'unread' && (
          <button
            onClick={() => handleStatusUpdate('read')}
            disabled={statusLoading}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <CheckCircle size={13} /> Mark as Read
          </button>
        )}

        {/* Archive */}
        {currentEmail.status !== 'archived' && (
          <button
            onClick={() => handleStatusUpdate('archived')}
            disabled={statusLoading}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Archive size={13} /> Archive
          </button>
        )}

        {/* Escalate */}
        {analysis && !analysis.escalation && (
          <button style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid rgba(220,38,38,0.3)',
            background: 'rgba(220,38,38,0.05)',
            color: 'var(--critical)',
            fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <AlertTriangle size={13} /> Escalate
          </button>
        )}

        {/* Reply success */}
        {replySuccess && (
          <span style={{
            fontSize: 12, color: 'var(--low)',
            display: 'flex', alignItems: 'center', gap: 4,
            marginLeft: 'auto',
          }}>
            <CheckCircle size={13} /> Reply sent!
          </span>
        )}
      </div>
    </div>
  );
}