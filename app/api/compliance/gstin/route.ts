import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const configError = checkApiConfig(['GSTIN_API_KEY', 'GSTIN_API_URL']);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message:
          'GSTIN API credentials are not configured. Please add GSTIN_API_KEY and GSTIN_API_URL to your environment variables.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const gstin = searchParams.get('gstin');

  if (!gstin) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'gstin query parameter is required.' },
      { status: 400 }
    );
  }

  const normalizedGstin = gstin.toUpperCase().trim();
  if (!GSTIN_REGEX.test(normalizedGstin)) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid GSTIN format. GSTIN must be a 15-character alphanumeric string.',
      },
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
      `${process.env.GSTIN_API_URL}?gstin=${encodeURIComponent(normalizedGstin)}`,
      {
        headers: {
          'x-api-key': process.env.GSTIN_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'compliance.gstin.lookup',
      details: { gstin: normalizedGstin },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[compliance/gstin]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'compliance.gstin.lookup',
      details: { gstin: normalizedGstin, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch GSTIN data. Please try again.' },
      { status: 502 }
    );
  }
}
