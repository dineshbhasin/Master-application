'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  AlertTriangle,
  Loader2,
  CreditCard,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Map,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

const RouteMap = dynamic(() => import('@/components/map/RouteMap'), { ssr: false, loading: () => (
  <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
    <div className="flex flex-col items-center gap-2">
      <Loader2 size={24} className="animate-spin" style={{ color: '#94A3B8' }} />
      <p className="text-sm" style={{ color: '#94A3B8' }}>Loading map...</p>
    </div>
  </div>
)});

interface FASTagBalance {
  vehicleNumber: string;
  tagId: string;
  balance: number;
  tagStatus: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'LOW_BALANCE';
  bankName: string;
  lastRechargeDate: string;
  lastRechargeAmount: number;
  vehicleClass: string;
  issuedDate: string;
  _mock?: boolean;
}

interface TransactionRow {
  id: string;
  dateTime: string;
  tollPlaza: string;
  location: string;
  amount: number;
  balanceAfter: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

function MockBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm mt-4"
      style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
      <AlertCircle size={14} />
      Sample data — configure FASTAG_API_KEY in .env.local for live data
    </div>
  );
}

function TagStatusBadge({ status }: { status: FASTagBalance['tagStatus'] }) {
  if (status === 'ACTIVE') return <span className="badge-success"><CheckCircle2 size={11} /> Active</span>;
  if (status === 'LOW_BALANCE') return <span className="badge-warning"><AlertCircle size={11} /> Low Balance</span>;
  if (status === 'BLACKLISTED') return <span className="badge-error"><AlertTriangle size={11} /> Blacklisted</span>;
  return <span className="badge-error">Inactive</span>;
}

function TxStatusBadge({ status }: { status: TransactionRow['status'] }) {
  if (status === 'SUCCESS') return <span className="badge-success">Success</span>;
  if (status === 'FAILED') return <span className="badge-error">Failed</span>;
  return <span className="badge-warning">Pending</span>;
}

function maskTagId(tagId: string): string {
  if (tagId.length <= 8) return tagId;
  return tagId.slice(0, 4) + '****' + tagId.slice(-4);
}

