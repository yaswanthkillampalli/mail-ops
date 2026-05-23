import { Zap, Bot } from 'lucide-react';

function ModelCard({
  icon: Icon, name, color, badge,
  badgeBg, model, tasks, speed, total,
}: {
  icon: any; name: string; color: string;
  badge: string; badgeBg: string; model: string;
  tasks: string; speed: string; total: number;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, marginBottom: 14,
      }}>
        <Icon size={18} color={color} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {name}
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px',
          borderRadius: 20, background: badgeBg,
          color: color, fontFamily: 'DM Mono',
        }}>
          {badge}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Model', value: model, mono: true, small: true },
          { label: 'Tasks', value: tasks, mono: false, small: false },
          { label: 'Avg Speed', value: speed, mono: true, small: false },
          { label: 'Total Runs', value: String(total), mono: true, small: false },
        ].map(({ label, value, mono, small }) => (
          <div key={label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            fontSize: 12,
          }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              {label}
            </span>
            <span style={{
              color: 'var(--text-primary)',
              fontFamily: mono ? 'DM Mono' : 'DM Sans',
              fontSize: small ? 11 : 12,
              textAlign: 'right',
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModelInfoCards({ total }: { total: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    }}>
      <ModelCard
        icon={Zap}
        name="Groq"
        color="#f59e0b"
        badge="Fast Triage"
        badgeBg="rgba(245,158,11,0.1)"
        model="llama-3.1-8b-instant"
        tasks="Tag · Priority · Sentiment · Escalation"
        speed="< 500ms"
        total={total}
      />
      <ModelCard
        icon={Bot}
        name="Gemini"
        color="#8b5cf6"
        badge="Deep Analysis"
        badgeBg="rgba(139,92,246,0.1)"
        model="gemini-2.5-flash-lite"
        tasks="Summary · Core Issue · Reply Suggestions"
        speed="< 2000ms"
        total={total}
      />
    </div>
  );
}