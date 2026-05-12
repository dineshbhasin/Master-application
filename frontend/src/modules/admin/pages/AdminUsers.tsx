import React, { useState, useEffect, useCallback } from 'react';
import { platformApi, PlatformUser } from '../../../api/platform';

const ROLES = ['citizen', 'sme', 'enterprise', 'official'];

const roleColor: Record<string, string> = {
  citizen:    '#6B7280',
  sme:        '#3B82F6',
  enterprise: '#8B5CF6',
  official:   '#F59E0B',
  super_admin:'#EF4444',
};

export default function AdminUsers() {
  const [users, setUsers]       = useState<PlatformUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [pendingRole, setPendingRole] = useState<{ user: PlatformUser; newRole: string } | null>(null);
  const [confirm, setConfirm]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PlatformUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformApi.getUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 25 });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function applyRoleChange() {
    if (!pendingRole) return;
    setActionLoading(true);
    try {
      await platformApi.updateUserRole(pendingRole.user._id, pendingRole.newRole);
      setPendingRole(null);
      setConfirm('');
      load();
    } catch {
      setError('Role update failed.');
    } finally {
      setActionLoading(false);
    }
  }

  async function applyDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await platformApi.deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch {
      setError('Delete failed.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: 0 }}>User Management</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Manage roles and access for all platform users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email…"
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, color: '#374151', outline: 'none' }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          <option value="super_admin">super_admin</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{total} users</span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Name', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No users found.</td></tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: `${roleColor[u.role] || '#6B7280'}20`, color: roleColor[u.role] || '#6B7280', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: u.isVerified ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {u.isVerified ? 'Yes' : 'No'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      defaultValue={u.role}
                      onChange={(e) => setPendingRole({ user: u, newRole: e.target.value })}
                      style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 12, color: '#374151', outline: 'none', cursor: 'pointer' }}
                    >
                      {['citizen', 'sme', 'enterprise', 'official', 'super_admin'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: p === page ? '#0A2342' : 'white', color: p === page ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Role change confirm modal */}
      {pendingRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 420, maxWidth: '90vw' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0A2342', marginTop: 0 }}>Confirm Role Change</h2>
            <p style={{ color: '#374151', fontSize: 14 }}>
              Change <strong>{pendingRole.user.name}</strong> from <strong>{pendingRole.user.role}</strong> to <strong>{pendingRole.newRole}</strong>?
            </p>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={`Type "${pendingRole.user.email}" to confirm`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setPendingRole(null); setConfirm(''); }}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={applyRoleChange}
                disabled={confirm !== pendingRole.user.email || actionLoading}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: confirm === pendingRole.user.email ? '#0A2342' : '#E5E7EB', color: confirm === pendingRole.user.email ? 'white' : '#9CA3AF', cursor: 'pointer', fontWeight: 700 }}>
                {actionLoading ? 'Saving…' : 'Apply Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 420, maxWidth: '90vw' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', marginTop: 0 }}>Delete User</h2>
            <p style={{ color: '#374151', fontSize: 14 }}>
              This will permanently delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email}). This cannot be undone.
            </p>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={`Type "${deleteTarget.email}" to confirm`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setDeleteTarget(null); setConfirm(''); }}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={applyDelete}
                disabled={confirm !== deleteTarget.email || actionLoading}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: confirm === deleteTarget.email ? '#DC2626' : '#E5E7EB', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                {actionLoading ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
