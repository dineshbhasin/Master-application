import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, AdminUser } from '../../../api/admin';

const navy = '#0A2342';
const saffron = '#F59E0B';

const ROLES = ['citizen', 'sme', 'enterprise', 'official', 'super_admin'];

function rolePill(role: string) {
  const s: Record<string, { bg: string; color: string }> = {
    super_admin: { bg: '#FDE8FF', color: '#7E22CE' },
    official:    { bg: '#EDE9FE', color: '#5B21B6' },
    enterprise:  { bg: '#DBEAFE', color: '#1E40AF' },
    sme:         { bg: '#FEF3C7', color: '#92400E' },
    citizen:     { bg: '#F1F5F9', color: '#475569' },
  };
  const st = s[role] || s.citizen;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.color }}>{role}</span>;
}

interface RoleModal { user: AdminUser; newRole: string }

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState<RoleModal | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined });
      setUsers(data.users);
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function handleRoleChange() {
    if (!modal || totpCode.length !== 6) return;
    setSaving(true); setError('');
    try {
      await adminApi.updateRole(modal.user._id, modal.newRole, totpCode);
      setModal(null); setTotpCode('');
      load();
    } catch { setError('Invalid authenticator code.'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: navy, marginBottom: 4 }}>User Management</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>RBAC · {total} total users · Role changes require 2FA re-challenge</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', background: 'white', color: '#475569' }}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['User', 'Role', 'Organization', '2FA', 'Last Active', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                <td style={{ padding: '14px 16px' }}>
                  <p style={{ fontWeight: 700, color: navy, margin: 0 }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{u.email}</p>
                </td>
                <td style={{ padding: '14px 16px' }}>{rolePill(u.role)}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>{u.organization || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: u.totpEnabled ? '#059669' : '#94A3B8' }}>
                    {u.totpEnabled ? '✓ Enabled' : '✗ Off'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select
                    defaultValue={u.role}
                    onChange={(e) => setModal({ user: u, newRole: e.target.value })}
                    style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 12, fontFamily: 'inherit', background: 'white', cursor: 'pointer', color: navy }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role change modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 8 }}>Confirm Role Change</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              Change <strong>{modal.user.email}</strong> to role <strong>{modal.newRole}</strong>. This action is audit-logged and requires your authenticator code.
            </p>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>AUTHENTICATOR CODE</label>
            <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 20, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.25em', boxSizing: 'border-box', outline: 'none', marginBottom: 16 }} />
            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal(null); setTotpCode(''); setError(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleRoleChange} disabled={saving || totpCode.length !== 6}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: saving ? '#94A3B8' : saffron, color: navy, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving…' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
