import { api } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'sme' | 'enterprise' | 'official' | 'super_admin';
  organization?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; phone?: string; organization?: string; role?: string }) =>
    api.post<AuthResponse>('/api/auth/register', data),

  me: () => api.get<User>('/api/auth/me'),
};
