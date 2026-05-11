'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';

const PATH_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/vehicle': 'Vehicle & Driver Intelligence',
  '/dashboard/fastag': 'FASTag & Toll Management',
  '/dashboard/tracking': 'Multi-Modal Shipment Tracking',
  '/dashboard/compliance': 'Compliance Suite',
  '/dashboard/settings': 'Settings',
  '/dashboard/activity': 'Activity Log',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getPageTitle(pathname: string): string {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? 'Dashboard';
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
}

export default function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials = user?.name ? getInitials(user.name) : 'U';
  const title = getPageTitle(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6"
      style={{
        height: '64px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px 0 rgba(10,35,66,0.08)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center rounded-lg transition-colors"
          style={{ width: '38px', height: '38px', color: '#64748B', flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-navy font-semibold text-lg leading-tight">{title}</h1>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Unified Logistics Interface Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative flex items-center justify-center rounded-full transition-colors"
          style={{ width: '38px', height: '38px', color: '#64748B' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            className="absolute rounded-full"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#EF4444',
              top: '8px',
              right: '8px',
              border: '1.5px solid white',
            }}
          />
        </button>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
        >
          <span className="text-base" aria-label="India flag">
            🇮🇳
          </span>
          <span className="text-sm font-medium" style={{ color: '#0A2342' }}>
            India
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
            style={{ border: '1px solid #E2E8F0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#0A2342',
                color: 'white',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <ChevronDown
              size={14}
              style={{
                color: '#64748B',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 rounded-xl overflow-hidden animate-fade-in"
              style={{
                width: '200px',
                backgroundColor: 'white',
                boxShadow: '0 8px 24px rgba(10,35,66,0.15)',
                border: '1px solid #E2E8F0',
                top: '100%',
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <p className="text-sm font-semibold text-navy truncate">{user?.name ?? 'User'}</p>
                <p className="text-xs truncate" style={{ color: '#94A3B8' }}>
                  {user?.email ?? ''}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: '#374151' }}
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <User size={15} />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: '#374151' }}
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Settings size={15} />
                  Settings
                </Link>
                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
