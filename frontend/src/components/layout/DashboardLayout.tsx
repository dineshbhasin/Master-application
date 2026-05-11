import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: 'margin 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{ height: 56, backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={() => setSidebarOpen((o) => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B', padding: 4, lineHeight: 1 }}>
            ☰
          </button>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>ULIP Logistics Gateway</span>
        </header>
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
