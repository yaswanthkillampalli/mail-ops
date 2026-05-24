'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  MessageSquareReply,
  Ticket,
  BarChart2,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/emails', icon: Mail, label: 'Emails' },
  { href: '/dashboard/replies', icon: MessageSquareReply, label: 'Replies' },
  { href: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/dashboard/monitoring', icon: BarChart2, label: 'Monitoring' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '16px',
      paddingBottom: '16px',
      zIndex: 50,
      gap: '4px',
    }}>
      {/* Logo dot */}
      <div style={{
        width: 32, height: 32,
        borderRadius: '10px',
        background: 'var(--accent)',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Mail size={16} color="white" />
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href ||
          (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} title={label} style={{
            width: 44, height: 44,
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.15s',
            textDecoration: 'none',
          }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }
            }}
          >
            <Icon size={20} />
          </Link>
        );
      })}

      {/* Bottom — theme toggle + settings */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button onClick={toggle} title="Toggle theme" style={{
          width: 44, height: 44,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

      </div>
    </aside>
  );
}