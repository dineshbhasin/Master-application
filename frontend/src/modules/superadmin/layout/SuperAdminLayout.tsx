import React from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';

interface Props { children: React.ReactNode }

export default function SuperAdminLayout({ children }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Poppins', sans-serif" }}>
      <SuperAdminSidebar />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
