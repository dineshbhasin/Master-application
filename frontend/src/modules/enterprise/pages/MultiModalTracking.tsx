import React, { useState } from 'react';
import { trackingApi, TrackingMode } from '../../../api/tracking';

const MODES: { id: TrackingMode; label: string; icon: string }[] = [
  { id: 'air',  label: 'Air Cargo',   icon: '✈️' },
  { id: 'sea',  label: 'Sea Freight', icon: '🚢' },
  { id: 'rail', label: 'Rail Cargo',  icon: '🚂' },
  { id: 'road', label: 'Road',        icon: '🚛' },
];

const PRESETS: Record<TrackingMode, string> = {
  air: 'AIR-001', sea: 'SEA-002', rail: 'RAIL-003', road: 'ROAD-004',
};

export default function MultiModalTracking() {
  const [mode, setMode] = useState<TrackingMode>('air');
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleTrack() {
    if (!trackingId.trim()) { setError('Enter a tracking ID.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await trackingApi.track(trackingId.trim(), mode);
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  const timeline = Array.isArray(result?.timeline) ? result!.timeline as Record<string, string>[] : [];
  const statusColors: Record<string, string> = { done: '#059669', active: '#F59E0B', pending: '#94A3B8' };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>Multi-Modal Tracking</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Track shipments across Air, Sea, Rail and Road in real time.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {MODES.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setTrackingId(PRESETS[m.id]); setResult(null); }}
            style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: '1.5px solid', borderColor: mode === m.id ? '#0A2342' : '#E2E8F0', background: mode === m.id ? '#0A2342' : 'white', color: mode === m.id ? 'white' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <span style={{ display: 'block', fontSize: 20 }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={trackingId} onChange={(e) => setTrackingId(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          placeholder={`e.g. ${PRESETS[mode]}`}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
        <button onClick={handleTrack} disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 8, background: loading ? '#94A3B8' : '#0A2342', color: 'white', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Tracking…' : 'Track'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {result && (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginTop: 16 }}>
          {!!result._mock && <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>⚡ Mock data</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>TRACKING ID</p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#0A2342' }}>{String(result.trackingId)}</p>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: 9999, background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700, alignSelf: 'flex-start' }}>
              {String(result.status)}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20 }}>
            {[['Carrier', result.carrier], ['ETA', result.estimatedArrival], ['Commodity', result.commodity]].filter(([, v]) => v).map(([k, v]) => (
              <div key={String(k)}>
                <p style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>{String(k)}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{String(v)}</p>
              </div>
            ))}
          </div>
          {timeline.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0A2342', marginBottom: 12 }}>Shipment Timeline</p>
              {timeline.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColors[step.status] || '#94A3B8', flexShrink: 0, marginTop: 2 }} />
                    {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: '#F1F5F9', minHeight: 20 }} />}
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{step.event}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8' }}>{step.time} — {step.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
