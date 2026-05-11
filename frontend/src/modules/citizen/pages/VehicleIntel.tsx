import React, { useState } from 'react';
import { vehicleApi } from '../../../api/vehicle';

type Tab = 'rc' | 'dl';

export default function VehicleIntel() {
  const [tab, setTab] = useState<Tab>('rc');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const PRESETS: Record<Tab, string[]> = {
    rc: ['MH12AB1234', 'DL8CAB5678', 'KA03MN9012', 'TN09CD3456', 'GJ01XX7890'],
    dl: ['MH1220230012345', 'DL0420190054321', 'KA0120181122334', 'TN0920150078965'],
  };

  async function handleLookup() {
    if (!input.trim()) { setError('Please enter a value.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = tab === 'rc'
        ? await vehicleApi.lookupRC(input.trim())
        : await vehicleApi.lookupDL(input.trim());
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message || 'Lookup failed.');
    } finally { setLoading(false); }
  }

  const isActive = (t: Tab) => tab === t;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>Vehicle &amp; Driver Intel</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Look up vehicle registration or driving licence details via VAHAN / Sarathi.</p>

      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
        {(['rc', 'dl'] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); setInput(''); setError(''); }}
            style={{ padding: '10px 20px', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: isActive(t) ? '#0A2342' : '#94A3B8', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: isActive(t) ? '#F59E0B' : 'transparent', marginBottom: -1 }}>
            {t === 'rc' ? 'Vehicle RC' : 'Driving Licence'}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>Quick test:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS[tab].map((p) => (
            <button key={p} onClick={() => setInput(p)}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', color: '#475569', fontFamily: 'monospace' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder={tab === 'rc' ? 'e.g. MH12AB1234' : 'e.g. MH1220230012345'}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
        <button onClick={handleLookup} disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 8, background: loading ? '#94A3B8' : '#0A2342', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Looking up…' : 'Look Up'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {result && (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginTop: 16 }}>
          {!!result._mock && <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>⚡ Mock data — configure API keys for live data</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {Object.entries(result).filter(([k]) => k !== '_mock').map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
