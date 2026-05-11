import React from 'react';
import { useAuth } from '../../../auth/AuthContext';

export default function ActivityLog() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 4 }}>Activity Log</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Platform audit trail — visible to Official role only.</p>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>🔒 Restricted to Official role</p>
        <p style={{ fontSize: 13, color: '#DC2626' }}>Logged in as: {user?.email} ({user?.role})</p>
      </div>
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
        <p style={{ fontSize: 13, color: '#64748B' }}>Connect to <code>/api/audit</code> endpoint (to be built) to stream live audit events from MongoDB AuditLog collection.</p>
      </div>
    </div>
  );
}
