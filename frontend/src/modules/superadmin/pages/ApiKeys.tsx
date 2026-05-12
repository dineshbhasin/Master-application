import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, ApiKeyRecord } from '../../../api/admin';

const navy = '#0A2342';
const saffron = '#F59E0B';

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<{ key: string; prefix: string } | null>(null);
  const [rotateModal, setRotateModal] = useState<{ keyId: string; orgName: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ organizationId: 'org1', organizationName: 'Tata Logistics Ltd', label: 'Production', scopes: 'read,write' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getApiKeys();
      setKeys(data.keys);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate() {
    setProcessing(true); setError('');
    try {
      const data = await adminApi.generateKey({ ...genForm, scopes: genForm.scopes.split(',').map((s) => s.trim()) });
      setNewKey({ key: data.key, prefix: data.keyPrefix });
      setShowGenerate(false);
      load();
    } catch { setError('Failed to generate key.'); }
    finally { setProcessing(false); }
  }

  async function handleRotate() {
    if (!rotateModal || totpCode.length !== 6) return;
    setProcessing(true); setError('');
    try {
      const data = await adminApi.rotateKey(rotateModal.keyId, totpCode);
      setNewKey({ key: data.key, prefix: data.keyPrefix });
      setRotateModal(null); setTotpCode('');
      load();
    } catch { setError('Invalid authenticator code.'); }
    finally { setProcessing(false); }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm('Revoke this key? The organization will immediately lose API access.')) return;
    try { await adminApi.revokeKey(id); load(); }
    catch { alert('Revoke failed.'); }
  }

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>API Key Management</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Generate, rotate, and revoke organization API keys · Rotations require 2FA</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          style={{ padding: '10px 20px', borderRadius: 10, background: saffron, color: navy, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Generate Key
        </button>
      </div>

      {/* Newly generated key banner */}
      {newKey && (
        <div style={{ background: '#0A2342', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>⚠ Copy this key now — it will never be shown again</p>
          <code style={{ display: 'block', background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 10, fontSize: 13, color: 'white', letterSpacing: '0.04em', wordBreak: 'break-all', marginBottom: 12 }}>
            {newKey.key}
          </code>
          <button onClick={() => { navigator.clipboard.writeText(newKey.key); }}
            style={{ padding: '8px 20px', borderRadius: 8, background: saffron, color: navy, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginRight: 10 }}>
            Copy to Clipboard
          </button>
          <button onClick={() => setNewKey(null)}
            style={{ padding: '8px 20px', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Organization', 'Key', 'Label', 'Scopes', 'Calls (30d)', 'Last Used', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Loading…</td></tr>
            ) : keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #F8FAFC', opacity: k.isRevoked ? 0.5 : 1 }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: navy }}>{k.organizationName}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{k.keyPrefix}••••••••••</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>{k.label}</td>
                <td style={{ padding: '14px 16px' }}>
                  {k.scopes.map((s) => (
                    <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: s === 'write' ? '#DBEAFE' : '#F1F5F9', color: s === 'write' ? '#1E40AF' : '#475569', fontWeight: 600, marginRight: 4 }}>{s}</span>
                  ))}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: navy }}>{fmt(k.callsLast30d)}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8' }}>
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('en-IN') : 'Never'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: k.isRevoked ? '#FEE2E2' : '#D1FAE5', color: k.isRevoked ? '#991B1B' : '#065F46' }}>
                    {k.isRevoked ? 'Revoked' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {!k.isRevoked && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setRotateModal({ keyId: k.id, orgName: k.organizationName })}
                        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #E2E8F0', background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
                        Rotate
                      </button>
                      <button onClick={() => handleRevoke(k.id)}
                        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #FCA5A5', background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#DC2626' }}>
                        Revoke
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate modal */}
      {showGenerate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, width: 460 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 20 }}>Generate API Key</h2>
            {(['organizationId', 'organizationName', 'label', 'scopes'] as const).map((field) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase' }}>{field}</label>
                <input value={genForm[field]} onChange={(e) => setGenForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}
            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setShowGenerate(false); setError(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleGenerate} disabled={processing}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: processing ? '#94A3B8' : saffron, color: navy, fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {processing ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate modal */}
      {rotateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, width: 420 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8 }}>Rotate API Key</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              Rotating key for <strong>{rotateModal.orgName}</strong>. The old key is immediately invalidated.
            </p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>AUTHENTICATOR CODE</label>
            <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 20, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.25em', boxSizing: 'border-box', outline: 'none', marginBottom: 16 }} />
            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRotateModal(null); setTotpCode(''); setError(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleRotate} disabled={processing || totpCode.length !== 6}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: processing ? '#94A3B8' : saffron, color: navy, fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {processing ? 'Rotating…' : 'Rotate Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
