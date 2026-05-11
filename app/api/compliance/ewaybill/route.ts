import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const configError = checkApiConfig(['EWAYBILL_API_KEY', 'EWAYBILL_API_URL']);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message:
          'E-Way Bill API credentials are not configured. Please add EWAYBILL_API_KEY and EWAYBILL_API_URL to your environment variables.',
      },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const isLookup = !!body.ewaybillNumber;
  const action = isLookup ? 'compliance.ewaybill.lookup' : 'compliance.ewaybill.generate';

  try {
    let apiPath = process.env.EWAYBILL_API_URL as string;
    if (isLookup) {
      apiPath = `${apiPath}/fetch`;
    } else {
      apiPath = `${apiPath}/generate`;
    }

    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.EWAYBILL_API_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action,
      details: isLookup
        ? { ewaybillNumber: body.ewaybillNumber }
        : { payload: body },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[compliance/ewaybill]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action,
      details: { error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to process E-Way Bill request. Please try again.' },
      { status: 502 }
    );
  }
}
