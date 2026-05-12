import React, { useState, useEffect, useCallback } from 'react';
import { platformApi, ActivityLog, ActivityStats } from '../../../api/platform';
import { useBreakpoint } from '../../../hooks/useBreakpoint';

type ViewMode = 'all' | 'user' | 'api';

const statusColor: Record<string, string> = {
  success: '#10B981',
  failure: '#EF4444',
  warning: '#F59E0B',
};

export default function AdminActivity() {
  const { isMobile } = useBreakpoint();
  const [logs, setLogs]       = useState<ActivityLog[]>([]);
  const [stats, setStats]     = useState<ActivityStats | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [view, setView]     = useState<ViewMode>('all');
  const [search, setSearch] = useState('');
  const [mod, setMod]       = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom]     = useState('');
  const [to, setTo]         = useState('');

  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformApi.getActivity({
        view,
        search: search || undefined,
        module: mod || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 50,
      });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setModules(data.modules || []);
    } catch {
      setError('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  }, [view, search, mod, status, from, to, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    platformApi.getActivityStats().then(setStats).catch(() => {});
  }, []);

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ padding: isMobile ? '0' : '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A2342', margin: 0 }}>Activity Log</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Full audit trail of user and API activity across the platform</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Events', value: stats.total.toLocaleString(), color: '#3B82F6' },
            { label: 'Last 24 Hours', value: stats.last24h.toLocaleString(), color: '#10B981' },
            { label: 'Failures', value: stats.failures.toLocaleString(), color: '#EF4444' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['all', 'user', 'api'] as ViewMode[]).map((v) => (
          <button key={v} onClick={() => { setView(v); setPage(1); }}
            style={{ padding: '7px 20px', borderRadius: 7, border: 'none', background: view === v ? 'white' : 'transparent', color: view === v ? '#0A2342' : '#6B7280', fontWeight: view === v ? 700 : 500, fontSize: 13, cursor: 'pointer', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', textTransform: 'capitalize' }}>
            {v === 'all' ? 'All Events' : v === 'user' ? 'User Activity' : 'API Events'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search actor, action, target…"
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none' }}
        />
        <select value={mod} onChange={(e) => { setMod(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }}>
          <option value="">All modules</option>
          {modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="warning">Warning</option>
        </select>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }} />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }} />
        {(search || mod || status || from || to) && (
          <button onClick={() => { setSearch(''); setMod(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>
            Clear
          </button>
        )}
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#9CA3AF' }}>{total.toLocaleString()} events</span>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}

      {/* Log table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
        )}
        {!loading && logs.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No activity found.</div>
        )}
        {!loading && logs.map((log, idx) => (
          <div key={log._id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <div
              onClick={() => setExpanded(expanded === log._id ? null : log._id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Status dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[log.status || 'success'] || '#D1D5DB', flexShrink: 0 }} />

              {/* Action + module */}
              <div style={{ flex: '0 0 220px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{log.action}</span>
                {log.module && (
                  <span style={{ marginLeft: 8, fontSize: 10, background: '#EFF6FF', color: '#3B82F6', padding: '2px 6px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>{log.module}</span>
                )}
              </div>

              {/* Actor */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {log.actorEmail || log.actor}
                </p>
              </div>

              {/* Target */}
              {log.target && (
                <div style={{ flex: '0 0 160px' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>→ {log.target}</p>
                </div>
              )}

              {/* Time */}
              <div style={{ flex: '0 0 150px', textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatTime(log.createdAt)}</span>
              </div>

              {/* Expand chevron */}
              <span style={{ color: '#D1D5DB', fontSize: 14, transform: expanded === log._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </div>

            {/* Expanded details */}
            {expanded === log._id && (
              <div style={{ padding: '12px 40px 16px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 24px' }}>
                  {[
                    { k: 'Actor ID', v: log.actor },
                    { k: 'IP', v: log.ip || '—' },
                    { k: 'Status', v: log.status || 'success' },
                    { k: 'Target', v: log.target || '—' },
                  ].map(({ k, v }) => (
                    <div key={k}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>{k}</span>
                      <p style={{ fontSize: 12, color: '#374151', margin: '2px 0 0', wordBreak: 'break-all' }}>{v}</p>
                    </div>
                  ))}
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Details</span>
                    <pre style={{ fontSize: 11, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginTop: 4, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: page === 1 ? '#D1D5DB' : '#374151', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}>
            ← Prev
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#6B7280' }}>Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: page === pages ? '#D1D5DB' : '#374151', cursor: page === pages ? 'default' : 'pointer', fontSize: 13 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
