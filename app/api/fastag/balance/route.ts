import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const PRESETS: Record<string, object> = {
  'MH12AB1234': { vehicleNumber: 'MH12AB1234', tagId: 'NETC10012345678901', balance: 1785.50, tagStatus: 'ACTIVE', bankName: 'HDFC Bank', lastRechargeDate: '05 May 2026', lastRechargeAmount: 500, vehicleClass: 'Car / Jeep / Van', issuedDate: '12 Jan 2022' },
  'DL8CAB5678': { vehicleNumber: 'DL8CAB5678', tagId: 'NETC10098765432109', balance: 145.00, tagStatus: 'LOW_BALANCE', bankName: 'ICICI Bank', lastRechargeDate: '28 Apr 2026', lastRechargeAmount: 300, vehicleClass: 'Car / Jeep / Van', issuedDate: '03 Aug 2021' },
  'KA03MN9012': { vehicleNumber: 'KA03MN9012', tagId: 'NETC10045678901234', balance: 3200.00, tagStatus: 'ACTIVE', bankName: 'SBI', lastRechargeDate: '02 May 2026', lastRechargeAmount: 1000, vehicleClass: 'SUV (Upto 12 seats)', issuedDate: '19 Mar 2023' },
  'GJ01XX7890': { vehicleNumber: 'GJ01XX7890', tagId: 'NETC10078901234567', balance: 8450.75, tagStatus: 'ACTIVE', bankName: 'Axis Bank', lastRechargeDate: '09 May 2026', lastRechargeAmount: 5000, vehicleClass: 'Truck (3-Axle)', issuedDate: '22 Jun 2020' },
};

function getMockData(vehicleNumber: string): object {
  const vn = vehicleNumber.toUpperCase();
  if (PRESETS[vn]) return { ...PRESETS[vn], _mock: true };
  return {
    vehicleNumber: vn,
    tagId: 'NETC10099887766554',
    balance: 620.00,
    tagStatus: 'ACTIVE',
    bankName: 'Paytm Payments Bank',
    lastRechargeDate: '01 May 2026',
    lastRechargeAmount: 500,
    vehicleClass: 'Car / Jeep / Van',
    issuedDate: '10 Feb 2023',
    _mock: true,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');
  const tagId = searchParams.get('tagId');

  if (!vehicleNumber && !tagId) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Either vehicleNumber or tagId query parameter is required.' },
      { status: 400 }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isConfigured = !!(process.env.FASTAG_API_KEY && process.env.FASTAG_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.balance.check',
      details: { vehicleNumber, tagId, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json(getMockData(vehicleNumber || tagId || ''), { status: 200 });
  }

  try {
    const queryParams = new URLSearchParams();
    if (vehicleNumber) queryParams.set('vehicleNumber', vehicleNumber);
    if (tagId) queryParams.set('tagId', tagId);
    const response = await fetch(`${process.env.FASTAG_API_URL}/balance?${queryParams.toString()}`, {
      headers: { 'x-api-key': process.env.FASTAG_API_KEY as string, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.balance.check',
      details: { vehicleNumber, tagId },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[fastag/balance]', error);
    return NextResponse.json(getMockData(vehicleNumber || tagId || ''), { status: 200 });
  }
}
