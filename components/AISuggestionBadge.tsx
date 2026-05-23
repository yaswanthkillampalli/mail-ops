import { Sparkles } from 'lucide-react';

export default function AISuggestionBadge({ reason }: { reason: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 10,
      padding: '10px 12px',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={13} color="#fff" />
      </div>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: '#6366f1', marginBottom: 2,
        }}>
          AI Suggestion
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {reason}
        </div>
      </div>
    </div>
  );
}