function BalanceSection() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FASTagBalance | null>(null);

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/fastag/balance?vehicleNumber=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
        Try: <button className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2342', padding: 0 }} onClick={() => setQuery('MH12AB1234')}>MH12AB1234</button> · <button className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2342', padding: 0 }} onClick={() => setQuery('DL8CAB5678')}>DL8CAB5678 (Low balance)</button> · <button className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2342', padding: 0 }} onClick={() => setQuery('GJ01XX7890')}>GJ01XX7890 (Truck)</button>
      </p>
      <div className="flex gap-3">
        <input className="ulip-input flex-1" placeholder="Vehicle Registration Number (e.g. MH12AB1234)"
          value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="ulip-btn-primary" onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
      </div>
      {error && <div className="api-error-banner mt-4"><AlertTriangle size={18} style={{ color: '#D97706' }} /><p>{error}</p></div>}
      {result && (
        <div className="mt-5 animate-fade-in space-y-4">
          {result._mock && <MockBanner />}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1B3052 100%)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>FASTag Wallet Balance</p>
                <p className="text-4xl font-bold mt-1">
                  <span style={{ fontSize: '1.5rem', verticalAlign: 'super', color: '#10B981' }}>₹</span>
                  <span style={{ color: '#10B981' }}>{result.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
              <TagStatusBadge status={result.tagStatus} />
            </div>
            {result.balance < 200 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle size={14} style={{ color: '#EF4444' }} />
                <p className="text-xs font-medium" style={{ color: '#EF4444' }}>Low balance — recharge recommended</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                { label: 'Tag ID', value: maskTagId(result.tagId) },
                { label: 'Bank', value: result.bankName },
                { label: 'Last Recharge', value: result.lastRechargeDate },
                { label: 'Last Recharge Amt', value: `₹${result.lastRechargeAmount.toLocaleString('en-IN')}` },
                { label: 'Vehicle Class', value: result.vehicleClass },
                { label: 'Issued On', value: result.issuedDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistorySection() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TransactionRow[] | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true); setError(null); setRows(null); setIsMock(false); setPage(1);
    try {
      const res = await fetch(`/api/fastag/transactions?vehicleNumber=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setRows(data.transactions ?? data);
      setIsMock(!!(data._mock));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = rows ? Math.ceil(rows.length / pageSize) : 0;
  const paginatedRows = rows ? rows.slice((page - 1) * pageSize, page * pageSize) : [];

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Try: <button className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2342', padding: 0 }} onClick={() => setQuery('MH12AB1234')}>MH12AB1234</button></p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="ulip-label">Vehicle Number</label>
          <input className="ulip-input" placeholder="e.g. MH12AB1234" value={query}
            onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <button className="ulip-btn-primary" onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Fetching...' : 'Fetch History'}
        </button>
      </div>
      {error && <div className="api-error-banner mt-4"><AlertTriangle size={18} style={{ color: '#D97706' }} /><p>{error}</p></div>}
      {isMock && <MockBanner />}
      {rows && (
        <div className="mt-4 animate-fade-in">
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E2E8F0' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  {['Date / Time', 'Toll Plaza', 'Location', 'Amount', 'Balance After', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#64748B' }}>{row.dateTime}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#0A2342' }}>{row.tollPlaza}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748B' }}><MapPin size={11} className="inline mr-1" />{row.location}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#EF4444' }}>₹{row.amount}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#10B981' }}>₹{row.balanceAfter.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><TxStatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs" style={{ color: '#94A3B8' }}>Page {page} of {totalPages} · {rows.length} records</p>
              <div className="flex gap-2">
                <button className="ulip-btn-primary" style={{ padding: '6px 12px' }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={15} /></button>
                <button className="ulip-btn-primary" style={{ padding: '6px 12px' }} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const INDIAN_CITIES = ['Delhi', 'Mumbai', 'Agra', 'Pune', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Jaipur', 'Ahmedabad', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Patna', 'Indore', 'Bhopal', 'Chandigarh', 'Kochi', 'Nashik'];

function RoutePlannerSection() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  function filterCities(input: string) {
    if (!input) return [];
    return INDIAN_CITIES.filter((c) => c.toLowerCase().startsWith(input.toLowerCase())).slice(0, 5);
  }

  function handleSearch() {
    if (!from.trim() || !to.trim()) return;
    setShowMap(true);
  }

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: '#64748B' }}>
        Enter origin and destination to see toll plazas, black spots, fuel stations, and route options on the map.
      </p>
      <div className="flex flex-wrap gap-3 items-end mb-5">
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <label className="ulip-label">Origin City</label>
          <input className="ulip-input" placeholder="e.g. Delhi" value={from}
            onChange={(e) => { setFrom(e.target.value); setFromSuggestions(filterCities(e.target.value)); setShowMap(false); }}
            onBlur={() => setTimeout(() => setFromSuggestions([]), 150)}
          />
          {fromSuggestions.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              {fromSuggestions.map((c) => (
                <button key={c} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer' }}
                  onMouseDown={() => { setFrom(c); setFromSuggestions([]); }}>{c}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <label className="ulip-label">Destination City</label>
          <input className="ulip-input" placeholder="e.g. Agra" value={to}
            onChange={(e) => { setTo(e.target.value); setToSuggestions(filterCities(e.target.value)); setShowMap(false); }}
            onBlur={() => setTimeout(() => setToSuggestions([]), 150)}
          />
          {toSuggestions.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              {toSuggestions.map((c) => (
                <button key={c} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer' }}
                  onMouseDown={() => { setTo(c); setToSuggestions([]); }}>{c}</button>
              ))}
            </div>
          )}
        </div>
        <button className="ulip-btn-primary" onClick={handleSearch} disabled={!from.trim() || !to.trim()}>
          <Navigation size={16} /> Plan Route
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-xs" style={{ color: '#94A3B8' }}>Quick routes:</span>
        {[['Delhi', 'Agra'], ['Mumbai', 'Pune'], ['Delhi', 'Jaipur'], ['Bangalore', 'Chennai']].map(([f, t]) => (
          <button key={f+t} className="text-xs px-3 py-1 rounded-full" style={{ background: '#F1F5F9', color: '#0A2342', border: 'none', cursor: 'pointer' }}
            onClick={() => { setFrom(f); setTo(t); setShowMap(false); }}>
            {f} → {t}
          </button>
        ))}
      </div>

      {showMap && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold" style={{ color: '#0A2342' }}>{from} → {to}</h4>
            <div className="flex gap-3 text-xs" style={{ color: '#64748B' }}>
              <span>🟢 Route 1 (Expressway)</span>
              <span>⚫ Route 2 (Highway)</span>
              <span className="font-medium" style={{ color: '#7C3AED' }}>₹ Toll</span>
              <span style={{ color: '#DC2626' }}>! Black Spot</span>
              <span>⛽ Fuel</span>
            </div>
          </div>
          <RouteMap from={from} to={to} />
        </div>
      )}

      {!showMap && (
        <div className="flex flex-col items-center justify-center rounded-xl gap-3"
          style={{ height: 200, background: '#F8FAFC', border: '2px dashed #E2E8F0' }}>
          <Map size={36} style={{ color: '#CBD5E1' }} />
          <p className="text-sm font-medium" style={{ color: '#64748B' }}>Enter origin & destination above to load the route map</p>
        </div>
      )}
    </div>
  );
}

type Tab = 'balance' | 'history' | 'route';

export default function FASTagPage() {
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'balance', label: 'Balance Check', icon: <CreditCard size={16} /> },
    { id: 'history', label: 'Transaction History', icon: <Search size={16} /> },
    { id: 'route', label: 'Route Planner', icon: <Map size={16} /> },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="ulip-card p-0 overflow-hidden">
        <div className="module-header">
          <h2 className="text-xl font-bold text-white">FASTag & Toll Management</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Live balance, transaction history & route movement
          </p>
        </div>
        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b" style={{ borderColor: '#F1F5F9' }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab.id ? '#0A2342' : '#94A3B8',
                  background: 'none', border: 'none', cursor: 'pointer',
                  paddingBottom: '10px', paddingTop: '8px',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#F59E0B' : 'transparent'}`,
                  marginBottom: '-1px',
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'balance' && <BalanceSection />}
          {activeTab === 'history' && <HistorySection />}
          {activeTab === 'route' && <RoutePlannerSection />}
        </div>
      </div>
    </div>
  );
}
