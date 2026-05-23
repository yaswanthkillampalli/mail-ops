'use client';
import {
  PieChart, Pie,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const TAG_COLORS: Record<string, string> = {
  Network:   '#3b82f6',
  Hardware:  '#a855f7',
  Software:  '#ec4899',
  Access:    '#f59e0b',
  Billing:   '#10b981',
  Complaint: '#ef4444',
  Info:      '#6b7280',
};

export default function TagDistributionChart({
  tagCounts,
}: {
  tagCounts: Record<string, number>;
}) {
  const data = Object.entries(tagCounts).map(([name, value]) => ({
    name,
    value,
    fill: TAG_COLORS[name] ?? '#6b7280',
  }));

  return (
    <ChartCard title="Tag Distribution">
      {data.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13, padding: 32,
        }}>
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={60} outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}