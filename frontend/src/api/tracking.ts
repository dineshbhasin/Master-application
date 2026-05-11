import { api } from './client';

export type TrackingMode = 'air' | 'sea' | 'rail' | 'road';

export const trackingApi = {
  track: (trackingId: string, mode: TrackingMode) =>
    api.get<Record<string, unknown>>(`/api/tracking/multimodal?trackingId=${encodeURIComponent(trackingId)}&mode=${mode}`),
};
