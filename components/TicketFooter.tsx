import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_ORDER = ['Open', 'In Progress', 'Escalated', 'Resolved'];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

export default function TicketFooter({
  createdAt,
  currentIndex,
  moving,
  onMove,
}: {
  createdAt: string;
  currentIndex: number;
  moving: boolean;
  onMove: (dir: 'forward' | 'back') => void;
}) {
  const canMoveBack    = currentIndex > 0;
  const canMoveForward = currentIndex < STATUS_ORDER.length - 1;

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{
        fontSize: 10, color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'DM Mono',
      }}>
        <Clock size={9} />
        {timeAgo(createdAt)}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {canMoveBack && (
          <button
            onClick={() => onMove('back')}
            disabled={moving}
            title={`Move to ${STATUS_ORDER[currentIndex - 1]}`}
            style={{
              width: 24, height: 24, borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={12} />
          </button>
        )}
        {canMoveForward && (
          <button
            onClick={() => onMove('forward')}
            disabled={moving}
            title={`Move to ${STATUS_ORDER[currentIndex + 1]}`}
            style={{
              width: 24, height: 24, borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}