import { api } from './client';

export interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  actor: string;
  actorEmail: string;
  action: string;
  module: string;
  target?: string;
  status?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export interface ActivityStats {
  total: number;
  last24h: number;
  failures: number;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const platformApi = {
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    api.get<{ users: PlatformUser[]; total: number; page: number; pages: number }>(
      `/api/platform/users${buildQuery(params as Record<string, string | number | undefined> || {})}`
    ),

  updateUserRole: (id: string, role: string) =>
    api.patch<{ success: boolean; user: PlatformUser }>(`/api/platform/users/${id}/role`, { role }),

  deleteUser: (id: string) =>
    api.delete<{ success: boolean }>(`/api/platform/users/${id}`),

  getActivity: (params?: {
    view?: string;
    search?: string;
    module?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ logs: ActivityLog[]; total: number; page: number; pages: number; modules: string[] }>(
      `/api/platform/activity${buildQuery(params as Record<string, string | number | undefined> || {})}`
    ),

  getActivityStats: () =>
    api.get<ActivityStats>('/api/platform/activity/stats'),
};
