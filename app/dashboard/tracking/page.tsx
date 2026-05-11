'use client';

import { useState } from 'react';
import {
  Plane,
  Ship,
  Train,
  Truck,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle,
  MapPin,
  Package,
  CalendarClock,
} from 'lucide-react';

type Mode = 'air' | 'sea' | 'rail' | 'road';

interface TimelineStop {
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  note?: string;
}

interface ShipmentResult {
  trackingId: string;
  mode: Mode;
  consignor: string;
  consignee: string;
  weight: string;
  units: string;
  declaredValue: string;
  origin: string;
  destination: string;
  eta: string;
  currentLocation: string;
  timeline: TimelineStop[];
}

function ApiErrorBanner({ message, envHint }: { message: string; envHint?: string }) {
  return (
    <div className="api-error-banner mt-4">
      <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
      <div>
        <p className="font-semibold">API Error</p>
        <p className="mt-0.5">{message}</p>
        {envHint && (
          <p className="mt-1 font-mono text-xs" style={{ color: '#92400E' }}>
            Required env vars: {envHint}
          </p>
        )}
      </div>
    </div>
  );
}

const MODE_CONFIG: Record<
  Mode,
  {
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    apiEnv: string;
    color: string;
  }
> = {
  air: {
    label: 'Air',
    icon: <Plane size={20} />,
    placeholder: 'Enter AWB Number (e.g. 176-12345678)',
    apiEnv: 'DGCA_API_KEY, DGCA_API_URL',
    color: '#0EA5E9',
  },
  sea: {
    label: 'Sea',
    icon: <Ship size={20} />,
    placeholder: 'Enter Bill of Lading / Container Number (ICEGATE)',
    apiEnv: 'ICEGATE_API_KEY, ICEGATE_API_URL',
    color: '#2563EB',
  },
  rail: {
    label: 'Rail',
    icon: <Train size={20} />,
    placeholder: 'Enter RR Number (FOIS)',
    apiEnv: 'FOIS_API_KEY, FOIS_API_URL',
    color: '#7C3AED',
  },
  road: {
    label: 'Road',
    icon: <Truck size={20} />,
    placeholder: 'Enter Vehicle Number / Trip ID',
    apiEnv: 'VAHAN_API_KEY, VAHAN_API_URL',
    color: '#0A2342',
  },
};

function TimelineView({ stops }: { stops: TimelineStop[] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-[19px] top-5 bottom-5"
        style={{ width: '2px', backgroundColor: '#E2E8F0' }}
      />
      <div className="space-y-0">
        {stops.map((stop, i) => (
          <div key={i} className="flex gap-4 relative">
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full z-10 mt-1"
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor:
                    stop.status === 'completed'
                      ? '#D1FAE5'
                      : stop.status === 'current'
                      ? '#DBEAFE'
                      : '#F1F5F9',
                  border: '2px solid',
                  borderColor:
                    stop.status === 'completed'
                      ? '#10B981'
                      : stop.status === 'current'
                      ? '#2563EB'
                      : '#CBD5E1',
                  flexShrink: 0,
                }}
              >
                {stop.status === 'completed' ? (
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                ) : stop.status === 'current' ? (
                  <MapPin size={16} style={{ color: '#2563EB' }} />
                ) : (
                  <Circle size={16} style={{ color: '#CBD5E1' }} />
                )}
              </div>
              {i < stops.length - 1 && <div style={{ flex: 1, minHeight: '24px' }} />}
            </div>
            <div className="pb-6 pt-1 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:
                        stop.status === 'pending' ? '#94A3B8' : '#0A2342',
                    }}
                  >
                    {stop.location}
                  </p>
                  {stop.note && (
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                      {stop.note}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {stop.status === 'pending' ? (
                    <span className="badge-info text-xs">
                      <Clock size={10} /> Pending
                    </span>
                  ) : (
                    <p className="text-xs font-mono" style={{ color: '#64748B' }}>
                      {stop.timestamp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: ShipmentResult }) {
  const cfg = MODE_CONFIG[result.mode];

  return (
    <div className="mt-6 animate-fade-in space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1B3052 100%)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tracking ID
            </p>
            <p className="text-xl font-bold text-white mt-0.5 tracking-wider">
              {result.trackingId}
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${cfg.color}25`, color: cfg.color === '#0A2342' ? '#60A5FA' : cfg.color }}
          >
            {cfg.icon}
            {cfg.label}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={14} style={{ color: '#F59E0B' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Currently at: {result.currentLocation}
          </p>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div className="ulip-card">
          <h4 className="font-semibold text-sm mb-4" style={{ color: '#0A2342' }}>
            Journey Timeline
          </h4>
          <TimelineView stops={result.timeline} />
        </div>

        <div className="space-y-4">
          <div className="ulip-card">
            <div className="flex items-center gap-2 mb-3">
              <Package size={15} style={{ color: '#F59E0B' }} />
              <h4 className="font-semibold text-sm" style={{ color: '#0A2342' }}>
                Shipment Details
              </h4>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Consignor', value: result.consignor },
                { label: 'Consignee', value: result.consignee },
                { label: 'Weight', value: result.weight },
                { label: 'Units', value: result.units },
                { label: 'Declared Value', value: result.declaredValue },
                { label: 'Origin', value: result.origin },
                { label: 'Destination', value: result.destination },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: '#94A3B8' }}>{label}</span>
                  <span className="font-medium text-navy text-right max-w-[55%] truncate" title={value}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock size={15} style={{ color: '#059669' }} />
              <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                Estimated Arrival
              </p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#0A2342' }}>
              {result.eta}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              Based on current movement data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [mode, setMode] = useState<Mode>('road');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipmentResult | null>(null);

  const cfg = MODE_CONFIG[mode];

  function handleModeChange(m: Mode) {
    setMode(m);
    setQuery('');
    setError(null);
    setResult(null);
  }

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/tracking/${mode}?id=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="ulip-card p-0 overflow-hidden">
        <div className="module-header">
          <h2 className="text-xl font-bold text-white">Multi-Modal Shipment Tracking</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Unified visibility across Air, Sea, Rail & Road
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(
              ([key, c]) => (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all font-medium text-sm"
                  style={{
                    backgroundColor: mode === key ? '#0A2342' : '#F8FAFC',
                    color: mode === key ? 'white' : '#64748B',
                    border: `2px solid ${mode === key ? '#0A2342' : '#E2E8F0'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      color: mode === key ? (c.color === '#0A2342' ? '#F59E0B' : c.color) : c.color,
                    }}
                  >
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              )
            )}
          </div>

          <div className="flex gap-3">
            <input
              className="ulip-input flex-1"
              placeholder={cfg.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="ulip-btn-primary"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </div>

          {error && (
            <ApiErrorBanner
              message={error}
              envHint={cfg.apiEnv}
            />
          )}

          {result && <ResultPanel result={result} />}
        </div>
      </div>
    </div>
  );
}
