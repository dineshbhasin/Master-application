import { api } from './client';

export const complianceApi = {
  lookupGSTIN: (gstin: string) =>
    api.get<Record<string, unknown>>(`/api/compliance/gstin?gstin=${encodeURIComponent(gstin)}`),

  lookupEWB: (ewaybillNumber: string) =>
    api.post<Record<string, unknown>>('/api/compliance/ewaybill', { ewaybillNumber }),

  generateEWB: (payload: Record<string, unknown>) =>
    api.post<Record<string, unknown>>('/api/compliance/ewaybill', payload),
};
