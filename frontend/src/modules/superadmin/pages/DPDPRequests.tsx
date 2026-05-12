import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, ErasureRequest } from '../../../api/admin';

const navy = '#0A2342';

function statusPill(status: string) {
  const s: Record<string, { bg: string; color: string }> = {
    pending:   { bg: '#FEF3C7', color: '#92400E' },
    approved:  { bg: '#D1FAE5', color: '#065F46' },
    completed: { bg: '#DBEAFE', color: '#1E40AF' },
    rejected:  { bg: '#FEE2E2', color: '#991B1B' },
  };
  const st = s[status] || s.pending;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.color }}>{status}</span>;
}

interface ApproveModal { request: ErasureRequest }

export default function DPDPRequests() {
  const [requests, setRequests] = useState<ErasureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [modal, setModal] = useState<ApproveModal | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getErasureRequests(statusFilter || undefined);
      setRequests(data.requests);
    } catch { } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove() {
    if (!modal || totpCode.length !== 6) return;
    setProcessing(true); setError('');
    try {
      await adminApi.approveErasure(modal.request.id, totpCode, note);
      setModal(null); setTotpCode(''); setNote('');
      load();
    } catch { setError('Invalid authenticator code or request error.'); }
    finally { setProcessing(false); }
  }

  async function handleExport(req: ErasureRequest) {
    try {
      const data = await adminApi.exportData(req.id, req.id);
      alert(`Export created: ${data.exportId}\nExpires: ${new Date(data.expiresAt).toLocaleString()}`);
    } catch { alert('Export failed.'); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>DPDP Act 2023 — Erasure Requests</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Right to erasure (§12) · Data portability (§6) · All approvals audit-logged and 2FA-gated</p>
      </div>

      <div style={{ background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: 12, padding: '12px 20px', marginBottom: 20, fontSize: 13, color: '#4C1D95' }}>
        🇮🇳 DPDP Act 2023 requires erasure within 30 days of approval. All data remains on sovereign Indian infrastructure (in-west1, Mumbai).
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 10, padding: 4, border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {['pending', 'completed', 'rejected', ''].map((s) => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 7, border: 'none', background: statusFilter === s ? navy : 'transparent', color: statusFilter === s ? 'white' : '#64748B', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
        ) : requests.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: 16, color: '#94A3B8', fontWeight: 600 }}>No requests in this category</p>
          </div>
        ) : requests.map((req) => (
          <div key={req.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: navy, margin: 0 }}>{req.userName}</p>
                  {statusPill(req.status)}
                </div>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{req.userEmail}</p>
              </div>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Requested: {new Date(req.requestedAt).toLocaleDateString('en-IN')}</p>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reason</p>
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{req.reason}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Data Categories Requested</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {req.dataCategories.map((cat) => (
                  <span key={cat} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#EDE9FE', color: '#5B21B6', fontWeight: 600 }}>{cat}</span>
                ))}
              </div>
            </div>

            {req.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal({ request: req })}
                  style={{ padding: '8px 20px', borderRadius: 8, background: navy, color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Approve (2FA) →
                </button>
                <button onClick={() => handleExport(req)}
                  style={{ padding: '8px 20px', borderRadius: 8, background: 'white', color: navy, border: '1px solid #E2E8F0', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Export Data (Art. 6)
                </button>
              </div>
            )}
            {req.status === 'completed' && req.anonymizedAt && (
              <p style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                ✓ Anonymized on {new Date(req.anonymizedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Approval modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8 }}>Approve Erasure Request</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
              This will permanently anonymize <strong>{modal.request.userEmail}</strong>. Action is irreversible and will be audit-logged.
            </p>

            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, color: '#92400E' }}>
              ⚠ User profile, PII, and linked records will be replaced with anonymized tokens.
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>REVIEW NOTE (OPTIONAL)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Verified request, no legal hold"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', marginBottom: 16, resize: 'vertical', minHeight: 72, boxSizing: 'border-box', outline: 'none' }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>AUTHENTICATOR CODE</label>
            <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 20, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.25em', boxSizing: 'border-box', outline: 'none', marginBottom: 16 }} />

            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal(null); setTotpCode(''); setNote(''); setError(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleApprove} disabled={processing || totpCode.length !== 6}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: processing ? '#94A3B8' : '#DC2626', color: 'white', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {processing ? 'Processing…' : 'Anonymize User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
