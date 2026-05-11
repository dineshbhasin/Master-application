import React from 'react';

function AshokaChakra({ size = 48 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const spokeCount = 24;
  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const angle = (i * 360) / spokeCount;
    const rad = (angle * Math.PI) / 180;
    const innerR = r * 0.22;
    const outerR = r * 0.82;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx={cx} cy={cy} r={r * 0.2} stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.87} stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .auth-root { display: flex; flex-direction: row; min-height: 100vh; background: #F8FAFC; font-family: Poppins, sans-serif; }
        .auth-left { width: 44%; display: flex; flex-direction: column; justify-content: space-between; padding: 3rem 3rem 2.5rem; position: relative; overflow: hidden; background: linear-gradient(160deg, #0A2342 0%, #1B3052 100%); flex-shrink: 0; }
        .auth-mobile-bar { display: none; }
        .auth-right { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 3rem 2rem; position: relative; min-height: 100vh; }
        .auth-right-inner { width: 100%; max-width: 26rem; }
        .auth-footer { position: absolute; bottom: 1.5rem; font-size: 0.75rem; color: #94A3B8; text-align: center; margin: 0; }
        @media (max-width: 767px) {
          .auth-root { flex-direction: column; }
          .auth-left { display: none; }
          .auth-mobile-bar { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: #0A2342; flex-shrink: 0; }
          .auth-right { min-height: unset; justify-content: flex-start; padding: 2rem 1.25rem 5rem; }
          .auth-right-inner { max-width: 100%; }
          .auth-footer { position: static; margin-top: 2rem; }
        }
      `}</style>

      <div className="auth-root">
        {/* Mobile-only top bar */}
        <div className="auth-mobile-bar">
          <div style={{ color: '#F59E0B' }}>
            <AshokaChakra size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>ULIP</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
              Unified Logistics Interface Platform
            </div>
          </div>
        </div>

        {/* Left Navy Panel — desktop only */}
        <div className="auth-left">
          <div
            style={{
              position: 'absolute',
              bottom: '-8rem',
              right: '-8rem',
              width: '28rem',
              height: '28rem',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-4rem',
              left: '-4rem',
              width: '16rem',
              height: '16rem',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
              <div style={{ color: '#F59E0B' }}>
                <AshokaChakra size={36} />
              </div>
              <div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>ULIP</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
                  Unified Logistics Interface Platform
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', color: 'rgba(245,158,11,0.35)' }}>
              <AshokaChakra size={140} />
            </div>

            <h2
              style={{
                fontSize: '1.625rem',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.25,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Securing India&apos;s
              <br />
              <span style={{ color: '#F59E0B' }}>Logistics Backbone</span>
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.75,
                maxWidth: '22rem',
              }}
            >
              One sovereign platform. Multi-modal visibility. Real-time data exchange for every stakeholder in
              India&apos;s supply chain.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '2rem' }}>
              {[
                '14 Integrated Service Modules',
                'ISO 27001 & DPDP Act 2023 Compliant',
                'NIC-Hosted Sovereign Infrastructure',
              ].map((feat) => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '9999px',
                      background: 'rgba(16,185,129,0.2)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4L3.2 6.2L7 2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.25rem' }} />
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>
              Ministry of Commerce &amp; Industry<br />
              Government of India<br />
              NICDC Logistics Data Services Limited
            </p>
          </div>
        </div>

        {/* Right White Panel */}
        <div className="auth-right">
          <div className="auth-right-inner">
            {children}
          </div>
          <p className="auth-footer">
            © 2025 NICDC Logistics Data Services Limited | Government of India
          </p>
        </div>
      </div>
    </>
  );
}
