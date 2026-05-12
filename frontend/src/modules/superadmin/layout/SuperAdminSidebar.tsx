import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';

const NAV = [
  { to: '/super-admin/overview',       label: 'Overview',           icon: '◈' },
  { to: '/super-admin/analytics',      label: 'Analytics',          icon: '📈' },
  { to: '/super-admin/node-health',    label: 'Node Health',        icon: '🛰' },
  { to: '/super-admin/organizations',  label: 'Organizations',      icon: '🏢' },
  { to: '/super-admin/users',          label: 'User Management',    icon: '👥' },
  { to: '/super-admin/audit-trail',    label: 'Audit Trail',        icon: '🔒' },
  { to: '/super-admin/dpdp',           label: 'DPDP Requests',      icon: '🧹' },
  { to: '/super-admin/api-keys',       label: 'API Keys',           icon: '🗝' },
];

const navy = '#0A2342';
const navyLight = '#0D2D56';
const saffron = '#F59E0B';

export default function SuperAdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <div style={{ width: 240, minHeight: '100vh', background: navy, display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: navy }}>U</div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0 }}>ULIP Platform</p>
            <p style={{ color: saffron, fontWeight: 600, fontSize: 10, margin: 0, letterSpacing: '0.08em' }}>SUPER ADMIN</p>
          </div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Signed in as</p>
          <p style={{ color: 'white', fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', textDecoration: 'none',
              background: isActive ? navyLight : 'transparent',
              borderLeft: isActive ? `3px solid ${saffron}` : '3px solid transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}>
            <span style={{ fontSize: 16, minWidth: 20 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <NavLink to="/dashboard"
          style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none', marginBottom: 10 }}>
          ← Back to Dashboard
        </NavLink>
        <button onClick={logout}
          style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
