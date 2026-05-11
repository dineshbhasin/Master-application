/**
 * EXIM & Trade Compliance — SME Module
 *
 * Port the full EXIM page logic from the Next.js app:
 *   Source: (Next.js root)/app/dashboard/exim/page.tsx
 *
 * The checklist generation logic is entirely client-side (no API call needed).
 * Copy the generateChecklist(), resolveHSN(), getFTA() functions and the full
 * component render from the Next.js source file as-is — they work in plain React.
 *
 * TODO for tech team:
 *   1. Copy generateChecklist logic from Next.js source
 *   2. Remove 'use client' directive (not needed in CRA)
 *   3. Replace lucide-react imports (already in frontend/package.json after npm install)
 */

import React from 'react';

export default function EXIM() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 8 }}>EXIM &amp; Trade Compliance</h1>
      <p style={{ color: '#64748B', fontSize: 14, maxWidth: 480, margin: '0 auto 24px' }}>
        Port the checklist generator from <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>app/dashboard/exim/page.tsx</code> in the Next.js project.
        The logic is fully client-side — copy generateChecklist(), resolveHSN(), getFTA() and the JSX render directly.
      </p>
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, textAlign: 'left', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0A2342', marginBottom: 8 }}>Implementation checklist:</p>
        {['Copy generateChecklist logic from Next.js source', 'Remove "use client" directive', 'Install lucide-react: npm install lucide-react', 'Replace next/dynamic map import with direct Leaflet usage'].map((item, i) => (
          <p key={i} style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>☐ {item}</p>
        ))}
      </div>
    </div>
  );
}
