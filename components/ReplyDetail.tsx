'use client';
import { Bot, User, Clock, Mail } from 'lucide-react';

export default function ReplyDetail({ reply }: { reply: any | null }) {
  if (!reply) return (
    <div style={{
      height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
      color: 'var(--text-muted)',
    }}>
      <Mail size={32} strokeWidth={1} />
      <div style={{ fontSize: 13 }}>Select a reply to view</div>
    </div>
  );

  const email = Array.isArray(reply.emails) ? reply.emails[0] : reply.emails;

  return (
    <div style={{
      height: '100%', display: 'flex',
      flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Re: {email?.subject ?? '(no subject)'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Sent to {email?.from_name
            ? `${email.from_name} · ${email.from_email}`
            : email?.from_email}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflow: 'auto',
        padding: '24px', display: 'flex',
        flexDirection: 'column', gap: 20,
      }}>

        {/* Meta info */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* AI/Manual badge */}
          {reply.was_ai_suggestion ? (
            <span style={{
              fontSize: 12, fontWeight: 500,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(139,92,246,0.1)',
              color: '#8b5cf6',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Bot size={13} /> AI Suggestion Used
            </span>
          ) : (
            <span style={{
              fontSize: 12, fontWeight: 500,
              padding: '5px 12px', borderRadius: 20,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <User size={13} /> Manually Written
            </span>
          )}

          {/* Sent time */}
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'DM Mono',
          }}>
            <Clock size={12} />
            {new Date(reply.sent_at).toLocaleString()}
          </span>
        </div>

        {/* Original email context */}
        {email && (
          <div>
            <div style={{
              fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--text-muted)', marginBottom: 10,
            }}>
              Original Email
            </div>
            <div style={{
              padding: '14px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 500,
                color: 'var(--text-primary)', marginBottom: 4,
              }}>
                {email.subject}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                From: {email.from_name ?? email.from_email}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Reply body */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--text-muted)', marginBottom: 10,
          }}>
            Reply Sent
          </div>
          <div style={{
            padding: '16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            fontSize: 13,
            color: 'var(--text-primary)',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            borderLeft: '3px solid var(--accent)',
          }}>
            {reply.reply_body}
          </div>
        </div>
      </div>
    </div>
  );
}