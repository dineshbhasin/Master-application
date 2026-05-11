'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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
  if (tagId.length <= 6) return tagId;
  return tagId.slice(0, 4) + '****' + tagId.slice(-4);
}

const MOCK_TRANSACTIONS: TransactionRow[] = [
  { id: 'T001', dateTime: '2026-05-10 14:32', tollPlaza: 'Khalapur Toll', location: 'Mumbai-Pune Expressway', amount: 115, balanceAfter: 1785, status: 'SUCCESS' },
  { id: 'T002', dateTime: '2026-05-09 09:18', tollPlaza: 'Sinhagad Road Toll', location: 'Pune, Maharashtra', amount: 75, balanceAfter: 1900, status: 'SUCCESS' },
  { id: 'T003', dateTime: '2026-05-08 18:45', tollPlaza: 'Vadape Toll', location: 'Mumbai-Nashik Highway', amount: 90, balanceAfter: 1975, status: 'SUCCESS' },
  { id: 'T004', dateTime: '2026-05-07 11:22', tollPlaza: 'Talegaon Toll', location: 'Old Mumbai-Pune Highway', amount: 55, balanceAfter: 2065, status: 'FAILED' },
  { id: 'T005', dateTime: '2026-05-06 07:55', tollPlaza: 'Khed Shivapur Toll', location: 'NH 48, Pune', amount: 80, balanceAfter: 2120, status: 'SUCCESS' },
  { id: 'T006', dateTime: '2026-05-05 20:10', tollPlaza: 'Charoti Toll', location: 'NH 48, Maharashtra-Gujarat Border', amount: 135, balanceAfter: 2200, status: 'SUCCESS' },
  { id: 'T007', dateTime: '2026-05-04 13:40', tollPlaza: 'Palaspe Toll', location: 'Mumbai-Goa Highway', amount: 70, balanceAfter: 2335, status: 'SUCCESS' },
];

type Section = 'balance' | 'history';

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
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
      </div>

      {error && (
        <ApiErrorBanner message={error} envHint="NETC_API_KEY, NETC_API_URL" />
      )}

      {result && (
        <div className="mt-5 animate-fade-in space-y-4">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1B3052 100%)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  FASTag Wallet Balance
                </p>
                <p className="text-4xl font-bold text-white mt-1" style={{ color: '#10B981' }}>
                  <span style={{ fontSize: '1.5rem', verticalAlign: 'super', color: '#10B981' }}>₹</span>
                  <span style={{ color: '#10B981' }}>
                    {result.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
              <TagStatusBadge status={result.tagStatus} />
            </div>

            {result.balance < 200 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <AlertCircle size={14} style={{ color: '#EF4444' }} />
                <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                  Low balance warning — recharge recommended
                </p>
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
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TransactionRow[] | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setRows(null);
    setIsMock(false);
    setPage(1);

    try {
      const params = new URLSearchParams({ vehicleNumber: trimmed });
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/fastag/transactions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 501 || data.notConfigured) {
          setRows(MOCK_TRANSACTIONS);
          setIsMock(true);
          return;
        }
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      setRows(data.transactions ?? data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = rows ? Math.ceil(rows.length / pageSize) : 0;
  const paginatedRows = rows ? rows.slice((page - 1) * pageSize, page * pageSize) : [];

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="ulip-label">Vehicle Number</label>
          <input
            className="ulip-input"
            placeholder="e.g. MH12AB1234"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div>
          <label className="ulip-label">From Date</label>
          <input
            type="date"
            className="ulip-input"
            style={{ width: '160px' }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="ulip-label">To Date</label>
          <input
            type="date"
            className="ulip-input"
            style={{ width: '160px' }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          className="ulip-btn-primary"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Fetching...' : 'Fetch History'}
        </button>
      </div>

      {error && <ApiErrorBanner message={error} envHint="NETC_API_KEY, NETC_API_URL" />}

      {isMock && (
        <div
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}
        >
          <AlertTriangle size={14} />
          Sample Data — API not configured. Set NETC_API_KEY to see live data.
        </div>
      )}

      {rows && (
        <div className="mt-4 animate-fade-in">
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E2E8F0' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  {['Date / Time', 'Toll Plaza', 'Location', 'Amount', 'Balance After', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: '#64748B', borderBottom: '1px solid #E2E8F0' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#64748B' }}>
                      {row.dateTime}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#0A2342' }}>
                      {row.tollPlaza}
                    </td>
                    <td className="px-4 py-3 text-xs flex items-center gap-1" style={{ color: '#64748B' }}>
                      <MapPin size={11} /> {row.location}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#EF4444' }}>
                      ₹{row.amount}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#10B981' }}>
                      ₹{row.balanceAfter.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <TxStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Page {page} of {totalPages} &middot; {rows.length} records
              </p>
              <div className="flex gap-2">
                <button
                  className="ulip-btn-primary"
                  style={{ padding: '6px 12px' }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  className="ulip-btn-primary"
                  style={{ padding: '6px 12px' }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Tab = 'balance' | 'history';

export default function FASTagPage() {
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'balance', label: 'Balance Check', icon: <CreditCard size={16} /> },
    { id: 'history', label: 'Transaction History', icon: <Search size={16} /> },
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab.id ? '#0A2342' : '#94A3B8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  paddingBottom: '10px',
                  paddingTop: '8px',
                  borderBottom: '2px solid',
                  borderBottomColor: activeTab === tab.id ? '#F59E0B' : 'transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'balance' ? <BalanceSection /> : <HistorySection />}
        </div>
      </div>

      <div className="ulip-card">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
          >
            <Map size={20} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#0A2342' }}>
              Route Movement
            </h3>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              Geographic visualization of toll transactions
            </p>
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-xl gap-3"
          style={{
            height: '180px',
            backgroundColor: '#F8FAFC',
            border: '2px dashed #E2E8F0',
          }}
        >
          <Map size={36} style={{ color: '#CBD5E1' }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: '#64748B' }}>
              Route Movement — Geographic visualization
            </p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
              Requires map API integration (Google Maps / MapMyIndia)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
