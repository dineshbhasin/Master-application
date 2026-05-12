import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/admin';
const navy = '#0A2342';
const saffron = '#F59E0B';

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSetup() {
    setLoading(true); setError('');
    try {
      const data = await adminApi.setup2FA();
      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setStep('verify');
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (err.message?.includes('ALREADY_ENABLED')) {
        setStep('verify');
      } else {
        setError(err.message || 'Setup failed.');
      }
    } finally { setLoading(false); }
  }

  async function handleVerify() {
    if (code.length !== 6) { setError('Enter the 6-digit code.'); return; }
    setLoading(true); setError('');
    try {
      const data = await adminApi.verify2FA(code);
      localStorage.setItem('ulip_token', data.token);
      navigate('/super-admin/overview');
    } catch {
      setError('Incorrect code. Try again.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: navy, fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>
            {step === 'setup' ? 'Set Up Two-Factor Auth' : 'Verify Authenticator'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            {step === 'setup'
              ? 'Required for all Super Admin sessions'
              : 'Open your authenticator app and enter the 6-digit code'}
          </p>
        </div>

        {step === 'setup' && (
          <div>
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: '#92400E' }}>
              You will need Google Authenticator, Authy, or any TOTP app to complete setup.
            </div>
            <button onClick={handleSetup} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: loading ? '#94A3B8' : navy, color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Generating…' : 'Generate QR Setup Code'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div>
            {secret && (
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>
                  Scan the otpauth URL in your authenticator, or manually enter this secret:
                </p>
                <code style={{ display: 'block', background: '#0A2342', color: '#F59E0B', padding: '10px 16px', borderRadius: 8, fontSize: 13, letterSpacing: '0.08em', wordBreak: 'break-all', marginBottom: 8 }}>
                  {secret}
                </code>
                <p style={{ fontSize: 10, color: '#94A3B8', margin: 0, wordBreak: 'break-all' }}>{otpauthUrl}</p>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>6-DIGIT CODE</label>
              <input
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="000000"
                style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: 24, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.3em', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button onClick={handleVerify} disabled={loading || code.length !== 6}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: loading || code.length !== 6 ? '#94A3B8' : saffron, color: navy, border: 'none', fontWeight: 700, fontSize: 15, cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Verifying…' : 'Verify & Enter Admin Console'}
            </button>
          </div>
        )}

        {error && step === 'setup' && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
