const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Network:   { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6' },
  Hardware:  { bg: 'rgba(168,85,247,0.1)',  text: '#a855f7' },
  Software:  { bg: 'rgba(236,72,153,0.1)',  text: '#ec4899' },
  Access:    { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b' },
  Billing:   { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
  Complaint: { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444' },
  Info:      { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' },
};

export function getTagStyle(tag: string) {
  return TAG_COLORS[tag] ?? TAG_COLORS.Info;
}

export default function TicketBadges({
  tag, priority, size = 'md',
}: {
  tag?: string;
  priority?: string;
  size?: 'sm' | 'md';
}) {
  const tagStyle = getTagStyle(tag ?? '');
  const fs = size === 'sm' ? 9 : 10;
  const px = size === 'sm' ? '2px 6px' : '2px 7px';

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
      {tag && (
        <span style={{
          fontSize: fs, fontWeight: size === 'sm' ? 600 : 500,
          padding: px, borderRadius: 20,
          background: tagStyle.bg, color: tagStyle.text,
          whiteSpace: 'nowrap',
        }}>
          {tag}
        </span>
      )}
      {priority && (
        <span style={{
          fontSize: fs, fontWeight: 700,
          color: `var(--${priority.toLowerCase()})`,
          fontFamily: 'DM Mono',
        }}>
          {priority}
        </span>
      )}
    </div>
  );
}