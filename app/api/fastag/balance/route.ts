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
  const tagId = searchParams.get('tagId');

  if (!vehicleNumber && !tagId) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Either vehicleNumber or tagId query parameter is required.' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const queryParams = new URLSearchParams();
  if (vehicleNumber) queryParams.set('vehicleNumber', vehicleNumber);
  if (tagId) queryParams.set('tagId', tagId);

  try {
    const response = await fetch(`${process.env.FASTAG_API_URL}/balance?${queryParams.toString()}`, {
      headers: {
        'x-api-key': process.env.FASTAG_API_KEY as string,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.balance.check',
      details: { vehicleNumber, tagId },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[fastag/balance]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'fastag.balance.check',
      details: { vehicleNumber, tagId, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch FASTag balance. Please try again.' },
      { status: 502 }
    );
  }
}
