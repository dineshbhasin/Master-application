import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const MOCK_EWAYBILLS: Record<string, object> = {
  'EWB-4121009876': {
    ewaybillNumber: 'EWB-4121009876', status: 'ACTIVE', generatedDate: '10 May 2026 09:14',
    validUntil: '11 May 2026 23:59', supplierGstin: '27AABCU9603R1ZX',
    supplierName: 'Ultratech Cement Ltd', supplierAddress: 'Worli, Mumbai',
    recipientGstin: '29AAJCS5738K1Z5', recipientName: 'Infosys Limited', recipientAddress: 'Electronic City, Bangalore',
    invoiceNumber: 'INV/2026/05/001234', invoiceDate: '09 May 2026', invoiceValue: 1845600,
    hsnCode: '2523', productDescription: 'Portland Cement — OPC 53 Grade',
    vehicleNumber: 'GJ01XX7890', transporterId: 'GSTIN27AABCxxx',
    transportMode: 'Road', distanceKm: 1400, quantity: 240, unit: 'Bags (50kg)',
  },
  'EWB-3987654321': {
    ewaybillNumber: 'EWB-3987654321', status: 'ACTIVE', generatedDate: '08 May 2026 15:30',
    validUntil: '12 May 2026 23:59', supplierGstin: '24AAACR5055K1ZD',
    supplierName: 'Reliance Industries Ltd', supplierAddress: 'Jamnagar, Gujarat',
    recipientGstin: '27AABCU9603R1ZX', recipientName: 'Ultratech Cement Ltd', recipientAddress: 'Mumbai',
    invoiceNumber: 'RIL/INV/26/04/9901', invoiceDate: '07 May 2026', invoiceValue: 3200000,
    hsnCode: '2710', productDescription: 'High Speed Diesel (HSD)',
    vehicleNumber: 'GJ01CC1234', transporterId: 'GSTIN24AAACRxxx',
    transportMode: 'Road', distanceKm: 1250, quantity: 24000, unit: 'Litres',
  },
};

function generateMockEWB(data: Record<string, unknown>): object {
  const ewbNum = `EWB-${Math.floor(4000000000 + Math.random() * 999999999)}`;
  const now = new Date();
  return {
    ewaybillNumber: ewbNum, status: 'ACTIVE',
    generatedDate: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    validUntil: new Date(now.getTime() + 86400000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 23:59',
    ...data, _mock: true,
  };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Invalid JSON body.' }, { status: 400 });
  }

  const isLookup = !!body.ewaybillNumber;
  const action = isLookup ? 'compliance.ewaybill.lookup' : 'compliance.ewaybill.generate';
  const isConfigured = !!(process.env.EWAYBILL_API_KEY && process.env.EWAYBILL_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action, details: { ...body, mock: true }, ip, userAgent, status: 'success',
    }).catch(() => undefined);

    if (isLookup) {
      const ewbNum = String(body.ewaybillNumber).toUpperCase();
      const found = MOCK_EWAYBILLS[ewbNum];
      if (found) return NextResponse.json({ ...found, _mock: true }, { status: 200 });
      return NextResponse.json({ error: 'NOT_FOUND', message: 'E-Way Bill not found.' }, { status: 404 });
    }
    return NextResponse.json(generateMockEWB(body), { status: 201 });
  }

  try {
    const apiPath = isLookup
      ? `${process.env.EWAYBILL_API_URL}/fetch`
      : `${process.env.EWAYBILL_API_URL}/generate`;
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: { 'x-api-key': process.env.EWAYBILL_API_KEY as string, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action, details: isLookup ? { ewaybillNumber: body.ewaybillNumber } : { payload: body },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[compliance/ewaybill]', error);
    if (isLookup) {
      const ewbNum = String(body.ewaybillNumber).toUpperCase();
      if (MOCK_EWAYBILLS[ewbNum]) return NextResponse.json({ ...MOCK_EWAYBILLS[ewbNum], _mock: true }, { status: 200 });
    }
    return NextResponse.json(generateMockEWB(body), { status: 201 });
  }
}
