export default function ChartCard({
  title, children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}