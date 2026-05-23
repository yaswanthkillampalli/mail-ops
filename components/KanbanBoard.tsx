'use client';
import TicketCard from './TicketCard';

const COLUMNS = [
  {
    status: 'Open',
    label: 'Open',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.06)',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
  },
  {
    status: 'Escalated',
    label: 'Escalated',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.06)',
  },
  {
    status: 'Resolved',
    label: 'Resolved',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.06)',
  },
];

export default function KanbanBoard({
  tickets,
  onUpdate,
}: {
  tickets: any[];
  onUpdate: () => void;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      height: '100%',
    }}>
      {COLUMNS.map(col => {
        const colTickets = tickets.filter(t => t.status === col.status);
        return (
          <div key={col.status} style={{
            background: col.bg,
            border: `1px solid ${col.color}28`,
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Column header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${col.color}28`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: col.color,
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {col.label}
                </span>
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'DM Mono',
                color: col.color, fontWeight: 600,
                background: `${col.color}18`,
                padding: '2px 8px', borderRadius: 20,
              }}>
                {colTickets.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{
              flex: 1, overflow: 'auto',
              padding: '10px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {colTickets.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  padding: '32px 0',
                }}>
                  No tickets
                </div>
              ) : colTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  currentStatus={col.status}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}