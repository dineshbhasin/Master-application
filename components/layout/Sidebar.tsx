'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Car,
  CreditCard,
  Map,
  FileCheck,
  Leaf,
  Landmark,
  BarChart3,
  Settings,
  Activity,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Vehicle & Driver Intel', href: '/dashboard/vehicle', icon: <Car size={18} /> },
      { label: 'FASTag & Tolls', href: '/dashboard/fastag', icon: <CreditCard size={18} /> },
      { label: 'Multi-Modal Tracking', href: '/dashboard/tracking', icon: <Map size={18} /> },
      { label: 'Compliance Suite', href: '/dashboard/compliance', icon: <FileCheck size={18} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
      { label: 'Activity Log', href: '/dashboard/activity', icon: <Activity size={18} /> },
    ],
  },
];

const comingSoonItems = [
  { label: 'Sustainability', icon: <Leaf size={18} /> },
  { label: 'Trade Finance', icon: <Landmark size={18} /> },
  { label: 'Smart City', icon: <BarChart3 size={18} /> },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name ? getInitials(user.name) : 'U';
  const role = (user as { role?: string } | undefined)?.role ?? 'User';

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside
      style={{ width: '260px', backgroundColor: '#0A2342' }}
      className="fixed left-0 top-0 h-full flex flex-col z-40 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col">
            <span className="text-white font-bold text-2xl tracking-tight">ULIP</span>
            <span style={{ color: '#F59E0B' }} className="text-xs font-medium mt-0.5">
              Logistics Gateway
            </span>
          </div>
          <div style={{ backgroundColor: '#F59E0B', height: '1px', opacity: 0.4 }} className="mt-4" />
        </div>

        <nav className="px-4 pb-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p
                style={{ color: 'rgba(255,255,255,0.35)' }}
                className="text-xs font-600 uppercase tracking-widest px-2 mb-2"
              >
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={active ? 'nav-link-active' : 'nav-link'}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div>
            <p
              style={{ color: 'rgba(255,255,255,0.35)' }}
              className="text-xs font-600 uppercase tracking-widest px-2 mb-2"
            >
              Coming Soon
            </p>
            <ul className="space-y-0.5">
              {comingSoonItems.map((item) => (
                <li key={item.label}>
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-not-allowed"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {item.icon}
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <span
                      style={{
                        backgroundColor: 'rgba(245,158,11,0.2)',
                        color: '#F59E0B',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      Soon
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full text-sm font-bold shrink-0"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#F59E0B',
                color: '#0A2342',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold text-white truncate"
                title={user?.name ?? 'User'}
              >
                {user?.name ?? 'User'}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                title={user?.email ?? ''}
              >
                {user?.email ?? ''}
              </p>
            </div>
          </div>
          <div className="mt-2 ml-[50px]">
            <span
              style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)';
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
