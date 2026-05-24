import { Mail, Zap, Bot, BarChart2 } from 'lucide-react';

function StatCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: any; label: string;
  value: number | string; color: string; sub?: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{
          fontSize: 28, fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'DM Mono', lineHeight: 1, marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            marginTop: 2, fontFamily: 'DM Mono',
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatCards({
  total, lastRun,
}: {
  total: number;
  lastRun: string | null;
}) {
  const lastRunText = lastRun
    ? new Date(lastRun).toLocaleString()
    : 'Never';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
    }}>
      <StatCard
        icon={Mail}
        label="Total Emails Processed"
        value={total}
        color="#3b82f6"
      />
      <StatCard
        icon={Zap}
        label="Groq Classifications"
        value={total}
        color="#f59e0b"
        sub="llama-3.1-8b-instant"
      />
      <StatCard
        icon={Bot}
        label="Cerebras Analyses"
        value={total}
        color="#8b5cf6"
        sub="gpt-oss-120b"
      />
      <StatCard
        icon={BarChart2}
        label="Last Processed"
        value={total > 0 ? '✓' : '—'}
        color="#10b981"
        sub={lastRunText}
      />
    </div>
  );
}