'use client';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#22c55e',
};

export default function PriorityDistributionChart({
  priorityCounts,
}: {
  priorityCounts: Record<string, number>;
}) {
  const data = Object.entries(priorityCounts).map(([name, value]) => ({
    name, value: value as number,
    fill: PRIORITY_COLORS[name] ?? '#6b7280',
  }));

  return (
    <ChartCard title="Priority Distribution">
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
          <BarChart data={data} barSize={36}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
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