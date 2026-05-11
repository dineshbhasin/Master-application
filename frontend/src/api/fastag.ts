import { api } from './client';

export const fastagApi = {
  getBalance: (vehicleNumber: string) =>
    api.get<Record<string, unknown>>(`/api/fastag/balance?vehicleNumber=${encodeURIComponent(vehicleNumber)}`),

  getTransactions: (vehicleNumber: string) =>
    api.get<{ transactions: Record<string, unknown>[]; total: number }>(`/api/fastag/transactions?vehicleNumber=${encodeURIComponent(vehicleNumber)}`),
};
