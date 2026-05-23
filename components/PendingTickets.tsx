'use client';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High: 'var(--high)',
  Medium: 'var(--medium)',
  Low: 'var(--low)',
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Open:        { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6' },
  'In Progress': { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  Escalated:   { bg: 'rgba(220,38,38,0.1)',   text: '#dc2626' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

export default function PendingTickets({ tickets }: { tickets: any[] }) {
  const pending = tickets.filter(t =>
    t.status === 'Open' || t.status === 'In Progress' || t.status === 'Escalated'
  ).slice(0, 5);

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
          Pending Tickets
        </span>
        <Link href="/dashboard/tickets" style={{
          fontSize: 12, color: 'var(--accent)',
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {/* Ticket list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {pending.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No pending tickets 🎉
          </div>
        ) : pending.map((ticket) => {
          const statusStyle = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.Open;
          return (
            <div key={ticket.id} style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              {/* Title */}
              <div style={{
                fontSize: 13, fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}>
                {ticket.title}
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    padding: '2px 8px', borderRadius: 20,
                    background: statusStyle.bg, color: statusStyle.text,
                  }}>
                    {ticket.status}
                  </span>
                  {ticket.priority && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: PRIORITY_COLOR[ticket.priority],
                      fontFamily: 'DM Mono',
                    }}>
                      {ticket.priority}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Clock size={10} />
                  {timeAgo(ticket.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}