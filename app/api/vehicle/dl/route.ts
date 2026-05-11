import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const configError = checkApiConfig(['SARATHI_API_KEY', 'SARATHI_API_URL']);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message:
          'Sarathi API credentials are not configured. Please add SARATHI_API_KEY and SARATHI_API_URL to your environment variables.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const licenseNumber = searchParams.get('licenseNumber');

  if (!licenseNumber) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'licenseNumber query parameter is required.' },
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
      `${process.env.SARATHI_API_URL}?licenseNumber=${encodeURIComponent(licenseNumber)}`,
      {
        headers: {
          'x-api-key': process.env.SARATHI_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.dl.lookup',
      details: { licenseNumber },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[vehicle/dl]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.dl.lookup',
      details: { licenseNumber, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch driving license data. Please try again.' },
      { status: 502 }
    );
  }
}
