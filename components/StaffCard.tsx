import { Check } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  specialty: string;
  avatar_initials: string;
}

export default function StaffCard({
  staff,
  selected,
  suggested,
  onClick,
  disabled,
}: {
  staff: Staff;
  selected: boolean;
  suggested: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', textAlign: 'left',
        padding: '10px 12px',
        borderRadius: 10,
        border: selected
          ? '1.5px solid #6366f1'
          : suggested
          ? '1.5px solid rgba(99,102,241,0.3)'
          : '1.5px solid var(--border)',
        background: selected
          ? 'rgba(99,102,241,0.08)'
          : suggested
          ? 'rgba(99,102,241,0.04)'
          : 'var(--bg-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center',
        gap: 10, opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: selected
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : 'linear-gradient(135deg, #64748b, #94a3b8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff',
      }}>
        {staff.avatar_initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {staff.name}
          {suggested && !selected && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: '2px 6px', borderRadius: 20,
              background: 'rgba(99,102,241,0.12)',
              color: '#6366f1', letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              AI Pick
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          {staff.specialty}
        </div>
      </div>

      {/* Check */}
      {selected && (
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}