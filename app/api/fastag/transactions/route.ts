import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const MOCK_TRANSACTIONS = [
  { id: 'TXN2026051001', dateTime: '2026-05-10 14:32', tollPlaza: 'Khalapur Toll Plaza', location: 'Mumbai-Pune Expressway, Maharashtra', amount: 115, balanceAfter: 1785, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050901', dateTime: '2026-05-09 09:18', tollPlaza: 'Sinhagad Road Toll', location: 'Pune, Maharashtra', amount: 75, balanceAfter: 1900, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050801', dateTime: '2026-05-08 18:45', tollPlaza: 'Vadape Toll', location: 'Mumbai-Nashik Highway, Maharashtra', amount: 90, balanceAfter: 1975, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050701', dateTime: '2026-05-07 11:22', tollPlaza: 'Talegaon Toll', location: 'Old Mumbai-Pune Highway, Maharashtra', amount: 55, balanceAfter: 2065, status: 'FAILED', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050601', dateTime: '2026-05-06 07:55', tollPlaza: 'Khed Shivapur Toll', location: 'NH48, Pune, Maharashtra', amount: 80, balanceAfter: 2120, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050501', dateTime: '2026-05-05 20:10', tollPlaza: 'Charoti Toll', location: 'NH48, Maharashtra-Gujarat Border', amount: 135, balanceAfter: 2200, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050401', dateTime: '2026-05-04 13:40', tollPlaza: 'Palaspe Toll', location: 'Mumbai-Goa Highway, Maharashtra', amount: 70, balanceAfter: 2335, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050301', dateTime: '2026-05-03 16:22', tollPlaza: 'Vashi Toll', location: 'Navi Mumbai, Maharashtra', amount: 40, balanceAfter: 2405, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050201', dateTime: '2026-05-02 08:05', tollPlaza: 'Airoli Toll', location: 'Thane-Belapur Road, Maharashtra', amount: 30, balanceAfter: 2445, status: 'SUCCESS', tagId: 'NETC10012345678901' },
  { id: 'TXN2026050101', dateTime: '2026-05-01 19:48', tollPlaza: 'Pune-Nashik Highway Toll', location: 'Chakan, Pune, Maharashtra', amount: 95, balanceAfter: 2475, status: 'SUCCESS', tagId: 'NETC10012345678901' },
];

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
  const isConfigured = !!(process.env.FASTAG_API_KEY && process.env.FASTAG_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.transactions.list',
      details: { vehicleNumber, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json({ transactions: MOCK_TRANSACTIONS, _mock: true, total: MOCK_TRANSACTIONS.length }, { status: 200 });
  }

  try {
    const queryParams = new URLSearchParams({ vehicleNumber });
    const response = await fetch(`${process.env.FASTAG_API_URL}/transactions?${queryParams.toString()}`, {
      headers: { 'x-api-key': process.env.FASTAG_API_KEY as string, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.transactions.list',
      details: { vehicleNumber },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[fastag/transactions]', error);
    return NextResponse.json({ transactions: MOCK_TRANSACTIONS, _mock: true, total: MOCK_TRANSACTIONS.length }, { status: 200 });
  }
}
