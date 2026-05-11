'use client';

import { useState } from 'react';
import {
  Search,
  Car,
  IdCard,
  AlertTriangle,
  Loader2,
  Download,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface RCResult {
  vehicleNumber: string;
  ownerName: string;
  rcStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  make: string;
  model: string;
  fuelType: string;
  registrationDate: string;
  validUpto: string;
  insuranceValidUntil: string;
  fitnessValidUntil: string;
  emissionNorm: string;
  stateRTO: string;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  vehicleClass: string;
}

interface DLResult {
  licenseNumber: string;
  name: string;
  dob: string;
  dlStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  validUntil: string;
  licenseClasses: string[];
  issuingRTO: string;
  hazardousGoods: boolean;
  hillDriving: boolean;
  issuedDate: string;
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
            Required: {envHint}
          </p>
        )}
      </div>
    </div>
  );
}

function RCStatusBadge({ status }: { status: RCResult['rcStatus'] }) {
  if (status === 'ACTIVE') return <span className="badge-success"><CheckCircle2 size={11} /> Active</span>;
  if (status === 'EXPIRED') return <span className="badge-error"><XCircle size={11} /> Expired</span>;
  return <span className="badge-warning"><AlertTriangle size={11} /> Suspended</span>;
}

function DLStatusBadge({ status }: { status: DLResult['dlStatus'] }) {
  if (status === 'ACTIVE') return <span className="badge-success"><CheckCircle2 size={11} /> Active</span>;
  if (status === 'EXPIRED') return <span className="badge-error"><XCircle size={11} /> Expired</span>;
  return <span className="badge-warning"><AlertTriangle size={11} /> Suspended</span>;
}

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#94A3B8' }}>
            {label}
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#0A2342' }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function RCTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RCResult | null>(null);

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/vehicle/rc?vehicleNumber=${encodeURIComponent(trimmed)}`);
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
    <div>
      <div className="flex gap-3">
        <input
          className="ulip-input flex-1"
          placeholder="Enter Vehicle Registration Number (e.g. MH12AB1234)"
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
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <ApiErrorBanner
          message={error}
          envHint="VAHAN_API_KEY, VAHAN_API_URL"
        />
      )}

      {result && (
        <div className="mt-5 animate-fade-in" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0A2342', padding: '1rem 1.5rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Vehicle Registration Certificate
                </p>
                <p className="text-xl font-bold text-white tracking-wider mt-0.5">
                  {result.vehicleNumber}
                </p>
              </div>
              <RCStatusBadge status={result.rcStatus} />
            </div>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Owner: {result.ownerName}
            </p>
          </div>

          <div className="p-5">
            <DetailGrid
              items={[
                { label: 'Make / Model', value: `${result.make} ${result.model}` },
                { label: 'Fuel Type', value: result.fuelType },
                { label: 'Vehicle Class', value: result.vehicleClass },
                { label: 'Colour', value: result.color },
                { label: 'Registration Date', value: result.registrationDate },
                { label: 'RC Valid Upto', value: result.validUpto },
                { label: 'Insurance Valid Until', value: result.insuranceValidUntil },
                { label: 'Fitness Valid Until', value: result.fitnessValidUntil },
                { label: 'Emission Norm', value: result.emissionNorm },
                { label: 'State / RTO', value: result.stateRTO },
              ]}
            />

            <div
              className="mt-5 pt-4 flex gap-3"
              style={{ borderTop: '1px solid #F1F5F9' }}
            >
              <button className="ulip-btn-primary" disabled>
                <Download size={15} /> Download RC Details
              </button>
              <button
                className="ulip-btn-accent"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
                disabled
              >
                <History size={15} /> View Full History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DLTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DLResult | null>(null);

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/vehicle/dl?licenseNumber=${encodeURIComponent(trimmed)}`);
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
    <div>
      <div className="flex gap-3">
        <input
          className="ulip-input flex-1"
          placeholder="Enter Driving License Number (e.g. MH1220230012345)"
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
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <ApiErrorBanner
          message={error}
          envHint="SARATHI_API_KEY, SARATHI_API_URL"
        />
      )}

      {result && (
        <div className="mt-5 animate-fade-in" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0A2342', padding: '1rem 1.5rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Driving Licence — Sarathi
                </p>
                <p className="text-xl font-bold text-white tracking-wider mt-0.5">
                  {result.licenseNumber}
                </p>
              </div>
              <DLStatusBadge status={result.dlStatus} />
            </div>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {result.name} &middot; DOB: {result.dob}
            </p>
          </div>

          <div className="p-5">
            <DetailGrid
              items={[
                { label: 'Valid Until', value: result.validUntil },
                { label: 'Date of Issue', value: result.issuedDate },
                { label: 'Issuing RTO', value: result.issuingRTO },
                { label: 'Hazardous Goods', value: result.hazardousGoods ? 'Authorised' : 'Not Authorised' },
                { label: 'Hill Driving', value: result.hillDriving ? 'Authorised' : 'Not Authorised' },
              ]}
            />

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#94A3B8' }}>
                Licence Classes
              </p>
              <div className="flex flex-wrap gap-2">
                {result.licenseClasses.map((cls) => (
                  <span key={cls} className="badge-info">
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 flex gap-3" style={{ borderTop: '1px solid #F1F5F9' }}>
              <button className="ulip-btn-primary" disabled>
                <Download size={15} /> Download DL Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = 'rc' | 'dl';

export default function VehiclePage() {
  const [activeTab, setActiveTab] = useState<Tab>('rc');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'rc', label: 'RC Lookup (Vahan)', icon: <Car size={16} /> },
    { id: 'dl', label: 'DL Lookup (Sarathi)', icon: <IdCard size={16} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="ulip-card p-0 overflow-hidden">
        <div className="module-header">
          <h2 className="text-xl font-bold text-white">Vehicle & Driver Intelligence</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Real-time verification via Vahan & Sarathi APIs
          </p>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b" style={{ borderColor: '#F1F5F9' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
                style={{
                  color: activeTab === tab.id ? '#0A2342' : '#94A3B8',
                  marginBottom: '-1px',
                  background: 'none',
                  cursor: 'pointer',
                  borderWidth: 0,
                  borderBottomWidth: '2px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: activeTab === tab.id ? '#F59E0B' : 'transparent',
                  paddingBottom: '10px',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'rc' ? <RCTab /> : <DLTab />}
        </div>
      </div>
    </div>
  );
}
