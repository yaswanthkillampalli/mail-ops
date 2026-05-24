'use client';
import { useState } from 'react';
import AssignDrawer from './AssignDrawer';
import TicketCardCollapsed from './TicketCardCollapsed';
import TicketCardExpanded from './TicketCardExpanded';
import { getPriorityColor } from './TicketPriorityBar';

const STATUS_ORDER = ['Open', 'In Progress', 'Escalated', 'Resolved'];

export default function TicketCard({
  ticket,
  currentStatus,
  expanded,
  onExpand,
  onUpdate,
}: {
  ticket: any;
  currentStatus: string;
  expanded: boolean;
  onExpand: () => void;
  onUpdate: () => void;
}) {
  const [moving, setMoving]         = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentIndex  = STATUS_ORDER.indexOf(currentStatus);
  const assignedStaff = Array.isArray(ticket.staff)  ? ticket.staff[0]  : ticket.staff;
  const emailObj      = Array.isArray(ticket.emails) ? ticket.emails[0] : ticket.emails;
  const fromEmail     = emailObj?.from_name ?? emailObj?.from_email;
  const priorityColor = getPriorityColor(ticket.priority);

  async function moveTicket(dir: 'forward' | 'back') {
    const newStatus = dir === 'forward'
      ? STATUS_ORDER[currentIndex + 1]
      : STATUS_ORDER[currentIndex - 1];
    setMoving(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setMoving(false);
    onUpdate();
  }

  return (
    <>
      <div
        onClick={onExpand}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderColor: expanded ? priorityColor : 'var(--border)',
          borderRadius: 10,
          padding: expanded ? '12px' : '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: expanded ? 10 : 6,
          opacity: moving ? 0.6 : 1,
          cursor: 'pointer',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease, padding 0.5s cubic-bezier(0.22, 1, 0.36, 1), gap 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s ease',
          boxShadow: expanded ? `0 4px 16px ${priorityColor}` : 'none',
        }}
      >
        {expanded ? (
          <TicketCardExpanded
            title={ticket.title}
            tag={ticket.tag}
            priority={ticket.priority}
            fromEmail={fromEmail}
            assignedStaff={assignedStaff}
            createdAt={ticket.created_at}
            currentIndex={currentIndex}
            moving={moving}
            onMove={moveTicket}
            onAssignClick={() => setDrawerOpen(true)}
          />
        ) : (
          <TicketCardCollapsed
            title={ticket.title}
            tag={ticket.tag}
            priority={ticket.priority}
            assignedStaff={assignedStaff}
            fromEmail={fromEmail}
          />
        )}
      </div>

      <AssignDrawer
        ticket={ticket}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAssigned={onUpdate}
      />
    </>
  );
}