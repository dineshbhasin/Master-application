import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

const MOCK_DATA: Record<string, object> = {
  'AIR-001': { trackingId: 'AIR-001', mode: 'air', status: 'IN_TRANSIT', origin: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport, Mumbai' }, destination: { code: 'DEL', name: 'Indira Gandhi International Airport, New Delhi' }, carrier: 'Air India Cargo', flightNumber: 'AI-9601', estimatedArrival: '11 May 2026 18:30', commodity: 'Pharmaceuticals (Temperature Controlled)', weightKg: 450, pieces: 18, timeline: [{ time: '11 May 2026 08:00', location: 'Mumbai', event: 'Shipment picked up', status: 'done' }, { time: '11 May 2026 11:45', location: 'BOM Airport', event: 'Security screening cleared', status: 'done' }, { time: '11 May 2026 13:20', location: 'BOM Airport', event: 'Loaded onto AI-9601 — departed', status: 'done' }, { time: '11 May 2026 15:40', location: 'In Transit', event: 'Aircraft airborne — ETA 18:30', status: 'active' }, { time: '11 May 2026 18:30', location: 'DEL Airport', event: 'Arrival and unloading', status: 'pending' }, { time: '12 May 2026 10:00', location: 'New Delhi', event: 'Final delivery', status: 'pending' }], _mock: true },
  'SEA-002': { trackingId: 'SEA-002', mode: 'sea', status: 'AT_PORT', origin: { code: 'INNSA', name: 'Nhava Sheva (JNPT), Mumbai' }, destination: { code: 'SGSIN', name: 'Port of Singapore' }, carrier: 'Maersk Line', vesselName: 'MSC Gülsün', estimatedArrival: '18 May 2026', commodity: 'Automotive Components', containerNumber: 'MSKU3456789', containerType: '40HC', weightKg: 22800, timeline: [{ time: '05 May 2026', location: 'JNPT', event: 'Container gate-in', status: 'done' }, { time: '08 May 2026', location: 'JNPT', event: 'Loaded on vessel — departed', status: 'done' }, { time: '18 May 2026', location: 'Singapore', event: 'Vessel arrival', status: 'pending' }], _mock: true },
  'RAIL-003': { trackingId: 'RAIL-003', mode: 'rail', status: 'IN_TRANSIT', origin: { code: 'NDLS', name: 'New Delhi Goods Shed' }, destination: { code: 'CSMT', name: 'Mumbai CST Goods Yard' }, carrier: 'Indian Railways FOIS', trainNumber: 'BCNA-14902', estimatedArrival: '12 May 2026 06:00', commodity: 'Coal (BOXN wagons)', weightTonne: 3200, wagons: 42, timeline: [{ time: '10 May 2026 22:00', location: 'New Delhi', event: 'Rake loaded and sealed', status: 'done' }, { time: '11 May 2026 10:45', location: 'Mathura Jn', event: 'Crew change — proceeding', status: 'done' }, { time: '11 May 2026 16:20', location: 'Kota Jn', event: 'Passing through — on schedule', status: 'active' }, { time: '12 May 2026 06:00', location: 'Mumbai CSMT', event: 'Arrival at goods yard', status: 'pending' }], _mock: true },
  'ROAD-004': { trackingId: 'ROAD-004', mode: 'road', status: 'IN_TRANSIT', origin: { code: 'AMD', name: 'Ahmedabad Logistics Hub' }, destination: { code: 'PUN', name: 'Pune Distribution Centre' }, carrier: 'VRL Logistics', vehicleNumber: 'GJ01XX7890', driverName: 'Hardik Patel', driverPhone: '+91 98765 43210', estimatedArrival: '12 May 2026 14:00', commodity: 'FMCG — Mixed Dry Goods', weightKg: 12400, currentLocation: 'NH48 near Vadodara', timeline: [{ time: '10 May 2026 20:00', location: 'Ahmedabad', event: 'Vehicle loaded — e-way bill generated', status: 'done' }, { time: '11 May 2026 09:15', location: 'Vadodara Bypass', event: 'Vehicle scanned at checkpoint', status: 'done' }, { time: '11 May 2026 11:45', location: 'Vadodara', event: 'Driver rest break', status: 'active' }, { time: '12 May 2026 14:00', location: 'Pune', event: 'Delivery at distribution centre', status: 'pending' }], _mock: true },
};

// GET /api/tracking/multimodal?trackingId=&mode=
router.get('/multimodal', requireAuth, async (req: Request, res: Response) => {
  const { trackingId, mode } = req.query;
  if (!trackingId || !mode) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'trackingId and mode are required.' });
    return;
  }
  if (!['air', 'sea', 'rail', 'road'].includes(mode as string)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'mode must be one of: air, sea, rail, road.' });
    return;
  }
  const modeKeys: Record<string, string[]> = {
    air: ['DGCA_API_KEY', 'DGCA_API_URL'], sea: ['ICEGATE_API_KEY', 'ICEGATE_API_URL'],
    rail: ['FOIS_API_KEY', 'FOIS_API_URL'], road: ['FASTAG_API_KEY', 'FASTAG_API_URL'],
  };
  const isConfigured = modeKeys[mode as string].every((k) => !!process.env[k]);
  if (!isConfigured) {
    const key = String(trackingId).toUpperCase();
    const found = Object.values(MOCK_DATA).find((d) => (d as Record<string, string>).trackingId === key);
    res.json(found || { trackingId: key, mode, status: 'IN_TRANSIT', origin: { name: 'Origin Hub' }, destination: { name: 'Destination Hub' }, estimatedArrival: '15 May 2026', timeline: [{ time: '11 May 2026', location: 'Transit', event: 'In transit', status: 'active' }], _mock: true });
    return;
  }
  try {
    const keys = modeKeys[mode as string];
    const r = await fetch(`${process.env[keys[1]]}/track?trackingId=${encodeURIComponent(String(trackingId))}&mode=${mode}`, {
      headers: { 'x-api-key': process.env[keys[0]] as string },
    });
    res.status(r.status).json(await r.json());
  } catch { res.status(503).json({ error: 'SERVICE_UNAVAILABLE' }); }
});

export default router;
