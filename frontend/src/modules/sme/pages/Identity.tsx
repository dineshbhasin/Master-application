import React, { useState } from 'react';
import {
  User, Building2, Shield, CheckCircle2, Clock, AlertCircle,
  ExternalLink, Upload, RefreshCw, Lock, Fingerprint, FileText, X,
} from 'lucide-react';

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

const INITIAL_INDIVIDUAL_DOCS: Document[] = [
  { id: 'aadhaar', name: 'Aadhaar Card', description: 'Unique identification issued by UIDAI', icon: <Fingerprint size={20} />, status: 'verified', docNumber: 'XXXX XXXX 7842', fetchedOn: '08 May 2026', issuedBy: 'UIDAI', digilockerAvailable: true },
  { id: 'pan', name: 'PAN Card', description: 'Permanent Account Number — Income Tax', icon: <FileText size={20} />, status: 'verified', docNumber: 'ABCDE1234F', fetchedOn: '08 May 2026', issuedBy: 'Income Tax Department', digilockerAvailable: true },
  { id: 'dl', name: 'Driving Licence', description: 'Motor vehicle driving authorisation', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'Regional Transport Office (RTO)', digilockerAvailable: true },
  { id: 'passport', name: 'Passport', description: 'International travel document', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'Ministry of External Affairs', digilockerAvailable: false },
  { id: 'voter', name: 'Voter ID (EPIC)', description: 'Electoral Photo Identity Card', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'Election Commission of India', digilockerAvailable: true },
];

const INITIAL_COMPANY_DOCS: Document[] = [
  { id: 'gst', name: 'GST Registration Certificate', description: 'GSTIN-linked business registration', icon: <FileText size={20} />, status: 'verified', docNumber: '27AABCU9603R1ZX', fetchedOn: '08 May 2026', issuedBy: 'GSTN / GST Council', digilockerAvailable: true },
  { id: 'cin', name: 'Certificate of Incorporation', description: 'Company registration by MCA21', icon: <FileText size={20} />, status: 'verified', docNumber: 'U63000MH2018PTC300456', fetchedOn: '09 May 2026', issuedBy: 'Ministry of Corporate Affairs', digilockerAvailable: true },
  { id: 'msme', name: 'MSME / Udyam Certificate', description: 'Micro, Small & Medium Enterprise registration', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'Ministry of MSME / Udyam Portal', digilockerAvailable: true },
  { id: 'iec', name: 'IEC — Import Export Code', description: 'Mandatory for cross-border trade (DGFT)', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'DGFT (Directorate General of Foreign Trade)', digilockerAvailable: false },
  { id: 'tan', name: 'TAN Certificate', description: 'Tax Deduction Account Number', icon: <FileText size={20} />, status: 'not_fetched', issuedBy: 'Income Tax Department', digilockerAvailable: true },
];

const STATUS_CONFIG: Record<DocStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  verified:    { label: 'Verified', bg: '#F0FDF4', color: '#059669', icon: <CheckCircle2 size={13} /> },
  pending:     { label: 'Pending', bg: '#FFFBEB', color: '#D97706', icon: <Clock size={13} /> },
  not_fetched: { label: 'Not Fetched', bg: '#F8FAFC', color: '#94A3B8', icon: <AlertCircle size={13} /> },
  expired:     { label: 'Expired', bg: '#FEF2F2', color: '#DC2626', icon: <AlertCircle size={13} /> },
};

