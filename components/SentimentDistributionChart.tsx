'use client';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const SENTIMENT_COLORS: Record<string, string> = {
  Angry:      '#ef4444',
  Frustrated: '#f97316',
  Neutral:    '#6b7280',
  Positive:   '#22c55e',
};

export default function SentimentDistributionChart({
  sentimentCounts,
}: {
  sentimentCounts: Record<string, number>;
}) {
  const data = Object.entries(sentimentCounts).map(([name, value]) => ({
    name, value: value as number,
    fill: SENTIMENT_COLORS[name] ?? '#6b7280',
  }));

  return (
    <ChartCard title="Sentiment Distribution">
      {data.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13, padding: 32,
        }}>
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={56}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false}/>
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              shape={(props: { x: number; y: number; width: number; height: number; index: number }) => {
                const { x, y, width, height, index } = props;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={data?.[index]?.fill ?? '#6b7280'}
                    rx={6}
                    ry={6}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}