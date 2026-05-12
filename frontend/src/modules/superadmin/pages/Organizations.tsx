import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, Organization, OrgModules } from '../../../api/admin';

const navy = '#0A2342';
const saffron = '#F59E0B';

const MODULE_LABELS: Record<keyof OrgModules, string> = {
  vehicleIntel: 'Vehicle Intel', fastag: 'FASTag', compliance: 'GST Compliance',
  tracking: 'Multi-Modal Tracking', routePlanner: 'Route Planner', exim: 'EXIM & Trade',
  identity: 'My Identity', esgTracker: 'ESG Tracker', railLogistics: 'Rail Logistics',
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      style={{ width: 40, height: 22, borderRadius: 99, border: 'none', background: on ? '#059669' : '#CBD5E1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', display: 'block' }} />
    </button>
  );
}

function statusPill(status: string) {
  const s: Record<string, { bg: string; color: string }> = {
    active: { bg: '#D1FAE5', color: '#065F46' },
    suspended: { bg: '#FEE2E2', color: '#991B1B' },
    pending: { bg: '#FEF3C7', color: '#92400E' },
  };
  const st = s[status] || s.pending;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.color }}>{status}</span>;
}

export default function Organizations() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [localModules, setLocalModules] = useState<Record<string, OrgModules>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrganizations({ search: search || undefined, tier: tierFilter || undefined });
      setOrgs(data.organizations);
      const initial: Record<string, OrgModules> = {};
      data.organizations.forEach((o) => { initial[o.id] = { ...o.modules }; });
      setLocalModules(initial);
    } catch { } finally { setLoading(false); }
  }, [search, tierFilter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function saveModules(orgId: string) {
    setSaving(orgId);
    try { await adminApi.updateModules(orgId, localModules[orgId]); }
    catch { } finally { setSaving(null); }
  }

  function toggleModule(orgId: string, key: keyof OrgModules, value: boolean) {
    setLocalModules((prev) => ({ ...prev, [orgId]: { ...prev[orgId], [key]: value } }));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>Organization Registry</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Searchable registry · Feature toggles · Status management</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or domain…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', background: 'white', color: '#475569' }}>
          <option value="">All tiers</option>
          <option value="government">Government</option>
          <option value="enterprise">Enterprise</option>
          <option value="sme">SME</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Organization', 'Tier', 'Status', 'API Calls (30d)', 'Data Region', 'Modules', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Loading…</td></tr>
            ) : orgs.map((org) => {
              const activeModules = Object.values(org.modules || {}).filter(Boolean).length;
              const isOpen = expanded === org.id;
              return (
                <React.Fragment key={org.id}>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer', background: isOpen ? '#F8FAFC' : 'white' }} onClick={() => setExpanded(isOpen ? null : org.id)}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 700, color: navy, margin: 0 }}>{org.name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontFamily: 'monospace' }}>{org.domain}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: org.tier === 'government' ? '#EDE9FE' : org.tier === 'enterprise' ? '#DBEAFE' : '#FEF3C7', color: org.tier === 'government' ? '#5B21B6' : org.tier === 'enterprise' ? '#1E40AF' : '#92400E' }}>
                        {org.tier}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{statusPill(org.status)}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: navy, fontWeight: 600 }}>
                      {org.apiCalls30d !== undefined ? `${((org.apiCalls30d || 0) / 1000).toFixed(0)}K` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B', fontFamily: 'monospace' }}>{org.dataRegion || 'in-west1'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 12, color: '#475569' }}>{activeModules}/9 enabled</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</td>
                  </tr>

                  {isOpen && localModules[org.id] && (
                    <tr>
                      <td colSpan={7} style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 16 }}>Feature Toggles — {org.name}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                          {(Object.keys(MODULE_LABELS) as (keyof OrgModules)[]).map((key) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 10, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
                              <span style={{ fontSize: 13, color: '#475569' }}>{MODULE_LABELS[key]}</span>
                              <Toggle on={localModules[org.id][key]} onChange={(v) => toggleModule(org.id, key, v)} />
                            </div>
                          ))}
                        </div>
                        <button onClick={() => saveModules(org.id)} disabled={saving === org.id}
                          style={{ padding: '8px 20px', borderRadius: 8, background: saving === org.id ? '#94A3B8' : saffron, color: navy, border: 'none', fontWeight: 700, fontSize: 13, cursor: saving === org.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          {saving === org.id ? 'Saving…' : 'Save Toggles'}
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
