import { api } from './client';

export interface OrgModules {
  vehicleIntel: boolean; fastag: boolean; compliance: boolean; tracking: boolean;
  routePlanner: boolean; exim: boolean; identity: boolean; esgTracker: boolean; railLogistics: boolean;
}

export interface Organization {
  id: string; name: string; domain: string; tier: string; status: string;
  adminEmail: string; apiCalls30d?: number; dataRegion: string; modules: OrgModules;
  createdAt?: string;
}

export interface AdminUser {
  _id: string; name: string; email: string; role: string; organization?: string;
  isVerified: boolean; totpEnabled: boolean; lastLogin?: string; createdAt: string;
}

export interface AuditEntry {
  _id: string; actor: string; actorEmail: string; action: string; module: string;
  target?: string; status: string; hash: string; prevHash: string; createdAt: string;
  details?: Record<string, unknown>;
}

export interface ErasureRequest {
  id: string; userEmail: string; userName: string; reason: string;
  dataCategories: string[]; status: string; requestedAt: string;
  reviewedAt?: string; anonymizedAt?: string;
}

export interface ApiKeyRecord {
  id: string; organizationName: string; keyPrefix: string; label: string;
  scopes: string[]; callsTotal: number; callsLast30d: number;
  lastUsedAt?: string; isRevoked: boolean; createdAt: string;
}

export interface NodeInfo {
  id: string; name: string; ministry: string; endpoint: string;
  latencyMs: number; status: 'operational' | 'degraded' | 'down';
  uptime30d: number; lastChecked: string;
  incidents: { date: string; duration: string; description: string }[];
}

export const adminApi = {
  // 2FA
  setup2FA:  () => api.post<{ secret: string; otpauthUrl: string }>('/admin/2fa/setup', {}),
  verify2FA: (token: string) => api.post<{ token: string }>('/admin/2fa/verify', { token }),

  // Analytics
  getOverview:  () => api.get<{ apiCalls24h: number; apiCalls30d: number; successRate: number; errorRate: number; activeOrgs: number; pendingErasures: number; anomalyAlerts: number; _mock?: boolean }>('/admin/analytics/overview'),
  getTrendline:  (period: '24h' | '7d' | '30d') => api.get<{ enterprise: { date: string; value: number }[]; citizen: { date: string; value: number }[]; _mock?: boolean }>(`/admin/analytics/trendline?period=${period}`),
  getModules:   () => api.get<{ modules: { name: string; calls: number; errors: number }[]; _mock?: boolean }>('/admin/analytics/modules'),

  // Node health
  getNodeHealth: () => api.get<{ nodes: NodeInfo[]; summary: { operational: number; degraded: number; down: number }; checkedAt: string }>('/admin/node-health'),

  // Organizations
  getOrganizations: (params?: { search?: string; tier?: string; status?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ organizations: Organization[]; total: number; _mock?: boolean }>(`/admin/organizations${q ? `?${q}` : ''}`);
  },
  updateModules:   (id: string, modules: OrgModules) => api.patch<{ success: boolean }>(`/admin/organizations/${id}/modules`, { modules }),
  updateOrgStatus: (id: string, status: string) => api.patch<{ success: boolean }>(`/admin/organizations/${id}/status`, { status }),
  createOrg:       (data: { name: string; domain: string; tier: string; adminEmail: string }) => api.post<{ organization: Organization }>('/admin/organizations', data),

  // Users
  getUsers:   (params?: { search?: string; role?: string; page?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ users: AdminUser[]; total: number; page: number; pages: number }>(`/admin/users${q ? `?${q}` : ''}`);
  },
  updateRole: (id: string, role: string, totpToken: string) => api.patch<{ success: boolean }>(`/admin/users/${id}/role`, { role, totpToken }),

  // Audit trail
  getAuditTrail: (params?: { action?: string; actor?: string; from?: string; to?: string; page?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ logs: AuditEntry[]; total: number; page: number; pages: number }>(`/admin/audit-trail${q ? `?${q}` : ''}`);
  },
  verifyChain: () => api.get<{ chainIntact: boolean; logsChecked: number; brokenAt?: string }>('/admin/audit-trail/verify'),

  // DPDP
  getErasureRequests: (status?: string) => api.get<{ requests: ErasureRequest[]; total: number; _mock?: boolean }>(`/admin/dpdp${status ? `?status=${status}` : ''}`),
  approveErasure:     (id: string, totpToken: string, note?: string) => api.post<{ success: boolean; message: string }>(`/admin/dpdp/${id}/approve`, { totpToken, note }),
  rejectErasure:      (id: string, reason: string) => api.post<{ success: boolean }>(`/admin/dpdp/${id}/reject`, { reason }),
  exportData:         (requestId: string, userId: string) => api.post<{ exportId: string; downloadUrl: string; expiresAt: string }>(`/admin/dpdp/${requestId}/export`, { userId }),

  // API Keys
  getApiKeys:   () => api.get<{ keys: ApiKeyRecord[]; total: number; _mock?: boolean }>('/admin/api-keys'),
  generateKey:  (data: { organizationId: string; organizationName: string; label?: string; scopes?: string[] }) => api.post<{ key: string; keyPrefix: string; message: string }>('/admin/api-keys', data),
  rotateKey:    (id: string, totpToken: string) => api.post<{ key: string; keyPrefix: string }>(`/admin/api-keys/${id}/rotate`, { totpToken }),
  revokeKey:    (id: string) => api.delete<{ success: boolean }>(`/admin/api-keys/${id}`),
};
