import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import { checkApiConfig } from '../../../../lib/utils';
import AuditLog from '../../../../models/AuditLog';

type TrackingMode = 'air' | 'sea' | 'rail' | 'road';

const modeConfig: Record<TrackingMode, { keys: string[]; urlKey: string; apiKeyKey: string }> = {
  air: {
    keys: ['DGCA_API_KEY', 'DGCA_API_URL'],
    urlKey: 'DGCA_API_URL',
    apiKeyKey: 'DGCA_API_KEY',
  },
  sea: {
    keys: ['ICEGATE_API_KEY', 'ICEGATE_API_URL'],
    urlKey: 'ICEGATE_API_URL',
    apiKeyKey: 'ICEGATE_API_KEY',
  },
  rail: {
    keys: ['FOIS_API_KEY', 'FOIS_API_URL'],
    urlKey: 'FOIS_API_URL',
    apiKeyKey: 'FOIS_API_KEY',
  },
  road: {
    keys: ['FASTAG_API_KEY', 'FASTAG_API_URL'],
    urlKey: 'FASTAG_API_URL',
    apiKeyKey: 'FASTAG_API_KEY',
  },
};

const modeNames: Record<TrackingMode, string> = {
  air: 'DGCA',
  sea: 'ICEGATE',
  rail: 'FOIS',
  road: 'FASTag',
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('trackingId');
  const mode = searchParams.get('mode') as TrackingMode | null;

  if (!trackingId || !mode) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'trackingId and mode query parameters are required.' },
      { status: 400 }
    );
  }

  const validModes: TrackingMode[] = ['air', 'sea', 'rail', 'road'];
  if (!validModes.includes(mode)) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'mode must be one of: air, sea, rail, road.' },
      { status: 400 }
    );
  }

  const config = modeConfig[mode];
  const configError = checkApiConfig(config.keys);
  if (configError) {
    return NextResponse.json(
      {
        error: 'API_NOT_CONFIGURED',
        message: `${modeNames[mode]} API credentials are not configured. Please add ${config.keys.join(' and ')} to your environment variables.`,
      },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const apiUrl = process.env[config.urlKey] as string;
    const apiKey = process.env[config.apiKeyKey] as string;

    const response = await fetch(
      `${apiUrl}/track?trackingId=${encodeURIComponent(trackingId)}&mode=${mode}`,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: `tracking.${mode}.lookup`,
      details: { trackingId, mode },
      ip,
      userAgent,
      status: response.ok ? 'success' : 'failure',
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[tracking/multimodal]', error);

    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: `tracking.${mode}.lookup`,
      details: { trackingId, mode, error: String(error) },
      ip,
      userAgent,
      status: 'failure',
    }).catch(() => undefined);

    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Failed to fetch tracking data. Please try again.' },
      { status: 502 }
    );
  }
}
