import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  // Auto-close on mobile, auto-open on desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    // paddingLeft on the outer container (not marginLeft on child) keeps the flex
    // child's width correctly bounded — avoids page-level horizontal overflow.
    <div style={{
      display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC',
      paddingLeft: sidebarOpen && !isMobile ? 260 : 0,
      transition: 'padding-left 0.3s ease',
      boxSizing: 'border-box',
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 56, backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={() => setSidebarOpen((o) => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B', padding: 4, lineHeight: 1 }}>
            ☰
          </button>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>ULIP Logistics Gateway</span>
        </header>
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
