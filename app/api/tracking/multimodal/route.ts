import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

type TrackingMode = 'air' | 'sea' | 'rail' | 'road';

const MOCK_DATA: Record<string, object> = {
  'AIR-001': {
    trackingId: 'AIR-001', mode: 'air', status: 'IN_TRANSIT',
    origin: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport, Mumbai', country: 'India' },
    destination: { code: 'DEL', name: 'Indira Gandhi International Airport, New Delhi', country: 'India' },
    carrier: 'Air India Cargo', flightNumber: 'AI-9601',
    estimatedArrival: '11 May 2026 18:30', commodity: 'Pharmaceuticals (Temperature Controlled)',
    weightKg: 450, pieces: 18,
    timeline: [
      { time: '11 May 2026 08:00', location: 'Mumbai', event: 'Shipment picked up from warehouse', status: 'done' },
      { time: '11 May 2026 11:45', location: 'BOM Airport', event: 'Security screening completed — cleared', status: 'done' },
      { time: '11 May 2026 13:20', location: 'BOM Airport', event: 'Loaded onto AI-9601 — departed', status: 'done' },
      { time: '11 May 2026 15:40', location: 'In Transit', event: 'Aircraft airborne — estimated arrival 18:30', status: 'active' },
      { time: '11 May 2026 18:30', location: 'DEL Airport', event: 'Arrival and unloading', status: 'pending' },
      { time: '11 May 2026 20:00', location: 'DEL Airport', event: 'Customs clearance', status: 'pending' },
      { time: '12 May 2026 10:00', location: 'New Delhi', event: 'Final delivery', status: 'pending' },
    ],
    _mock: true,
  },
  'SEA-002': {
    trackingId: 'SEA-002', mode: 'sea', status: 'AT_PORT',
    origin: { code: 'INNSA', name: 'Nhava Sheva (JNPT), Mumbai', country: 'India' },
    destination: { code: 'SGSIN', name: 'Port of Singapore', country: 'Singapore' },
    carrier: 'Maersk Line', vesselName: 'MSC Gülsün', voyageNumber: 'VOY-26-AE-5',
    estimatedArrival: '18 May 2026', commodity: 'Automotive Components', containerNumber: 'MSKU3456789',
    containerType: '40HC', weightKg: 22800,
    timeline: [
      { time: '05 May 2026 09:00', location: 'Nhava Sheva JNPT', event: 'Container gate-in at terminal', status: 'done' },
      { time: '06 May 2026 14:00', location: 'Nhava Sheva JNPT', event: 'Customs export cleared — let export order issued', status: 'done' },
      { time: '08 May 2026 06:00', location: 'Nhava Sheva JNPT', event: 'Container loaded on vessel MSC Gülsün', status: 'done' },
      { time: '08 May 2026 18:00', location: 'Arabian Sea', event: 'Vessel departed — ETA Singapore 18 May', status: 'done' },
      { time: '18 May 2026', location: 'Port of Singapore', event: 'Vessel arrival', status: 'pending' },
      { time: '19 May 2026', location: 'Port of Singapore', event: 'Import customs clearance', status: 'pending' },
    ],
    _mock: true,
  },
  'RAIL-003': {
    trackingId: 'RAIL-003', mode: 'rail', status: 'IN_TRANSIT',
    origin: { code: 'NDLS', name: 'New Delhi Goods Shed', country: 'India' },
    destination: { code: 'CSMT', name: 'Mumbai CST Goods Yard', country: 'India' },
    carrier: 'Indian Railways FOIS', trainNumber: 'BCNA-14902',
    estimatedArrival: '12 May 2026 06:00', commodity: 'Coal (BOXN wagons)', weightTonne: 3200,
    wagons: 42,
    timeline: [
      { time: '10 May 2026 22:00', location: 'New Delhi', event: 'Rake loaded and sealed', status: 'done' },
      { time: '11 May 2026 02:30', location: 'New Delhi', event: 'Train departed on CR Main Line', status: 'done' },
      { time: '11 May 2026 10:45', location: 'Mathura Jn', event: 'Crew change — train proceeding', status: 'done' },
      { time: '11 May 2026 16:20', location: 'Kota Jn', event: 'Passing through — on schedule', status: 'active' },
      { time: '12 May 2026 01:00', location: 'Vasai Road', event: 'Entry to Mumbai division', status: 'pending' },
      { time: '12 May 2026 06:00', location: 'Mumbai CSMT', event: 'Arrival at goods yard', status: 'pending' },
    ],
    _mock: true,
  },
  'ROAD-004': {
    trackingId: 'ROAD-004', mode: 'road', status: 'IN_TRANSIT',
    origin: { code: 'AMD', name: 'Ahmedabad Logistics Hub', country: 'India' },
    destination: { code: 'PUN', name: 'Pune Distribution Centre', country: 'India' },
    carrier: 'VRL Logistics', vehicleNumber: 'GJ01XX7890', driverName: 'Hardik Patel',
    driverPhone: '+91 98765 43210',
    estimatedArrival: '12 May 2026 14:00', commodity: 'FMCG — Mixed Dry Goods',
    weightKg: 12400, currentLocation: 'NH48 near Vadodara',
    lastLocationUpdate: '11 May 2026 11:45',
    timeline: [
      { time: '10 May 2026 20:00', location: 'Ahmedabad', event: 'Vehicle loaded — e-way bill generated', status: 'done' },
      { time: '11 May 2026 06:30', location: 'Charoti Toll', event: 'Toll deducted via FASTag — ₹135', status: 'done' },
      { time: '11 May 2026 09:15', location: 'Vadodara Bypass', event: 'Vehicle scanned at checkpoint', status: 'done' },
      { time: '11 May 2026 11:45', location: 'Vadodara', event: 'Short halt — driver rest break', status: 'active' },
      { time: '11 May 2026 15:00', location: 'Surat', event: 'Expected toll — Surat Bypass', status: 'pending' },
      { time: '12 May 2026 06:00', location: 'Mumbai Bypass', event: 'Expected toll — Khalapur', status: 'pending' },
      { time: '12 May 2026 14:00', location: 'Pune', event: 'Delivery at distribution centre', status: 'pending' },
    ],
    _mock: true,
  },
};

