import { UserPlus } from 'lucide-react';
import TicketPriorityBar from './TicketPriorityBar';
import TicketBadges from './TicketBadges';

interface Staff {
  name: string;
  avatar_initials: string;
}

export default function TicketCardCollapsed({
  title, tag, priority, assignedStaff, fromEmail,
}: {
  title: string;
  tag?: string;
  priority?: string;
  assignedStaff: Staff | null;
  fromEmail?: string;
}) {
  return (
    <>
      <TicketPriorityBar priority={priority ?? ''} />

      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 6,
      }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {/* Sender name — prominent */}
          {fromEmail && (
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden', whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              {fromEmail}
            </div>
          )}

          {/* Title — subtle below */}
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            overflow: 'hidden', whiteSpace: 'nowrap',
            textOverflow: 'ellipsis', marginTop: 1,
          }}>
            {title}
          </div>
        </div>

        {/* Tag + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <TicketBadges tag={tag} size="sm" />
          {assignedStaff ? (
            <div
              title={assignedStaff.name}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >
              {assignedStaff.avatar_initials}
            </div>
          ) : (
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: '1.5px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UserPlus size={8} color='var(--text-muted)' />
            </div>
          )}
        </div>
      </div>
    </>
  );
}