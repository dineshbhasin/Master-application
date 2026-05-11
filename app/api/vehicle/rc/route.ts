import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const configError = checkApiConfig(['VAHAN_API_KEY', 'VAHAN_API_URL']);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message:
          'Vahan API credentials are not configured. Please add VAHAN_API_KEY and VAHAN_API_URL to your environment variables.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');

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

  try {
    const response = await fetch(
      `${process.env.VAHAN_API_URL}?vehicleNumber=${encodeURIComponent(vehicleNumber)}`,
      {
        headers: {
          'x-api-key': process.env.VAHAN_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.rc.lookup',
      details: { vehicleNumber },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[vehicle/rc]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.rc.lookup',
      details: { vehicleNumber, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch vehicle RC data. Please try again.' },
      { status: 502 }
    );
  }
}
