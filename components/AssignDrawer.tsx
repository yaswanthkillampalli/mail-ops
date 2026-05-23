'use client';
import { useState, useEffect } from 'react';
import { X, Sparkles, UserCheck, Loader2 } from 'lucide-react';
import StaffCard from './StaffCard';
import AISuggestionBadge from './AISuggestionBadge';

interface Staff {
  id: string;
  name: string;
  specialty: string;
  avatar_initials: string;
}

interface Ticket {
  id: string;
  title: string;
  tag: string;
  priority: string;
  notes?: string | null;
  assigned_to?: string | null;
}

export default function AssignDrawer({
  ticket,
  open,
  onClose,
  onAssigned,
}: {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [staff, setStaff]               = useState<Staff[]>([]);
  const [selected, setSelected]         = useState<string | null>(ticket.assigned_to ?? null);
  const [suggestion, setSuggestion]     = useState<{ staff_id: string; reason: string } | null>(null);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingAI, setLoadingAI]       = useState(false);
  const [assigning, setAssigning]       = useState(false);

  // Fetch staff + AI suggestion when drawer opens
  useEffect(() => {
    if (!open) return;
    setSelected(ticket.assigned_to ?? null);
    setSuggestion(null);

    // Fetch staff
    setLoadingStaff(true);
    fetch('/api/staff')
      .then(r => r.json())
      .then((data: Staff[]) => {
        setStaff(data);
        setLoadingStaff(false);
      });

    // Fetch AI suggestion
    setLoadingAI(true);
    fetch('/api/ai/suggest-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket: {
          title: ticket.title,
          tag: ticket.tag,
          priority: ticket.priority,
          notes: ticket.notes,
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.staff_id) setSuggestion(data);
        setLoadingAI(false);
      })
      .catch(() => setLoadingAI(false));
  }, [open, ticket]);

  async function handleConfirm() {
    if (!selected) return;
    setAssigning(true);
    await fetch(`/api/tickets/${ticket.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: selected }),
    });
    setAssigning(false);
    onAssigned();
    onClose();
  }

  async function handleUnassign() {
    setAssigning(true);
    await fetch(`/api/tickets/${ticket.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: null }),
    });
    setAssigning(false);
    onAssigned();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 380,
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border)',
        zIndex: 101,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Assign Staff
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                marginTop: 3, lineHeight: 1.4,
                maxWidth: 300,
              }}>
                {ticket.title}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', padding: 4, borderRadius: 6,
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Ticket meta */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 600,
              padding: '3px 8px', borderRadius: 20,
              background: 'rgba(99,102,241,0.1)', color: '#6366f1',
            }}>
              {ticket.tag}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 20,
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              fontFamily: 'DM Mono',
            }}>
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>

          {/* AI Suggestion */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Sparkles size={11} />
              AI Recommendation
            </div>

            {loadingAI ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px', borderRadius: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing ticket...
              </div>
            ) : suggestion ? (
              <>
                <AISuggestionBadge reason={suggestion.reason} />
                {/* Auto-select AI suggestion */}
                {!ticket.assigned_to && selected === null && (() => {
                  // Side effect: auto-select suggestion
                  setTimeout(() => setSelected(suggestion.staff_id), 0);
                  return null;
                })()}
              </>
            ) : (
              <div style={{
                padding: '12px', borderRadius: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                Could not generate suggestion.
              </div>
            )}
          </div>

          {/* Staff list */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <UserCheck size={11} />
              All Staff
            </div>

            {loadingStaff ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Loading staff...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {staff.map(s => (
                  <StaffCard
                    key={s.id}
                    staff={s}
                    selected={selected === s.id}
                    suggested={suggestion?.staff_id === s.id}
                    onClick={() => setSelected(s.id)}
                    disabled={assigning}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          {ticket.assigned_to && (
            <button
              onClick={handleUnassign}
              disabled={assigning}
              style={{
                flex: 1, padding: '10px',
                borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: '1px solid var(--border)',
                background: 'none', color: 'var(--critical)',
                cursor: 'pointer',
              }}
            >
              Unassign
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selected || assigning}
            style={{
              flex: 2, padding: '10px',
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: 'none',
              background: selected ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-tertiary)',
              color: selected ? '#fff' : 'var(--text-muted)',
              cursor: selected ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {assigning
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Assigning...</>
              : 'Confirm Assignment'
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}