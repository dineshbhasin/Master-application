import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, NodeInfo } from '../../../api/admin';

const navy = '#0A2342';

function statusStyle(s: string) {
  if (s === 'operational') return { bg: '#D1FAE5', text: '#065F46', dot: '#059669' };
  if (s === 'degraded')    return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' };
  return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' };
}

function LatencyBar({ ms }: { ms: number }) {
  const pct = Math.min((ms / 2000) * 100, 100);
  const color = ms < 200 ? '#059669' : ms < 500 ? '#F59E0B' : '#DC2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: navy, minWidth: 50, textAlign: 'right' }}>{ms}ms</span>
    </div>
  );
}

export default function NodeHealth() {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [summary, setSummary] = useState({ operational: 0, degraded: 0, down: 0 });
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNodeHealth();
      setNodes(data.nodes);
      setSummary(data.summary);
      setCheckedAt(data.checkedAt);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>Ministerial Node Health</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Upstream Gov API latency · Last refresh: {checkedAt ? new Date(checkedAt).toLocaleTimeString() : '—'}</p>
        </div>
        <button onClick={fetchHealth} disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, background: navy, color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Checking…' : '↻ Refresh'}
        </button>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Operational', count: summary.operational, color: '#059669', bg: '#D1FAE5' },
          { label: 'Degraded',    count: summary.degraded,    color: '#D97706', bg: '#FEF3C7' },
          { label: 'Down',        count: summary.down,        color: '#DC2626', bg: '#FEE2E2' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Node grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {nodes.map((node) => {
          const style = statusStyle(node.status);
          const isOpen = expanded === node.id;
          return (
            <div key={node.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : node.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: navy, marginBottom: 2 }}>{node.name}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8' }}>{node.ministry}</p>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 99, background: style.bg, color: style.text, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
                    {node.status}
                  </span>
                </div>
                <LatencyBar ms={node.latencyMs} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{node.endpoint}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>Uptime: {node.uptime30d}%</span>
                </div>
              </div>

              {isOpen && node.incidents.length > 0 && (
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 24px', background: '#FAFAFA' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: navy, marginBottom: 10 }}>Recent Incidents</p>
                  {node.incidents.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', whiteSpace: 'nowrap', marginTop: 2 }}>{inc.date}</span>
                      <div>
                        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{inc.description}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>Duration: {inc.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isOpen && node.incidents.length === 0 && (
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 24px', background: '#FAFAFA' }}>
                  <p style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ No incidents in last 30 days</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
