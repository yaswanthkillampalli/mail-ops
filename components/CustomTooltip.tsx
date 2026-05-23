export default function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px',
      fontSize: 12, color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 600 }}>{payload[0].name}</div>
      <div style={{ color: 'var(--text-muted)' }}>Count: {payload[0].value}</div>
    </div>
  );
}