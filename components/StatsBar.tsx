'use client';
import { Mail, Ticket, AlertTriangle, CheckCircle } from 'lucide-react';

type Stats = {
  unread: number;
  openTickets: number;
  critical: number;
  resolvedToday: number;
};

const STATS = (s: Stats) => [
  {
    label: 'Unread Emails',
    value: s.unread,
    icon: Mail,
    color: 'var(--accent)',
    bg: 'var(--accent-soft)',
  },
  {
    label: 'Open Tickets',
    value: s.openTickets,
    icon: Ticket,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    label: 'Critical Alerts',
    value: s.critical,
    icon: AlertTriangle,
    color: 'var(--critical)',
    bg: 'rgba(220,38,38,0.08)',
  },
  {
    label: 'Resolved Today',
    value: s.resolvedToday,
    icon: CheckCircle,
    color: 'var(--low)',
    bg: 'rgba(22,163,74,0.08)',
  },
];

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    }}>
      {STATS(stats).map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: '12px',
            background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{
              fontSize: 26,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: 4,
              fontFamily: 'DM Mono',
            }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}