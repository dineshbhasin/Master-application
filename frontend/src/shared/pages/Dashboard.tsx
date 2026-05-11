import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const MODULE_CARDS = [
    { label: 'Vehicle & Driver Intel', to: '/dashboard/vehicle', desc: 'RC and DL verification via VAHAN/Sarathi', module: 'citizen', color: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
    { label: 'FASTag & Tolls', to: '/dashboard/fastag', desc: 'Balance, transactions and route planner', module: 'citizen', color: '#F0FDF4', border: '#BBF7D0', text: '#059669' },
    { label: 'Compliance Suite', to: '/dashboard/compliance', desc: 'GSTIN verification and E-Way Bill', module: 'sme', color: '#FFF7ED', border: '#FED7AA', text: '#D97706', roles: ['sme', 'enterprise', 'official'] },
    { label: 'EXIM & Trade', to: '/dashboard/exim', desc: 'HSN-based trade compliance checklist', module: 'sme', color: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED', roles: ['sme', 'enterprise', 'official'] },
    { label: 'My Identity', to: '/dashboard/identity', desc: 'DigiLocker documents and KYC', module: 'sme', color: '#FEF2F2', border: '#FECACA', text: '#DC2626', roles: ['sme', 'enterprise', 'official'] },
    { label: 'Multi-Modal Tracking', to: '/dashboard/tracking', desc: 'Air, Sea, Rail and Road shipment tracking', module: 'enterprise', color: '#F0FDF4', border: '#BBF7D0', text: '#059669', roles: ['enterprise', 'official'] },
    { label: 'Activity Log', to: '/dashboard/activity', desc: 'Platform audit trail', module: 'official', color: '#F8FAFC', border: '#E2E8F0', text: '#64748B', roles: ['official'] },
  ].filter((c) => !c.roles || (user && c.roles.includes(user.role)));

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 32 }}>
        You are signed in as <strong>{user?.role}</strong>. Your accessible modules are shown below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {MODULE_CARDS.map((card) => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: 14, padding: 20, transition: 'transform 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: card.text, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{card.module} module</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: 12, color: '#64748B' }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
