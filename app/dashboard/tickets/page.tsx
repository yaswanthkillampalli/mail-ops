'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useRealtimeRefresh } from '@/lib/realtime';
import KanbanBoard from '@/components/KanbanBoard';

type Ticket = {
  title?: string;
  tag?: string;
  priority?: string;
  emails?: unknown;
  status?: string;
};
import { Spinner } from '@/components/ui/spinner';

export default function TicketsPage() {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    const data = await fetch('/api/dashboard/tickets').then(r => r.json());
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTickets();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTickets]);
  useRealtimeRefresh(['tickets'], fetchTickets);

  // Filter tickets across title, tag, from name/email
  const filtered = search.trim()
    ? tickets.filter(t => {
        const q = search.toLowerCase();
        const email = Array.isArray(t.emails) ? t.emails[0] : t.emails;
        const emailObj = (email && typeof email === 'object') ? (email as Record<string, unknown>) : {};
        return (
          String(t.title ?? '').toLowerCase().includes(q) ||
          String(t.tag ?? '').toLowerCase().includes(q) ||
          String(t.priority ?? '').toLowerCase().includes(q) ||
          String(emailObj['from_name'] ?? '').toLowerCase().includes(q) ||
          String(emailObj['from_email'] ?? '').toLowerCase().includes(q)
        );
      })
    : tickets;

  const STATUS_COLORS: Record<string, string> = {
    Open: '#3b82f6',
    'In Progress': '#f59e0b',
    Escalated: 'var(--critical)',
    Resolved: 'var(--low)',
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 16,
      }}>
        {/* Title */}
        <div style={{ flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            Tickets
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage and track all support tickets
          </p>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 12px',
          flex: 1, maxWidth: 320,
          transition: 'border-color 0.15s',
        }}>
          <Search size={13} color='var(--text-muted)' style={{ flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, tag, priority, sender..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 12, color: 'var(--text-primary)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {['Open', 'In Progress', 'Escalated', 'Resolved'].map(status => {
            const count = filtered.filter(t => t.status === status).length;
            return count > 0 ? (
              <span key={status} style={{
                fontSize: 11, padding: '4px 10px',
                borderRadius: 20, fontFamily: 'DM Mono',
                background: `${STATUS_COLORS[status]}18`,
                color: STATUS_COLORS[status],
                fontWeight: 600,
              }}>
                {count} {status}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Search result hint */}
      {search && (
        <div style={{
          padding: '8px 28px',
          fontSize: 11, color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          {filtered.length === 0
            ? `No tickets match "${search}"`
            : `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''} match "${search}"`
          }
        </div>
      )}

      {/* Kanban */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : (
          <KanbanBoard
            tickets={filtered}
            expandedTicketId={expandedTicketId}
            onExpandTicket={ticketId => setExpandedTicketId(ticketId)}
            onUpdate={fetchTickets}
          />
        )}
      </div>
    </div>
  );
}