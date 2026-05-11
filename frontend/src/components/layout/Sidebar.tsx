import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface NavItem { label: string; to: string; roles?: string[] }

const NAV: NavItem[] = [
  // Citizen module
  { label: 'Vehicle & Driver Intel', to: '/dashboard/vehicle' },
  { label: 'FASTag & Tolls',         to: '/dashboard/fastag' },
  // SME module
  { label: 'Compliance Suite',       to: '/dashboard/compliance',  roles: ['sme', 'enterprise', 'official'] },
  { label: 'EXIM & Trade',           to: '/dashboard/exim',        roles: ['sme', 'enterprise', 'official'] },
  { label: 'My Identity',            to: '/dashboard/identity',    roles: ['sme', 'enterprise', 'official'] },
  // Enterprise module
  { label: 'Multi-Modal Tracking',   to: '/dashboard/tracking',    roles: ['enterprise', 'official'] },
  { label: 'Route Planner',          to: '/dashboard/routes',      roles: ['enterprise', 'official'] },
  // Official module
  { label: 'Activity Log',           to: '/dashboard/activity',    roles: ['official'] },
];

interface Props { open: boolean; onClose: () => void }

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  const visibleNav = NAV.filter((item) =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const initials = user?.name?.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, display: 'block' }}
          className="md-hidden" />
      )}

      <aside style={{
        width: 260, backgroundColor: '#0A2342', height: '100vh',
        position: 'fixed', left: 0, top: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>ULIP</p>
              <p style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600 }}>Logistics Gateway</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <NavLink to="/dashboard" end
            style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, marginBottom: 4, textDecoration: 'none', fontSize: 13, fontWeight: 600, color: isActive ? 'white' : 'rgba(255,255,255,0.5)', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' })}
            onClick={onClose}>
            Dashboard
          </NavLink>

          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, marginBottom: 4, textDecoration: 'none', fontSize: 13, fontWeight: 600, color: isActive ? 'white' : 'rgba(255,255,255,0.5)', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' })}
              onClick={onClose}>
              {item.label}
              {item.roles && (
                <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(245,158,11,0.2)', color: '#F59E0B', padding: '2px 5px', borderRadius: 3, fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.roles[0]}+
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0A2342', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, textTransform: 'uppercase' }}>
            {user?.role}
          </span>
          <button onClick={handleLogout}
            style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
