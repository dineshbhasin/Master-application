import React, { useState } from 'react';
import { complianceApi } from '../../../api/compliance';

type Tab = 'gstin' | 'ewb-lookup' | 'ewb-generate';

export default function Compliance() {
  const [tab, setTab] = useState<Tab>('gstin');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!input.trim()) { setError('Please enter a value.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      let data: Record<string, unknown>;
      if (tab === 'gstin') data = await complianceApi.lookupGSTIN(input.trim());
      else if (tab === 'ewb-lookup') data = await complianceApi.lookupEWB(input.trim());
      else data = await complianceApi.generateEWB({ supplierGstin: input.trim(), invoiceValue: 100000 });
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message || 'Request failed.');
    } finally { setLoading(false); }
  }

  const TABS = [
    { id: 'gstin' as Tab, label: 'GSTIN Lookup' },
    { id: 'ewb-lookup' as Tab, label: 'E-Way Bill Lookup' },
    { id: 'ewb-generate' as Tab, label: 'Generate E-Way Bill' },
  ];

  const HINTS: Record<Tab, string> = {
    'gstin': '27AABCU9603R1ZX · 29AAJCS5738K1Z5 · 24AAACR5055K1ZD',
    'ewb-lookup': 'EWB-4121009876 · EWB-3987654321',
    'ewb-generate': 'Enter Supplier GSTIN e.g. 27AABCU9603R1ZX',
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>Compliance Suite</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>GST verification and E-Way Bill management.</p>

      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setInput(''); setError(''); }}
            style={{ padding: '10px 16px', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: tab === t.id ? '#0A2342' : '#94A3B8', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.id ? '#F59E0B' : 'transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>Try: {HINTS[tab]}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={HINTS[tab]}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 8, background: loading ? '#94A3B8' : '#0A2342', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '…' : tab === 'ewb-generate' ? 'Generate' : 'Look Up'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {result && (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginTop: 16 }}>
          {!!result._mock && <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>⚡ Mock data</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {Object.entries(result).filter(([k]) => k !== '_mock').map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
