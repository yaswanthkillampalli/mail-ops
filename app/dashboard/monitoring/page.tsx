'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeRefresh } from '@/lib/realtime';
import { Spinner } from '@/components/ui/spinner';
import StatCards from '@/components/StatCards';
import TagDistributionChart from '@/components/TagDistributionChart';
import PriorityDistributionChart from '@/components/PriorityDistributionChart';
import SentimentDistributionChart from '@/components/SentimentDistributionChart';
import ModelInfoCards from '@/components/ModelInfoCards';

export default function MonitoringPage() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const data = await fetch('/api/monitoring').then(r => r.json());
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchStats();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchStats]);
  useRealtimeRefresh(['email_analysis'], fetchStats);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  return (
    <div style={{
      height: '100vh', overflow: 'auto',
      padding: '28px 32px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
          AI Monitoring
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Groq + Cerebras usage and analysis stats
        </p>
      </div>

      <StatCards total={stats.total as number} lastRun={stats.lastRun as string | null} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <TagDistributionChart tagCounts={stats.tagCounts as Record<string, number>} />
        <PriorityDistributionChart priorityCounts={stats.priorityCounts as Record<string, number>} />
      </div>

      <SentimentDistributionChart sentimentCounts={stats.sentimentCounts as Record<string, number>} />

      <ModelInfoCards total={stats.total as number} />
    </div>
  );
}