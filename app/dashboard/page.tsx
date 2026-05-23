// app/dashboard/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeRefresh } from '@/lib/realtime';
import { Spinner } from '@/components/ui/spinner';
import StatsBar from '@/components/StatsBar';
import RecentEmails from '@/components/RecentEmails';
import PendingTickets from '@/components/PendingTickets';

const TABLES = ['emails', 'tickets', 'email_analysis'];

type DashboardStats = {
  unread: number;
  openTickets: number;
  critical: number;
  resolvedToday: number;
};

type DashboardEmail = {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  status: string;
  received_at: string;
  email_analysis?: unknown;
};

type DashboardTicket = {
  id: string;
  status: string;
  priority: string | null;
  title: string;
  created_at: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [emails, setEmails] = useState<DashboardEmail[]>([]);
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [s, e, t] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/dashboard/emails').then(r => r.json()),
        fetch('/api/dashboard/tickets').then(r => r.json()),
    ]);
    setStats(s);
    setEmails(e);
    setTickets(t);
    setLoading(false);
}, []);

    useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAll]);

  // realtime — refetch whenever anything changes
  useRealtimeRefresh(TABLES, fetchAll);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner className="size-5" />
    </div>
  );

  return (
    <div style={{
      height: '100vh', overflow: 'auto',
      padding: '28px 32px',
      display: 'flex', flexDirection: 'column', gap: '24px',
    }}>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
          Operations Overview
        </h1>
      </div>

      {stats && <StatsBar stats={stats} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        flex: 1,
      }}>
        <RecentEmails emails={emails} />
        <PendingTickets tickets={tickets} />
      </div>
    </div>
  );
}