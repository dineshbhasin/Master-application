import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

// ── API Usage Heatmap ──────────────────────────────────────────────────────────

const HEAT_COLORS = ['#F3F4F6', '#BBF7D0', '#6EE7B7', '#10B981', '#059669'];
const HEAT_LABELS = ['No calls', '1–50', '51–200', '201–500', '500+'];

function generateHeatData(): { date: Date; count: number; level: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data: { date: Date; count: number; level: number }[] = [];

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

    // pseudo-random but deterministic based on date
    const seed = (d.getFullYear() * 1000 + doy) % 100;
    const isWeekend = dow === 0 || dow === 6;
    const recentBoost = i < 30 ? 1.4 : i < 90 ? 1.1 : 1;

    let count = 0;
    if (seed > 15) {
      const base = isWeekend ? 20 : 80;
      count = Math.floor(((seed - 15) / 85) * base * recentBoost * (1 + (seed % 5) * 0.3));
    }

    let level = 0;
    if (count > 500) level = 4;
    else if (count > 200) level = 3;
    else if (count > 50) level = 2;
    else if (count > 0) level = 1;

    data.push({ date: d, count, level });
  }
  return data;
}

function ApiHeatmap() {
  const data = useMemo(() => generateHeatData(), []);

  const CELL = 13;
  const GAP  = 2;
  const STEP  = CELL + GAP;
  const cols = 52;
  const rows = 7;
  const W = cols * STEP;
  const H = rows * STEP + 28;

  const weeks: typeof data[] = [];
  let week: typeof data = [];
  data.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === data.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const totalCalls = data.reduce((a, d) => a + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px 28px', marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A2342', margin: 0 }}>API Usage — Last 52 Weeks</h2>
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            <strong style={{ color: '#111827' }}>{totalCalls.toLocaleString()}</strong> total API calls across{' '}
            <strong style={{ color: '#111827' }}>{activeDays}</strong> active days
          </p>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Less</span>
          {HEAT_COLORS.map((c, i) => (
            <div key={i} title={HEAT_LABELS[i]} style={{ width: CELL, height: CELL, background: c, borderRadius: 3 }} />
          ))}
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W + 32} height={H} style={{ display: 'block' }}>
          {/* Day labels */}
          {dayLabels.map((label, r) => label && (
            <text key={r} x={0} y={r * STEP + CELL + 22} fontSize={9} fill="#9CA3AF" dominantBaseline="middle">{label}</text>
          ))}

          {/* Month labels */}
          {weeks.map((week, c) => {
            const firstDay = week[0];
            if (!firstDay) return null;
            const isFirstOfMonth = firstDay.date.getDate() <= 7;
            if (!isFirstOfMonth) return null;
            return (
              <text key={c} x={c * STEP + 32} y={14} fontSize={9} fill="#9CA3AF">{months[firstDay.date.getMonth()]}</text>
            );
          })}

          {/* Cells */}
          {weeks.map((week, c) =>
            week.map((day, r) => {
              const x = c * STEP + 32;
              const y = r * STEP + 22;
              const label = `${day.date.toDateString()}: ${day.count.toLocaleString()} API calls`;
              return (
                <rect key={`${c}-${r}`} x={x} y={y} width={CELL} height={CELL}
                  rx={3} ry={3} fill={HEAT_COLORS[day.level]}
                  style={{ cursor: 'default' }}>
                  <title>{label}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  const MODULE_CARDS = [
    { label: 'Vehicle & Driver Intel', to: '/dashboard/vehicle', desc: 'RC and DL verification via VAHAN/Sarathi', module: 'citizen', color: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
    { label: 'FASTag & Tolls', to: '/dashboard/fastag', desc: 'Balance, transactions and route planner', module: 'citizen', color: '#F0FDF4', border: '#BBF7D0', text: '#059669' },
    { label: 'Compliance Suite', to: '/dashboard/compliance', desc: 'GSTIN verification and E-Way Bill', module: 'sme', color: '#FFF7ED', border: '#FED7AA', text: '#D97706', roles: ['sme', 'enterprise', 'official'] },
    { label: 'EXIM & Trade', to: '/dashboard/exim', desc: 'HSN-based trade compliance checklist', module: 'sme', color: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED', roles: ['sme', 'enterprise', 'official'] },
    { label: 'My Identity', to: '/dashboard/identity', desc: 'DigiLocker documents and KYC', module: 'sme', color: '#FEF2F2', border: '#FECACA', text: '#DC2626', roles: ['sme', 'enterprise', 'official'] },
    { label: 'Multi-Modal Tracking', to: '/dashboard/tracking', desc: 'Air, Sea, Rail and Road shipment tracking', module: 'enterprise', color: '#F0FDF4', border: '#BBF7D0', text: '#059669', roles: ['enterprise', 'official'] },
    { label: 'Route Planner', to: '/dashboard/routes', desc: 'Optimised routes with toll & risk data', module: 'enterprise', color: '#FFFBEB', border: '#FDE68A', text: '#D97706', roles: ['enterprise', 'official'] },
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

      <ApiHeatmap />
    </div>
  );
}
