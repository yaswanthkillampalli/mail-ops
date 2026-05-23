const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High: 'var(--high)',
  Medium: 'var(--medium)',
  Low: 'var(--low)',
};

export function getPriorityColor(priority: string) {
  return PRIORITY_COLOR[priority] ?? 'var(--border)';
}

export default function TicketPriorityBar({ priority }: { priority: string }) {
  return (
    <div style={{
      height: 3, borderRadius: 2,
      background: getPriorityColor(priority),
    }} />
  );
}