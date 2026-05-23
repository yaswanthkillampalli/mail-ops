import { UserPlus } from 'lucide-react';

interface Staff {
  name: string;
  specialty: string;
  avatar_initials: string;
}

export default function TicketAssignButton({
  assignedStaff,
  onClick,
}: {
  assignedStaff: Staff | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 8px', borderRadius: 8, width: '100%',
        border: assignedStaff
          ? '1px solid rgba(99,102,241,0.25)'
          : '1px dashed var(--border)',
        background: assignedStaff ? 'rgba(99,102,241,0.05)' : 'none',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      {assignedStaff ? (
        <>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff',
          }}>
            {assignedStaff.avatar_initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>
              {assignedStaff.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {assignedStaff.specialty}
            </div>
          </div>
        </>
      ) : (
        <>
          <UserPlus size={11} color='var(--text-muted)' />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Assign staff
          </span>
        </>
      )}
    </button>
  );
}