function getMockData(trackingId: string, mode: string): object {
  const found = Object.values(MOCK_DATA).find(
    (d) => (d as Record<string, string>).trackingId === trackingId.toUpperCase() ||
            (d as Record<string, string>).trackingId === trackingId
  );
  if (found) return found;
  return {
    trackingId, mode, status: 'IN_TRANSIT',
    origin: { code: 'ORG', name: 'Origin Hub', country: 'India' },
    destination: { code: 'DST', name: 'Destination Hub', country: 'India' },
    estimatedArrival: '15 May 2026', commodity: 'General Cargo',
    timeline: [
      { time: '10 May 2026 10:00', location: 'Origin', event: 'Shipment dispatched', status: 'done' },
      { time: '11 May 2026 12:00', location: 'Transit Hub', event: 'In transit', status: 'active' },
      { time: '15 May 2026', location: 'Destination', event: 'Expected delivery', status: 'pending' },
    ],
    _mock: true,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('trackingId');
  const mode = searchParams.get('mode') as TrackingMode | null;

  if (!trackingId || !mode) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'trackingId and mode query parameters are required.' }, { status: 400 });
  }
  if (!['air', 'sea', 'rail', 'road'].includes(mode)) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'mode must be one of: air, sea, rail, road.' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const modeKeys: Record<string, string[]> = {
    air: ['DGCA_API_KEY', 'DGCA_API_URL'],
    sea: ['ICEGATE_API_KEY', 'ICEGATE_API_URL'],
    rail: ['FOIS_API_KEY', 'FOIS_API_URL'],
    road: ['FASTAG_API_KEY', 'FASTAG_API_URL'],
  };
  const keys = modeKeys[mode];
  const isConfigured = keys.every((k) => !!process.env[k]);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: `tracking.${mode}.lookup`,
      details: { trackingId, mode, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json(getMockData(trackingId, mode), { status: 200 });
  }

  try {
    const urlKey = keys[1];
    const apiKeyKey = keys[0];
    const response = await fetch(`${process.env[urlKey]}/track?trackingId=${encodeURIComponent(trackingId)}&mode=${mode}`, {
      headers: { 'x-api-key': process.env[apiKeyKey] as string, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: `tracking.${mode}.lookup`,
      details: { trackingId, mode },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[tracking/multimodal]', error);
    return NextResponse.json(getMockData(trackingId, mode), { status: 200 });
  }
}
