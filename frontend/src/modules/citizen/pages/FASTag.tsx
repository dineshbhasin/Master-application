import React, { useState } from 'react';
import { fastagApi } from '../../../api/fastag';

export default function FASTag() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<Record<string, unknown> | null>(null);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState('');

  const PRESETS = ['MH12AB1234', 'DL8CAB5678', 'KA03MN9012', 'GJ01XX7890'];

  async function handleFetch() {
    if (!vehicleNumber.trim()) { setError('Enter a vehicle number.'); return; }
    setError(''); setLoading(true);
    try {
      const [bal, txns] = await Promise.all([
        fastagApi.getBalance(vehicleNumber.trim()),
        fastagApi.getTransactions(vehicleNumber.trim()),
      ]);
      setBalance(bal);
      setTransactions((txns.transactions || []) as Record<string, unknown>[]);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  const statusColor = (s: unknown) => s === 'ACTIVE' ? '#059669' : s === 'LOW_BALANCE' ? '#D97706' : '#DC2626';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>FASTag &amp; Tolls</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Check balance and transaction history for any FASTag-linked vehicle.</p>

      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setVehicleNumber(p)}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', color: '#475569', fontFamily: 'monospace' }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          placeholder="Vehicle number e.g. MH12AB1234"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
        <button onClick={handleFetch} disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 8, background: loading ? '#94A3B8' : '#0A2342', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Fetching…' : 'Fetch'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {balance && (
        <>
          <div style={{ background: '#0A2342', borderRadius: 16, padding: 24, marginBottom: 16, color: 'white' }}>
            {!!balance._mock && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>⚡ Mock data</p>}
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Available Balance</p>
            <p style={{ fontSize: 36, fontWeight: 800 }}>₹{Number(balance.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>VEHICLE</p>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{String(balance.vehicleNumber)}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>STATUS</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: statusColor(balance.tagStatus) }}>{String(balance.tagStatus)}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>BANK</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{String(balance.issuingBank)}</p>
              </div>
            </div>
          </div>

          {transactions.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#0A2342' }}>Recent Transactions</p>
              </div>
              {transactions.map((t, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < transactions.length - 1 ? '1px solid #F8FAFC' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{String(t.tollPlaza)}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8' }}>{String(t.dateTime)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: t.status === 'FAILED' ? '#DC2626' : '#0F172A' }}>
                      {t.status === 'FAILED' ? 'Failed' : `-₹${t.amount}`}
                    </p>
                    <p style={{ fontSize: 11, color: '#94A3B8' }}>{`Bal ₹${String(t.balance)}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
