'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
} from 'lucide-react';

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

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface GSTINResult {
  gstin: string;
  businessName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'SUSPENDED';
  businessType: string;
  registrationDate: string;
  state: string;
  address: string;
  returns: { period: string; gstr1: 'Filed' | 'Pending' | 'NA'; gstr3b: 'Filed' | 'Pending' | 'NA' }[];
}

function GSTINStatusBadge({ status }: { status: GSTINResult['status'] }) {
  if (status === 'ACTIVE') return <span className="badge-success"><CheckCircle2 size={11} /> Active</span>;
  if (status === 'INACTIVE') return <span className="badge-warning"><AlertCircle size={11} /> Inactive</span>;
  if (status === 'CANCELLED') return <span className="badge-error"><XCircle size={11} /> Cancelled</span>;
  return <span className="badge-error"><AlertTriangle size={11} /> Suspended</span>;
}

function ReturnBadge({ val }: { val: 'Filed' | 'Pending' | 'NA' }) {
  if (val === 'Filed') return <span className="badge-success">Filed</span>;
  if (val === 'Pending') return <span className="badge-warning">Pending</span>;
  return <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>N/A</span>;
}

function GSTINTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GSTINResult | null>(null);

  const isValidFormat = GSTIN_REGEX.test(query.trim().toUpperCase());
  const len = query.trim().length;

  async function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed || !isValidFormat) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/compliance/gstin?gstin=${encodeURIComponent(trimmed)}`);
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
      <div>
        <label className="ulip-label">GSTIN (15 characters)</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              className="ulip-input pr-24"
              placeholder="e.g. 27AABCU9603R1ZX"
              value={query}
              maxLength={15}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                borderColor:
                  len === 0
                    ? '#CBD5E1'
                    : len === 15
                    ? isValidFormat
                      ? '#10B981'
                      : '#EF4444'
                    : '#CBD5E1',
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color:
                    len === 15
                      ? isValidFormat
                        ? '#10B981'
                        : '#EF4444'
                      : '#94A3B8',
                }}
              >
                {len}/15
              </span>
              {len === 15 && (
                isValidFormat ? (
                  <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                ) : (
                  <XCircle size={14} style={{ color: '#EF4444' }} />
                )
              )}
            </div>
          </div>
          <button
            className="ulip-btn-primary"
            onClick={handleSearch}
            disabled={loading || !isValidFormat}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {len > 0 && len < 15 && (
          <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
            {15 - len} more characters required
          </p>
        )}
        {len === 15 && !isValidFormat && (
          <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
            Invalid GSTIN format. Expected: 2-digit state code + PAN + 1 digit + Z + 1 checksum
          </p>
        )}
      </div>

      {error && <ApiErrorBanner message={error} envHint="GSTN_API_KEY, GSTN_API_URL" />}

      {result && (
        <div className="mt-5 animate-fade-in space-y-4">
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0A2342', padding: '1rem 1.5rem' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    GST Registration Details
                  </p>
                  <p className="text-xl font-bold text-white tracking-wider mt-0.5 font-mono">
                    {result.gstin}
                  </p>
                </div>
                <GSTINStatusBadge status={result.status} />
              </div>
              <p className="text-sm mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {result.businessName}
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: 'Business Type', value: result.businessType },
                  { label: 'Registration Date', value: result.registrationDate },
                  { label: 'State', value: result.state },
                  { label: 'Address', value: result.address },
                ].map(({ label, value }) => (
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

              <div className="mt-5">
                <p className="text-sm font-semibold mb-3" style={{ color: '#0A2342' }}>
                  Return Filing Status
                </p>
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E2E8F0' }}>
                  <table className="w-full text-sm">
                    <thead style={{ backgroundColor: '#F8FAFC' }}>
                      <tr>
                        {['Tax Period', 'GSTR-1', 'GSTR-3B'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
                            style={{ color: '#64748B', borderBottom: '1px solid #E2E8F0' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.returns.map((r) => (
                        <tr key={r.period} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: '#0A2342' }}>
                            {r.period}
                          </td>
                          <td className="px-4 py-3"><ReturnBadge val={r.gstr1} /></td>
                          <td className="px-4 py-3"><ReturnBadge val={r.gstr3b} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EWBDetails {
  ewbNumber: string;
  status: 'VALID' | 'EXPIRED' | 'CANCELLED';
  generatedDate: string;
  validUpto: string;
  supplierGSTIN: string;
  recipientGSTIN: string;
  invoiceNumber: string;
  taxableValue: number;
  transportMode: string;
  vehicleNumber: string;
  distance: string;
  itemDescription: string;
  hsnCode: string;
}

function EWayBillTab() {
  const [subTab, setSubTab] = useState<'verify' | 'generate'>('verify');

  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<EWBDetails | null>(null);

  const [genForm, setGenForm] = useState({
    supplierGSTIN: '',
    recipientGSTIN: '',
    invoiceNumber: '',
    invoiceDate: '',
    value: '',
    hsnCode: '',
    transportMode: 'Road',
    vehicleNumber: '',
  });
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  async function handleVerify() {
    const trimmed = verifyQuery.trim();
    if (!trimmed) return;
    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/compliance/ewaybill?ewbNumber=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      setVerifyResult(data);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleGenerate() {
    setGenLoading(true);
    setGenError(null);
    setGenSuccess(null);

    try {
      const res = await fetch('/api/compliance/ewaybill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      setGenSuccess(data.ewbNumber ?? 'E-Way Bill generated successfully.');
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setGenLoading(false);
    }
  }

  function EWBStatusBadge({ status }: { status: EWBDetails['status'] }) {
    if (status === 'VALID') return <span className="badge-success"><CheckCircle2 size={11} /> Valid</span>;
    if (status === 'EXPIRED') return <span className="badge-warning"><Clock size={11} /> Expired</span>;
    return <span className="badge-error"><XCircle size={11} /> Cancelled</span>;
  }

  return (
    <div>
      <div className="flex gap-1 mb-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
        {(['verify', 'generate'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSubTab(s)}
            className="flex items-center gap-2 px-4 text-sm font-medium"
            style={{
              color: subTab === s ? '#0A2342' : '#94A3B8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              paddingBottom: '10px',
              paddingTop: '8px',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: subTab === s ? '#F59E0B' : 'transparent',
              marginBottom: '-1px',
            }}
          >
            {s === 'verify' ? <Search size={14} /> : <Plus size={14} />}
            {s === 'verify' ? 'Verify E-Way Bill' : 'Generate E-Way Bill'}
          </button>
        ))}
      </div>

      {subTab === 'verify' && (
        <div>
          <div className="flex gap-3">
            <input
              className="ulip-input flex-1"
              placeholder="Enter E-Way Bill Number (e.g. 4121009876)"
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              className="ulip-btn-primary"
              onClick={handleVerify}
              disabled={verifyLoading || !verifyQuery.trim()}
            >
              {verifyLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {verifyLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {verifyError && <ApiErrorBanner message={verifyError} envHint="NIC_EWB_API_KEY, NIC_EWB_API_URL" />}

          {verifyResult && (
            <div className="mt-5 animate-fade-in" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#0A2342', padding: '1rem 1.5rem' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>E-Way Bill</p>
                    <p className="text-xl font-bold text-white font-mono mt-0.5">{verifyResult.ewbNumber}</p>
                  </div>
                  <EWBStatusBadge status={verifyResult.status} />
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: 'Generated Date', value: verifyResult.generatedDate },
                    { label: 'Valid Upto', value: verifyResult.validUpto },
                    { label: 'Supplier GSTIN', value: verifyResult.supplierGSTIN },
                    { label: 'Recipient GSTIN', value: verifyResult.recipientGSTIN },
                    { label: 'Invoice Number', value: verifyResult.invoiceNumber },
                    { label: 'Taxable Value', value: `₹${verifyResult.taxableValue.toLocaleString('en-IN')}` },
                    { label: 'Transport Mode', value: verifyResult.transportMode },
                    { label: 'Vehicle Number', value: verifyResult.vehicleNumber },
                    { label: 'Distance', value: verifyResult.distance },
                    { label: 'HSN Code', value: verifyResult.hsnCode },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#94A3B8' }}>{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: '#0A2342' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'generate' && (
        <div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'supplierGSTIN', label: 'Supplier GSTIN', placeholder: '27AABCU9603R1ZX' },
              { key: 'recipientGSTIN', label: 'Recipient GSTIN', placeholder: '29AAGCM2168L1ZD' },
              { key: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-2026-001' },
              { key: 'invoiceDate', label: 'Invoice Date', placeholder: '', type: 'date' },
              { key: 'value', label: 'Invoice Value (₹)', placeholder: '50000' },
              { key: 'hsnCode', label: 'HSN Code', placeholder: '8471' },
              { key: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'MH12AB1234' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="ulip-label">{label}</label>
                <input
                  type={type ?? 'text'}
                  className="ulip-input"
                  placeholder={placeholder}
                  value={(genForm as Record<string, string>)[key]}
                  onChange={(e) => setGenForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="ulip-label">Transport Mode</label>
              <select
                className="ulip-input"
                value={genForm.transportMode}
                onChange={(e) => setGenForm((f) => ({ ...f, transportMode: e.target.value }))}
              >
                {['Road', 'Rail', 'Air', 'Ship'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {genError && <ApiErrorBanner message={genError} envHint="NIC_EWB_API_KEY, NIC_EWB_API_URL" />}

          {genSuccess && (
            <div
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0' }}
            >
              <CheckCircle2 size={18} style={{ color: '#059669' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                  E-Way Bill Generated Successfully
                </p>
                <p className="text-sm font-mono font-bold mt-0.5" style={{ color: '#065F46' }}>
                  EWB No: {genSuccess}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5">
            <button
              className="ulip-btn-primary"
              onClick={handleGenerate}
              disabled={genLoading}
            >
              {genLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {genLoading ? 'Generating...' : 'Generate E-Way Bill'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IRNTab() {
  return (
    <div className="animate-fade-in">
      <div
        className="rounded-2xl p-8 flex flex-col items-center text-center"
        style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', border: '1px solid #BAE6FD' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl mb-4"
          style={{ width: '64px', height: '64px', backgroundColor: '#DBEAFE', color: '#2563EB' }}
        >
          <Sparkles size={28} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#0A2342' }}>
          IRN / E-Invoice — Coming Soon
        </h3>
        <p className="text-sm max-w-lg" style={{ color: '#64748B', lineHeight: 1.7 }}>
          The Invoice Reference Number (IRN) module will enable real-time e-invoice generation and
          verification via the NIC IRP (Invoice Registration Portal). Businesses with annual
          turnover above ₹5 crore are mandated to generate IRNs for B2B transactions.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-lg">
          {[
            { icon: '🔢', title: 'IRN Generation', desc: 'Generate unique 64-char hash via IRP' },
            { icon: '✅', title: 'QR Verification', desc: 'Verify signed e-invoices by QR code' },
            { icon: '📊', title: 'Bulk Upload', desc: 'Upload JSON for bulk IRN generation' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-3 rounded-xl text-left"
              style={{ backgroundColor: 'white', border: '1px solid #E0F2FE' }}
            >
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs font-semibold" style={{ color: '#0A2342' }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{desc}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'white', border: '1px solid #BFDBFE', color: '#2563EB' }}
        >
          <Clock size={14} />
          Estimated availability: Q3 2026
        </div>
      </div>
    </div>
  );
}

type Tab = 'gstin' | 'ewaybill' | 'irn';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('gstin');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'gstin', label: 'GSTIN Lookup', icon: <Search size={15} /> },
    { id: 'ewaybill', label: 'E-Way Bill', icon: <FileText size={15} /> },
    { id: 'irn', label: 'IRN / E-Invoice', icon: <Sparkles size={15} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="ulip-card p-0 overflow-hidden">
        <div className="module-header">
          <h2 className="text-xl font-bold text-white">Compliance Suite</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            GSTIN verification, E-Way Bill generation & IRN tools
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
                {tab.id === 'irn' && (
                  <span
                    style={{
                      backgroundColor: 'rgba(37,99,235,0.12)',
                      color: '#2563EB',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'gstin' && <GSTINTab />}
          {activeTab === 'ewaybill' && <EWayBillTab />}
          {activeTab === 'irn' && <IRNTab />}
        </div>
      </div>
    </div>
  );
}
