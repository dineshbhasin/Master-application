'use client';

import { useState } from 'react';
import {
  User,
  Building2,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Upload,
  RefreshCw,
  Lock,
  Fingerprint,
  FileText,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = 'verified' | 'pending' | 'not_fetched' | 'expired';

interface Document {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: DocStatus;
  docNumber?: string;
  fetchedOn?: string;
  expiresOn?: string;
  issuedBy: string;
  digilockerAvailable: boolean;
}

// ─── Mock initial data ────────────────────────────────────────────────────────

const INITIAL_INDIVIDUAL_DOCS: Document[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: 'Unique identification issued by UIDAI',
    icon: <Fingerprint size={20} />,
    status: 'verified',
    docNumber: 'XXXX XXXX 7842',
    fetchedOn: '08 May 2026',
    issuedBy: 'UIDAI',
    digilockerAvailable: true,
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Permanent Account Number — Income Tax',
    icon: <FileText size={20} />,
    status: 'verified',
    docNumber: 'ABCDE1234F',
    fetchedOn: '08 May 2026',
    issuedBy: 'Income Tax Department',
    digilockerAvailable: true,
  },
  {
    id: 'dl',
    name: 'Driving Licence',
    description: 'Motor vehicle driving authorisation',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'Regional Transport Office (RTO)',
    digilockerAvailable: true,
  },
  {
    id: 'passport',
    name: 'Passport',
    description: 'International travel document',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'Ministry of External Affairs',
    digilockerAvailable: false,
  },
  {
    id: 'voter',
    name: 'Voter ID (EPIC)',
    description: 'Electoral Photo Identity Card',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'Election Commission of India',
    digilockerAvailable: true,
  },
];