function DocCard({ doc, onFetch, onUpload, fetching }: { doc: Document; onFetch: (id: string) => void; onUpload: (id: string) => void; fetching: string | null }) {
  const s = STATUS_CONFIG[doc.status];
  const isFetching = fetching === doc.id;

  return (
    <div style={{ background: 'white', border: `1px solid ${doc.status === 'verified' ? '#BBF7D0' : '#E2E8F0'}`, borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 44, height: 44, background: doc.status === 'verified' ? '#F0FDF4' : '#F8FAFC', color: doc.status === 'verified' ? '#059669' : '#94A3B8', border: `1px solid ${doc.status === 'verified' ? '#BBF7D0' : '#E2E8F0'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {doc.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{doc.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999 }}>
            {s.icon} {s.label}
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 2px' }}>{doc.description}</p>
        {doc.docNumber && <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#0A2342', margin: 0 }}>{doc.docNumber}</p>}
        {doc.fetchedOn && <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Fetched {doc.fetchedOn} · Issued by {doc.issuedBy}</p>}
        {doc.status === 'not_fetched' && <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Issued by {doc.issuedBy}</p>}
        {doc.expiresOn && <p style={{ fontSize: 12, color: '#DC2626', margin: '2px 0 0' }}>Expires {doc.expiresOn}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        {doc.status === 'verified' ? (
          <button onClick={() => onFetch(doc.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}>
            <RefreshCw size={12} /> Refresh
          </button>
        ) : (
          <>
            {doc.digilockerAvailable && (
              <button onClick={() => onFetch(doc.id)} disabled={isFetching}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, background: isFetching ? '#94A3B8' : '#1D4ED8', color: 'white', border: 'none', cursor: isFetching ? 'not-allowed' : 'pointer', minWidth: 100 }}>
                {isFetching ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <ExternalLink size={11} />}
                {isFetching ? 'Fetching…' : 'DigiLocker'}
              </button>
            )}
            <button onClick={() => onUpload(doc.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}>
              <Upload size={11} /> Upload
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DigiLockerModal({ onClose, onAuthorize }: { onClose: () => void; onAuthorize: () => void }) {
  const [step, setStep] = useState<'consent' | 'otp' | 'success'>('consent');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  function handleVerify() {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit OTP sent to your Aadhaar-linked mobile.'); return; }
    setOtpError('');
    setStep('success');
    setTimeout(() => { onAuthorize(); onClose(); }, 1800);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(10,35,66,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1A237E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>DigiLocker</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Ministry of Electronics &amp; IT</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {step === 'consent' && (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Lock size={24} style={{ color: '#1A237E' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', margin: 0 }}>Authorise ULIP Access</h3>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>ULIP is requesting access to your DigiLocker documents</p>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>Documents to be shared:</p>
                {['Aadhaar (masked)', 'PAN Card', 'Driving Licence', 'Voter ID'].map((d) => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                    <CheckCircle2 size={12} style={{ color: '#059669', flexShrink: 0 }} /> {d}
                  </div>
                ))}
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: 12 }}>
                <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>🔒 Data fetched directly from government issuers and encrypted at rest with AES-256.</p>
              </div>
              <button onClick={() => setStep('otp')} style={{ width: '100%', padding: '10px', borderRadius: 12, background: '#1A237E', color: 'white', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                Authorise via OTP
              </button>
              <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, background: '#F1F5F9', color: '#64748B', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Fingerprint size={24} style={{ color: '#1A237E' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', margin: 0 }}>Verify with OTP</h3>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>OTP sent to your Aadhaar-linked mobile ending in ••••42</p>
              </div>
              <div>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="Enter 6-digit OTP"
                  style={{ width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.3em', borderRadius: 12, padding: '12px 16px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#1A237E'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                />
                {otpError && <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 6 }}>{otpError}</p>}
                <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>Demo: enter any 6-digit number</p>
              </div>
              <button onClick={handleVerify} style={{ width: '100%', padding: '10px', borderRadius: 12, background: '#1A237E', color: 'white', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                Verify &amp; Authorise
              </button>
            </>
          )}

          {step === 'success' && (
            <div style={{ padding: '16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} style={{ color: '#059669' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', margin: 0 }}>Authorised Successfully</h3>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Fetching documents from DigiLocker…</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, background: '#1A237E', borderRadius: '50%', animation: `bounce-dot 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadModal({ docName, onClose, onSuccess }: { docName: string; onClose: () => void; onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  function handleFile(name: string) { setFileName(name); }

  function handleUpload() {
    if (!fileName) return;
    setUploading(true);
    setTimeout(() => { setDone(true); setTimeout(() => { onSuccess(); onClose(); }, 1500); }, 1200);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(10,35,66,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0 }}>Upload {docName}</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>PDF or image, max 5 MB</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 48, height: 48, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <CheckCircle2 size={24} style={{ color: '#059669' }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#059669', margin: 0 }}>Uploaded &amp; Queued for Verification</p>
            </div>
          ) : (
            <>
              <div
                style={{ borderRadius: 12, border: `2px dashed ${dragging ? '#1D4ED8' : '#E2E8F0'}`, padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? '#EFF6FF' : '#F8FAFC' }}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f.name); }}
                onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,.jpg,.jpeg,.png'; inp.onchange = () => { if (inp.files?.[0]) handleFile(inp.files[0].name); }; inp.click(); }}
              >
                <Upload size={24} style={{ color: '#94A3B8', display: 'block', margin: '0 auto 8px' }} />
                {fileName ? (
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{fileName}</p>
                ) : (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: 0 }}>Drop file here or click to browse</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>PDF, JPG, PNG</p>
                  </>
                )}
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>🔒 Files encrypted with AES-256, stored in India-resident cloud storage.</p>
              </div>
              <button onClick={handleUpload} disabled={!fileName || uploading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, background: !fileName || uploading ? '#94A3B8' : '#0A2342', color: 'white', fontWeight: 600, fontSize: 14, border: 'none', cursor: !fileName || uploading ? 'not-allowed' : 'pointer' }}>
                {uploading && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {uploading ? 'Uploading…' : 'Upload Document'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Identity() {
  const [tab, setTab]                       = useState<'individual' | 'company'>('individual');
  const [individualDocs, setIndividualDocs] = useState<Document[]>(INITIAL_INDIVIDUAL_DOCS);
  const [companyDocs, setCompanyDocs]       = useState<Document[]>(INITIAL_COMPANY_DOCS);
  const [digilockerModal, setDigilockerModal] = useState(false);
  const [uploadModal, setUploadModal]       = useState<{ id: string; name: string } | null>(null);
  const [fetchingId, setFetchingId]         = useState<string | null>(null);
  const [digilockerConnected]               = useState(true);

  const docs    = tab === 'individual' ? individualDocs : companyDocs;
  const setDocs = tab === 'individual' ? setIndividualDocs : setCompanyDocs;

  const verified   = docs.filter((d) => d.status === 'verified').length;
  const pending    = docs.filter((d) => d.status === 'pending').length;
  const notFetched = docs.filter((d) => d.status === 'not_fetched').length;

  function handleFetch(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.status === 'verified') {
      setFetchingId(id);
      setTimeout(() => { setDocs((prev) => prev.map((d) => d.id === id ? { ...d, fetchedOn: '11 May 2026' } : d)); setFetchingId(null); }, 1000);
      return;
    }
    setFetchingId(id);
    setTimeout(() => {
      setDocs((prev) => prev.map((d) => d.id === id ? {
        ...d, status: 'verified', fetchedOn: '11 May 2026',
        docNumber: d.id === 'dl' ? 'MH01 2019 0054321' : d.id === 'voter' ? 'MH/12/034/987654' : d.id === 'msme' ? 'UDYAM-MH-29-0012345' : d.id === 'tan' ? 'MUMA12345B' : 'VERIFIED',
      } : d));
      setFetchingId(null);
    }, 2000);
  }

  function handleUpload(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (doc) setUploadModal({ id, name: doc.name });
  }

  function handleUploadSuccess() {
    if (!uploadModal) return;
    setDocs((prev) => prev.map((d) => d.id === uploadModal.id ? { ...d, status: 'pending', fetchedOn: '11 May 2026' } : d));
  }

  function handleDigiLockerAuthorize() {
    setDocs((prev) => prev.map((d) => ['aadhaar', 'pan', 'dl', 'voter', 'gst', 'cin'].includes(d.id) ? { ...d, status: 'verified', fetchedOn: '11 May 2026' } : d));
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? 'white' : '#F8FAFC', color: active ? '#0A2342' : '#94A3B8',
    borderBottom: active ? '2px solid #1A237E' : '2px solid transparent',
  });

  return (
    <>
      {digilockerModal && <DigiLockerModal onClose={() => setDigilockerModal(false)} onAuthorize={handleDigiLockerAuthorize} />}
      {uploadModal && <UploadModal docName={uploadModal.name} onClose={() => setUploadModal(null)} onSuccess={handleUploadSuccess} />}

      <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#EEF2FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} style={{ color: '#1A237E' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', margin: 0 }}>My Identity</h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Manage and verify your documents securely</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: digilockerConnected ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${digilockerConnected ? '#BBF7D0' : '#FECACA'}`, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: digilockerConnected ? '#059669' : '#DC2626' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: digilockerConnected ? '#059669' : '#DC2626' }}>DigiLocker {digilockerConnected ? 'Connected' : 'Not Connected'}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Verified', value: verified, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
            { label: 'Pending Review', value: pending, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'Not Fetched', value: notFetched, color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: s.color, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Encryption notice */}
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Lock size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
            All documents are encrypted end-to-end with AES-256 and stored in India-resident data centres compliant with the Digital Personal Data Protection Act 2023.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
            <button style={tabBtnStyle(tab === 'individual')} onClick={() => setTab('individual')}><User size={15} /> Individual</button>
            <button style={tabBtnStyle(tab === 'company')} onClick={() => setTab('company')}><Building2 size={15} /> Company / Business</button>
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'individual' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12 }}>
                <User size={14} style={{ color: '#1A237E', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#3730A3', margin: 0 }}>Documents are linked to your individual PAN. Aadhaar-based eKYC is available via DigiLocker.</p>
              </div>
            )}
            {tab === 'company' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12 }}>
                <Building2 size={14} style={{ color: '#1A237E', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#3730A3', margin: 0 }}>Business documents are linked to your GSTIN. GST and CIN can be fetched from government registries.</p>
              </div>
            )}
            {docs.map((doc) => <DocCard key={doc.id} doc={doc} onFetch={handleFetch} onUpload={handleUpload} fetching={fetchingId} />)}
          </div>
        </div>
      </div>
    </>
  );
}
