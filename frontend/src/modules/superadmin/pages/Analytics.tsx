import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/admin';

const navy = '#0A2342';
const saffron = '#F59E0B';

type Period = '24h' | '7d' | '30d';

interface TrendPoint { date: string; value: number }

function Trendline({ enterprise, citizen, height = 140 }: { enterprise: TrendPoint[]; citizen: TrendPoint[]; height?: number }) {
  const all = [...enterprise, ...citizen].map((p) => p.value);
  const max = Math.max(...all, 1);
  const W = 600; const H = height; const PAD = 8;

  function toPoints(data: TrendPoint[]) {
    return data.map((p, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((p.value / max) * (H - PAD * 2));
      return `${x},${y}`;
    }).join(' ');
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      <polyline points={toPoints(enterprise)} fill="none" stroke={saffron} strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={toPoints(citizen)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ successRate }: { successRate: number }) {
  const r = 54; const cx = 70; const cy = 70;
  const circ = 2 * Math.PI * r;
  const successDash = (successRate / 100) * circ;
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={18} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#059669" strokeWidth={18}
        strokeDasharray={`${successDash} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#DC2626" strokeWidth={18}
        strokeDasharray={`${circ - successDash} ${circ}`}
        strokeDashoffset={-(successDash - circ / 4)}
        strokeLinecap="round" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="800" fill={navy}>{successRate}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94A3B8">success</text>
    </svg>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('30d');
  const [enterprise, setEnterprise] = useState<TrendPoint[]>([]);
  const [citizen, setCitizen] = useState<TrendPoint[]>([]);
  const [successRate, setSuccessRate] = useState(99.2);
  const [errorRate, setErrorRate] = useState(0.8);
  const [modules, setModules] = useState<{ name: string; calls: number; errors: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getTrendline(period),
      adminApi.getOverview(),
      adminApi.getModules(),
    ]).then(([trend, overview, mods]) => {
      setEnterprise(trend.enterprise || []);
      setCitizen(trend.citizen || []);
      setSuccessRate(overview.successRate);
      setErrorRate(overview.errorRate);
      setModules(mods.modules || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  const PERIODS: Period[] = ['24h', '7d', '30d'];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>Platform Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Enterprise vs. Citizen adoption · Success/Error rates · Module breakdown</p>
      </div>

      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 10, padding: 4, border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {PERIODS.map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '6px 20px', borderRadius: 7, border: 'none', background: period === p ? navy : 'transparent', color: period === p ? 'white' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, marginBottom: 20 }}>
        {/* Trendline */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: navy }}>API Call Trendline</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span><span style={{ color: saffron, fontWeight: 700 }}>—</span> Enterprise</span>
              <span><span style={{ color: '#3B82F6', fontWeight: 700 }}>—</span> Citizen</span>
            </div>
          </div>
          {loading ? <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>Loading…</div>
            : <Trendline enterprise={enterprise} citizen={citizen} />}
          {enterprise.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{enterprise[0]?.date}</span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{enterprise[enterprise.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Donut */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: 16 }}>Success/Error</h2>
          <DonutChart successRate={successRate} />
          <div style={{ marginTop: 12, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            <p style={{ color: '#059669', fontWeight: 600 }}>{successRate}% Success</p>
            <p style={{ color: '#DC2626', fontWeight: 600 }}>{errorRate}% Error</p>
          </div>
        </div>
      </div>

      {/* Module table */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: 16 }}>Module Performance</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              {['Module', 'API Calls (30d)', 'Errors', 'Error Rate', 'SLA'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => {
              const errPct = ((m.errors / m.calls) * 100).toFixed(2);
              const sla = parseFloat(errPct) < 1 ? '✓ OK' : parseFloat(errPct) < 2 ? '⚠ Watch' : '✗ Breach';
              const slaColor = parseFloat(errPct) < 1 ? '#059669' : parseFloat(errPct) < 2 ? '#D97706' : '#DC2626';
              return (
                <tr key={m.name} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 600, color: navy }}>{m.name}</td>
                  <td style={{ padding: '12px 12px', fontFamily: 'monospace' }}>{(m.calls / 1000).toFixed(0)}K</td>
                  <td style={{ padding: '12px 12px', fontFamily: 'monospace' }}>{m.errors.toLocaleString()}</td>
                  <td style={{ padding: '12px 12px', color: parseFloat(errPct) > 1 ? '#DC2626' : '#475569' }}>{errPct}%</td>
                  <td style={{ padding: '12px 12px', color: slaColor, fontWeight: 700, fontSize: 12 }}>{sla}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
