import { api } from './client';

export const vehicleApi = {
  lookupRC: (vehicleNumber: string) =>
    api.get<Record<string, unknown>>(`/api/vehicle/rc?vehicleNumber=${encodeURIComponent(vehicleNumber)}`),

  lookupDL: (licenseNumber: string) =>
    api.get<Record<string, unknown>>(`/api/vehicle/dl?licenseNumber=${encodeURIComponent(licenseNumber)}`),
};
