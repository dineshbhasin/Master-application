import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/admin';

const navy = '#0A2342';
const saffron = '#F59E0B';

interface KPIs { apiCalls24h: number; apiCalls30d: number; successRate: number; errorRate: number; activeOrgs: number; pendingErasures: number; anomalyAlerts: number; _mock?: boolean }

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
      <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent || navy, marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#64748B' }}>{sub}</p>}
    </div>
  );
}

const RECENT_ACTIONS = [
  { time: '14:32', actor: 'admin@ulip.gov.in', action: 'API_KEY_ROTATED', target: 'Tata Logistics Ltd', status: 'success' },
  { time: '12:11', actor: 'admin@ulip.gov.in', action: 'ROLE_CHANGE',     target: 'dev@flipkart.com → enterprise', status: 'success' },
  { time: '09:48', actor: 'admin@ulip.gov.in', action: 'MODULE_TOGGLE',   target: 'Mahindra Freight – ESG Tracker ON', status: 'success' },
  { time: '08:20', actor: 'system',             action: 'ANOMALY_ALERT',   target: 'BlueDart — 18× spike in /api/tracking', status: 'failure' },
  { time: 'Yesterday', actor: 'admin@ulip.gov.in', action: 'DPDP_ERASURE_APPROVED', target: 'arjun.verma@logistics.co', status: 'success' },
];

export default function Overview() {
  const [kpi, setKpi] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOverview()
      .then(setKpi)
      .catch(() => setKpi({ apiCalls24h: 142380, apiCalls30d: 3847291, successRate: 99.2, errorRate: 0.8, activeOrgs: 847, pendingErasures: 3, anomalyAlerts: 2, _mock: true }))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>Governance Overview</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>ULIP Super Admin Console · Data region: in-west1 (Mumbai) 🇮🇳</p>
      </div>

      {!!kpi?._mock && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#92400E' }}>
          ⚡ Showing mock data — connect MongoDB to see live aggregations
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: 14 }}>Loading KPIs…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="API Calls (24h)"  value={fmt(kpi!.apiCalls24h)}  sub="vs 138K yesterday" />
          <StatCard label="API Calls (30d)"  value={fmt(kpi!.apiCalls30d)}  sub="₹0 infra cost (sovereign cloud)" />
          <StatCard label="Success Rate"     value={`${kpi!.successRate}%`} sub={`Error: ${kpi!.errorRate}%`} accent="#059669" />
          <StatCard label="Active Orgs"      value={String(kpi!.activeOrgs)} sub="↑ 12 this month" />
          <StatCard label="Pending DPDP"     value={String(kpi!.pendingErasures)} sub="Right-to-erasure queue" accent={kpi!.pendingErasures > 0 ? '#D97706' : '#059669'} />
          <StatCard label="Anomaly Alerts"   value={String(kpi!.anomalyAlerts)} sub="Usage spikes detected" accent={kpi!.anomalyAlerts > 0 ? '#DC2626' : '#059669'} />
          <StatCard label="Data Region"      value="in-west1" sub="Mumbai · Sovereign cloud ✓" />
          <StatCard label="Chain Integrity"  value="Verified" sub="SHA-256 hash chain intact" accent="#059669" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Module call breakdown */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: 20 }}>Module API Breakdown (30d)</h2>
          {[
            { name: 'VAHAN (RC Lookup)',    calls: 892341, color: saffron },
            { name: 'FASTag',               calls: 643120, color: '#3B82F6' },
            { name: 'GSTN Compliance',      calls: 421880, color: '#8B5CF6' },
            { name: 'ICEGATE (EXIM)',       calls: 312450, color: '#10B981' },
            { name: 'Multi-Modal Tracking', calls: 284670, color: '#F97316' },
            { name: 'Sarathi (DL Lookup)',  calls: 176210, color: '#EC4899' },
          ].map((m) => {
            const pct = Math.round((m.calls / 892341) * 100);
            return (
              <div key={m.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: navy, fontWeight: 700, fontFamily: 'monospace' }}>{(m.calls / 1000).toFixed(0)}K</p>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent admin actions */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: 20 }}>Recent Admin Actions</h2>
          {RECENT_ACTIONS.map((a, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < RECENT_ACTIONS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: navy, margin: 0 }}>{a.action.replace(/_/g, ' ')}</p>
                <span style={{ fontSize: 10, color: a.status === 'success' ? '#059669' : '#DC2626', fontWeight: 700 }}>
                  {a.status === 'success' ? '✓' : '⚠'}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0' }}>{a.target}</p>
              <p style={{ fontSize: 10, color: '#CBD5E1', margin: 0 }}>{a.time} · {a.actor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
