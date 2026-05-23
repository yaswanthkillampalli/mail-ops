import TicketPriorityBar from './TicketPriorityBar';
import TicketBadges from './TicketBadges';
import TicketAssignButton from './TicketAssignButton';
import TicketFooter from './TicketFooter';

interface Staff {
  name: string;
  specialty: string;
  avatar_initials: string;
}

export default function TicketCardExpanded({
  title, tag, priority, fromEmail,
  assignedStaff, createdAt,
  currentIndex, moving,
  onMove, onAssignClick,
}: {
  title: string;
  tag?: string;
  priority?: string;
  fromEmail?: string;
  assignedStaff: Staff | null;
  createdAt: string;
  currentIndex: number;
  moving: boolean;
  onMove: (dir: 'forward' | 'back') => void;
  onAssignClick: () => void;
}) {
  return (
    <>
      <TicketPriorityBar priority={priority ?? ''} />

      {/* Title */}
      <div style={{
        fontSize: 12, fontWeight: 500,
        color: 'var(--text-primary)', lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {title}
      </div>

      {/* From */}
      {fromEmail && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {fromEmail}
        </div>
      )}

      <TicketBadges tag={tag} priority={priority} />

      <TicketAssignButton
        assignedStaff={assignedStaff}
        onClick={onAssignClick}
      />

      <TicketFooter
        createdAt={createdAt}
        currentIndex={currentIndex}
        moving={moving}
        onMove={onMove}
      />
    </>
  );
}