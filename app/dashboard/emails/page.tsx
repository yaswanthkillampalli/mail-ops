'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealtimeRefresh } from '@/lib/realtime';
import EmailList from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';

export default function EmailsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <EmailsPageContent />
    </Suspense>
  );
}

function EmailsPageContent() {
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id')
  );
  const [loading, setLoading] = useState(true);

  const fetchEmails = useCallback(async () => {
    const data = await fetch('/api/emails').then(r => r.json());
    setEmails(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);
  useRealtimeRefresh(['emails', 'email_analysis'], fetchEmails);

  const selectedEmail = emails.find(e => e.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 30% — Email List */}
      <div style={{
        width: '30%',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <EmailList
          emails={emails}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* 60% — Email Detail */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <EmailDetail
          email={selectedEmail}
          onUpdate={fetchEmails}
        />
      </div>
    </div>
  );
}