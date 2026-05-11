import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const configError = checkApiConfig(['FASTAG_API_KEY', 'FASTAG_API_URL']);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message:
          'FASTag API credentials are not configured. Please add FASTAG_API_KEY and FASTAG_API_URL to your environment variables.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const limit = searchParams.get('limit') || '50';

  if (!vehicleNumber) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'vehicleNumber query parameter is required.' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const queryParams = new URLSearchParams({ vehicleNumber, limit });
  if (fromDate) queryParams.set('fromDate', fromDate);
  if (toDate) queryParams.set('toDate', toDate);

  try {
    const response = await fetch(
      `${process.env.FASTAG_API_URL}/transactions?${queryParams.toString()}`,
      {
        headers: {
          'x-api-key': process.env.FASTAG_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.transactions.list',
      details: { vehicleNumber, fromDate, toDate, limit },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[fastag/transactions]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.transactions.list',
      details: { vehicleNumber, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch FASTag transactions. Please try again.' },
      { status: 502 }
    );
  }
}