const INITIAL_COMPANY_DOCS: Document[] = [
  {
    id: 'gst',
    name: 'GST Registration Certificate',
    description: 'GSTIN-linked business registration',
    icon: <FileText size={20} />,
    status: 'verified',
    docNumber: '27AABCU9603R1ZX',
    fetchedOn: '08 May 2026',
    issuedBy: 'GSTN / GST Council',
    digilockerAvailable: true,
  },
  {
    id: 'cin',
    name: 'Certificate of Incorporation',
    description: 'Company registration by MCA21',
    icon: <FileText size={20} />,
    status: 'verified',
    docNumber: 'U63000MH2018PTC300456',
    fetchedOn: '09 May 2026',
    issuedBy: 'Ministry of Corporate Affairs',
    digilockerAvailable: true,
  },
  {
    id: 'msme',
    name: 'MSME / Udyam Certificate',
    description: 'Micro, Small & Medium Enterprise registration',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'Ministry of MSME / Udyam Portal',
    digilockerAvailable: true,
  },
  {
    id: 'iec',
    name: 'IEC — Import Export Code',
    description: 'Mandatory for cross-border trade (DGFT)',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'DGFT (Directorate General of Foreign Trade)',
    digilockerAvailable: false,
  },
  {
    id: 'tan',
    name: 'TAN Certificate',
    description: 'Tax Deduction Account Number',
    icon: <FileText size={20} />,
    status: 'not_fetched',
    issuedBy: 'Income Tax Department',
    digilockerAvailable: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DocStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  verified:    { label: 'Verified', bg: '#F0FDF4', color: '#059669', icon: <CheckCircle2 size={13} /> },
  pending:     { label: 'Pending', bg: '#FFFBEB', color: '#D97706', icon: <Clock size={13} /> },
  not_fetched: { label: 'Not Fetched', bg: '#F8FAFC', color: '#94A3B8', icon: <AlertCircle size={13} /> },
  expired:     { label: 'Expired', bg: '#FEF2F2', color: '#DC2626', icon: <AlertCircle size={13} /> },
};

function DocCard({
  doc,
  onFetch,
  onUpload,
  fetching,
}: {
  doc: Document;
  onFetch: (id: string) => void;
  onUpload: (id: string) => void;
  fetching: string | null;
}) {
  const s = STATUS_CONFIG[doc.status];
  const isFetching = fetching === doc.id;

  return (
    <div
      className="rounded-xl p-4 flex gap-4 items-start"
      style={{
        background: 'white',
        border: `1px solid ${doc.status === 'verified' ? '#BBF7D0' : '#E2E8F0'}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: '44px', height: '44px',
          background: doc.status === 'verified' ? '#F0FDF4' : '#F8FAFC',
          color: doc.status === 'verified' ? '#059669' : '#94A3B8',
          border: `1px solid ${doc.status === 'verified' ? '#BBF7D0' : '#E2E8F0'}`,
        }}
      >
        {doc.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>{doc.name}</span>
          <span
            className="flex items-center gap-1"
            style={{
              background: s.bg, color: s.color,
              fontSize: '10px', fontWeight: 700,
              padding: '2px 7px', borderRadius: '9999px',
            }}
          >
            {s.icon} {s.label}
          </span>
        </div>
        <p className="text-xs mb-1" style={{ color: '#64748B' }}>{doc.description}</p>
        {doc.docNumber && (
          <p className="text-xs font-mono font-semibold" style={{ color: '#0A2342' }}>{doc.docNumber}</p>
        )}
        {doc.fetchedOn && (
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            Fetched {doc.fetchedOn} · Issued by {doc.issuedBy}
          </p>
        )}
        {doc.status === 'not_fetched' && (
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Issued by {doc.issuedBy}</p>
        )}
        {doc.expiresOn && (
          <p className="text-xs mt-0.5" style={{ color: '#DC2626' }}>Expires {doc.expiresOn}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        {doc.status === 'verified' ? (
          <button
            onClick={() => onFetch(doc.id)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        ) : (
          <>
            {doc.digilockerAvailable && (
              <button
                onClick={() => onFetch(doc.id)}
                disabled={isFetching}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: isFetching ? '#94A3B8' : '#1D4ED8',
                  color: 'white',
                  cursor: isFetching ? 'not-allowed' : 'pointer',
                  minWidth: '100px',
                  justifyContent: 'center',
                }}
              >
                {isFetching ? (
                  <RefreshCw size={11} className="animate-spin" />
                ) : (
                  <ExternalLink size={11} />
                )}
                {isFetching ? 'Fetching…' : 'DigiLocker'}
              </button>
            )}
            <button
              onClick={() => onUpload(doc.id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            >
              <Upload size={11} /> Upload
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DigiLocker mock OAuth modal ──────────────────────────────────────────────

function DigiLockerModal({ onClose, onAuthorize }: { onClose: () => void; onAuthorize: () => void }) {
  const [step, setStep] = useState<'consent' | 'otp' | 'success'>('consent');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  function handleVerify() {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit OTP sent to your Aadhaar-linked mobile.'); return; }
    setOtpError('');
    setStep('success');
    setTimeout(() => {
      onAuthorize();
      onClose();
    }, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,35,66,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#1A237E' }}>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)' }}
            >
              <Shield size={16} style={{ color: 'white' }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">DigiLocker</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Ministry of Electronics & IT</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 'consent' && (
            <div className="space-y-4">
              <div className="text-center">
                <div
                  className="mx-auto mb-3 flex items-center justify-center rounded-full"
                  style={{ width: '56px', height: '56px', background: '#EEF2FF' }}
                >
                  <Lock size={24} style={{ color: '#1A237E' }} />
                </div>
                <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>Authorise ULIP Access</h3>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  ULIP Logistics Gateway is requesting access to your DigiLocker documents
                </p>
              </div>

              <div className="rounded-xl p-3 space-y-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <p className="text-xs font-semibold" style={{ color: '#374151' }}>Documents to be shared:</p>
                {['Aadhaar (masked)', 'PAN Card', 'Driving Licence', 'Voter ID'].map((d) => (
                  <div key={d} className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                    <CheckCircle2 size={12} style={{ color: '#059669', flexShrink: 0 }} /> {d}
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <p className="text-xs" style={{ color: '#92400E' }}>
                  🔒 Your data is fetched directly from government issuers and encrypted at rest with AES-256. ULIP never stores raw Aadhaar numbers.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setStep('otp')}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: '#1A237E', color: 'white' }}
                >
                  Authorise via OTP
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div
                  className="mx-auto mb-3 flex items-center justify-center rounded-full"
                  style={{ width: '56px', height: '56px', background: '#EEF2FF' }}
                >
                  <Fingerprint size={24} style={{ color: '#1A237E' }} />
                </div>
                <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>Verify with OTP</h3>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  An OTP has been sent to your Aadhaar-linked mobile number ending in <strong>••••42</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full text-center text-xl font-bold tracking-widest rounded-xl px-4 py-3 outline-none"
                  style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', letterSpacing: '0.3em' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#1A237E'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                />
                {otpError && <p className="text-xs mt-1.5 text-center" style={{ color: '#DC2626' }}>{otpError}</p>}
                <p className="text-xs text-center mt-1" style={{ color: '#94A3B8' }}>
                  Demo hint: enter any 6-digit number
                </p>
              </div>

              <button
                onClick={handleVerify}
                className="w-full py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: '#1A237E', color: 'white' }}
              >
                Verify & Authorise
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center space-y-3">
              <div
                className="mx-auto flex items-center justify-center rounded-full"
                style={{ width: '64px', height: '64px', background: '#F0FDF4' }}
              >
                <CheckCircle2 size={32} style={{ color: '#059669' }} />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>Authorised Successfully</h3>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>Fetching documents from DigiLocker…</p>
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: '8px', height: '8px', background: '#1A237E',
                      animation: `bounce 1.2s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload mock modal ────────────────────────────────────────────────────────

function UploadModal({ docName, onClose, onSuccess }: { docName: string; onClose: () => void; onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  function handleFile(name: string) {
    setFileName(name);
  }

  function handleUpload() {
    if (!fileName) return;
    setUploading(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,35,66,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <p className="font-bold text-sm" style={{ color: '#0F172A' }}>Upload {docName}</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>PDF or image, max 5 MB</p>
          </div>
          <button onClick={onClose} style={{ color: '#94A3B8' }}><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-2 flex items-center justify-center rounded-full" style={{ width: '48px', height: '48px', background: '#F0FDF4' }}>
                <CheckCircle2 size={24} style={{ color: '#059669' }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#059669' }}>Uploaded & Queued for Verification</p>
            </div>
          ) : (
            <>
              <div
                className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragging ? '#1D4ED8' : '#E2E8F0',
                  background: dragging ? '#EFF6FF' : '#F8FAFC',
                }}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f.name);
                }}
                onClick={() => {
                  const inp = document.createElement('input');
                  inp.type = 'file';
                  inp.accept = '.pdf,.jpg,.jpeg,.png';
                  inp.onchange = () => { if (inp.files?.[0]) handleFile(inp.files[0].name); };
                  inp.click();
                }}
              >
                <Upload size={24} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                {fileName ? (
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{fileName}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>Drop file here or click to browse</p>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>PDF, JPG, PNG</p>
                  </>
                )}
              </div>

              <div className="rounded-lg p-3" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <p className="text-xs" style={{ color: '#92400E' }}>
                  🔒 Files are encrypted with AES-256 and stored in India-resident cloud storage. Only you can access your documents.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={!fileName || uploading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: !fileName || uploading ? '#94A3B8' : '#0A2342',
                  color: 'white',
                  cursor: !fileName || uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading && <RefreshCw size={14} className="animate-spin" />}
                {uploading ? 'Uploading…' : 'Upload Document'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IdentityPage() {
  const [tab, setTab] = useState<'individual' | 'company'>('individual');
  const [individualDocs, setIndividualDocs] = useState<Document[]>(INITIAL_INDIVIDUAL_DOCS);
  const [companyDocs, setCompanyDocs] = useState<Document[]>(INITIAL_COMPANY_DOCS);
  const [digilockerModal, setDigilockerModal] = useState(false);
  const [uploadModal, setUploadModal] = useState<{ id: string; name: string } | null>(null);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [digilockerConnected, setDigilockerConnected] = useState(true); // demo: already connected

  const docs = tab === 'individual' ? individualDocs : companyDocs;
  const setDocs = tab === 'individual' ? setIndividualDocs : setCompanyDocs;

  const verified = docs.filter((d) => d.status === 'verified').length;
  const pending  = docs.filter((d) => d.status === 'pending').length;
  const notFetched = docs.filter((d) => d.status === 'not_fetched').length;

  function handleFetch(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;

    if (doc.status === 'verified') {
      // Refresh — just show a quick pending → verified cycle
      setFetchingId(id);
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, fetchedOn: '11 May 2026', status: 'verified' } : d
          )
        );
        setFetchingId(null);
      }, 1000);
      return;
    }

    if (!digilockerConnected) {
      setDigilockerModal(true);
      return;
    }

    // Simulate fetch from DigiLocker
    setFetchingId(id);
    setTimeout(() => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: 'verified',
                fetchedOn: '11 May 2026',
                docNumber: d.id === 'dl'
                  ? 'MH01 2019 0054321'
                  : d.id === 'voter'
                    ? 'MH/12/034/987654'
                    : d.id === 'msme'
                      ? 'UDYAM-MH-29-0012345'
                      : d.id === 'tan'
                        ? 'MUMA12345B'
                        : 'VERIFIED',
              }
            : d
        )
      );
      setFetchingId(null);
    }, 2000);
  }

  function handleUpload(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (doc) setUploadModal({ id, name: doc.name });
  }

  function handleUploadSuccess() {
    if (!uploadModal) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === uploadModal.id
          ? { ...d, status: 'pending', fetchedOn: '11 May 2026' }
          : d
      )
    );
  }

  function handleDigiLockerAuthorize() {
    setDigilockerConnected(true);
    // Auto-fetch Aadhaar and PAN as demo of authorisation result
    setDocs((prev) =>
      prev.map((d) =>
        ['aadhaar', 'pan', 'dl', 'voter', 'gst', 'cin'].includes(d.id)
          ? { ...d, status: 'verified', fetchedOn: '11 May 2026' }
          : d
      )
    );
  }

  return (
    <>
      {digilockerModal && (
        <DigiLockerModal
          onClose={() => setDigilockerModal(false)}
          onAuthorize={handleDigiLockerAuthorize}
        />
      )}
      {uploadModal && (
        <UploadModal
          docName={uploadModal.name}
          onClose={() => setUploadModal(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: '40px', height: '40px', background: '#EEF2FF' }}
            >
              <Shield size={20} style={{ color: '#1A237E' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#0A2342' }}>My Identity</h1>
              <p className="text-sm" style={{ color: '#64748B' }}>Manage and verify your documents securely</p>
            </div>
          </div>

          {/* DigiLocker connection status */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0"
            style={{
              background: digilockerConnected ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${digilockerConnected ? '#BBF7D0' : '#FECACA'}`,
            }}
          >
            <div
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: digilockerConnected ? '#059669' : '#DC2626',
              }}
            />
            <span className="text-xs font-semibold" style={{ color: digilockerConnected ? '#059669' : '#DC2626' }}>
              DigiLocker {digilockerConnected ? 'Connected' : 'Not Connected'}
            </span>
            {!digilockerConnected && (
              <button
                onClick={() => setDigilockerModal(true)}
                className="text-xs font-semibold underline"
                style={{ color: '#DC2626' }}
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Verified', value: verified, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
            { label: 'Pending Review', value: pending, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'Not Fetched', value: notFetched, color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Encryption notice */}
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
        >
          <Lock size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
          <p className="text-xs" style={{ color: '#92400E', lineHeight: 1.6 }}>
            All documents are encrypted end-to-end using AES-256 and stored in India-resident data centres compliant with the Digital Personal Data Protection Act 2023. Raw Aadhaar numbers are never stored — only masked references are retained. Access is logged and auditable.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex" style={{ borderBottom: '1px solid #F1F5F9' }}>
            {([
              { key: 'individual', label: 'Individual', icon: <User size={15} /> },
              { key: 'company', label: 'Company / Business', icon: <Building2 size={15} /> },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors"
                style={{
                  background: tab === t.key ? 'white' : '#F8FAFC',
                  color: tab === t.key ? '#0A2342' : '#94A3B8',
                  borderBottom: tab === t.key ? '2px solid #1A237E' : '2px solid transparent',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3">
            {tab === 'individual' && (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                <User size={14} style={{ color: '#1A237E', flexShrink: 0, marginTop: '1px' }} />
                <p className="text-xs" style={{ color: '#3730A3' }}>
                  Documents are linked to your individual PAN. Aadhaar-based eKYC is available via DigiLocker. Your profile verification score improves with each verified document.
                </p>
              </div>
            )}
            {tab === 'company' && (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                <Building2 size={14} style={{ color: '#1A237E', flexShrink: 0, marginTop: '1px' }} />
                <p className="text-xs" style={{ color: '#3730A3' }}>
                  Business documents are linked to your GSTIN. GST and CIN can be fetched from government registries. MSME Udyam certificate is available via MCA21/DigiLocker.
                </p>
              </div>
            )}

            {docs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onFetch={handleFetch}
                onUpload={handleUpload}
                fetching={fetchingId}
              />
            ))}
          </div>
        </div>

        {/* DigiLocker connect CTA (if not connected) */}
        {!digilockerConnected && (
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: '#1A237E', color: 'white' }}
          >
            <div className="flex-1">
              <p className="font-bold text-base">Connect DigiLocker to auto-fetch documents</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                DigiLocker is a Government of India initiative enabling secure document storage and sharing. Connect once and fetch all your government-issued documents instantly.
              </p>
            </div>
            <button
              onClick={() => setDigilockerModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shrink-0"
              style={{ background: '#F59E0B', color: '#0A2342' }}
            >
              <ExternalLink size={15} /> Connect DigiLocker
            </button>
          </div>
        )}
      </div>
    </>
  );
}
