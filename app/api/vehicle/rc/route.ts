import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const MOCK_VEHICLES: Record<string, object> = {
  DEFAULT: {
    vehicleNumber: '',
    ownerName: 'Rajesh Kumar Sharma',
    rcStatus: 'ACTIVE',
    make: 'Tata',
    model: 'Nexon EV Max',
    fuelType: 'Electric',
    registrationDate: '15 Mar 2023',
    validUpto: '14 Mar 2038',
    insuranceValidUntil: '14 Mar 2027',
    fitnessValidUntil: '14 Mar 2026',
    emissionNorm: 'BSVI (EV)',
    stateRTO: 'Maharashtra — MH-12 (Pune)',
    color: 'Intensi-Teal',
    engineNumber: 'TEVMX23A004781',
    chassisNumber: 'MAT611791PEA04781',
    vehicleClass: 'M1 (Private Car)',
    _mock: true,
  },
};

const PRESETS: Record<string, Partial<typeof MOCK_VEHICLES['DEFAULT']>> = {
  'MH12AB1234': { vehicleNumber: 'MH12AB1234', ownerName: 'Rajesh Kumar Sharma', make: 'Tata', model: 'Nexon EV Max', fuelType: 'Electric', color: 'Intensi-Teal', rcStatus: 'ACTIVE' },
  'DL8CAB5678': { vehicleNumber: 'DL8CAB5678', ownerName: 'Priya Mehta', make: 'Maruti Suzuki', model: 'Swift Dzire', fuelType: 'Petrol', color: 'Silky Silver', rcStatus: 'ACTIVE', stateRTO: 'Delhi — DL-8C (Rohini)' },
  'KA03MN9012': { vehicleNumber: 'KA03MN9012', ownerName: 'Venkatesh Rao', make: 'Mahindra', model: 'Scorpio-N Z8L', fuelType: 'Diesel', color: 'Deep Forest', rcStatus: 'ACTIVE', stateRTO: 'Karnataka — KA-03 (Bangalore West)' },
  'TN09CD3456': { vehicleNumber: 'TN09CD3456', ownerName: 'Anand Subramanian', make: 'Hyundai', model: 'Creta', fuelType: 'Petrol', color: 'Atlas White', rcStatus: 'EXPIRED', stateRTO: 'Tamil Nadu — TN-09 (Chennai Central)' },
  'GJ01XX7890': { vehicleNumber: 'GJ01XX7890', ownerName: 'Hardik Patel', make: 'Ashok Leyland', model: '1215 HB Truck', fuelType: 'Diesel', color: 'Yellow', rcStatus: 'ACTIVE', vehicleClass: 'N2 (Goods Carrier)', stateRTO: 'Gujarat — GJ-01 (Ahmedabad)' },
};

function getMockData(vehicleNumber: string): object {
  const preset = PRESETS[vehicleNumber.toUpperCase()];
  const base = { ...MOCK_VEHICLES.DEFAULT };
  return { ...base, vehicleNumber: vehicleNumber.toUpperCase(), ...(preset || {}) };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');

  if (!vehicleNumber) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'vehicleNumber query parameter is required.' },
      { status: 400 }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isConfigured = !!(process.env.VAHAN_API_KEY && process.env.VAHAN_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.rc.lookup',
      details: { vehicleNumber, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json(getMockData(vehicleNumber), { status: 200 });
  }

  try {
    const response = await fetch(
      `${process.env.VAHAN_API_URL}?vehicleNumber=${encodeURIComponent(vehicleNumber)}`,
      { headers: { 'x-api-key': process.env.VAHAN_API_KEY as string, 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.rc.lookup',
      details: { vehicleNumber },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[vehicle/rc]', error);
    return NextResponse.json(getMockData(vehicleNumber), { status: 200 });
  }
}
