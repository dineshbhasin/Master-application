import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const MOCK_LICENSES: Record<string, object> = {
  DEFAULT: {
    licenseNumber: '',
    name: 'Rajesh Kumar Sharma',
    dob: '14 Aug 1988',
    dlStatus: 'ACTIVE',
    validUntil: '13 Aug 2043',
    issuedDate: '14 Aug 2023',
    licenseClasses: ['LMV', 'MCWG'],
    issuingRTO: 'MH-12 Pune',
    hazardousGoods: false,
    hillDriving: false,
    _mock: true,
  },
};

const PRESETS: Record<string, object> = {
  'MH1220230012345': { licenseNumber: 'MH1220230012345', name: 'Rajesh Kumar Sharma', dob: '14 Aug 1988', dlStatus: 'ACTIVE', validUntil: '13 Aug 2043', licenseClasses: ['LMV', 'MCWG'], issuingRTO: 'MH-12 Pune' },
  'DL0420190054321': { licenseNumber: 'DL0420190054321', name: 'Priya Mehta', dob: '22 Mar 1995', dlStatus: 'ACTIVE', validUntil: '21 Mar 2035', licenseClasses: ['LMV'], issuingRTO: 'DL-04 Saket', hazardousGoods: false },
  'KA0120181122334': { licenseNumber: 'KA0120181122334', name: 'Venkatesh Rao', dob: '05 Jun 1980', dlStatus: 'ACTIVE', validUntil: '04 Jun 2038', licenseClasses: ['LMV', 'HMV', 'HGMV'], issuingRTO: 'KA-01 Bangalore Central', hazardousGoods: true, hillDriving: true },
  'TN0920150078965': { licenseNumber: 'TN0920150078965', name: 'Anand Subramanian', dob: '30 Nov 1990', dlStatus: 'EXPIRED', validUntil: '29 Nov 2025', licenseClasses: ['LMV', 'MCWG'], issuingRTO: 'TN-09 Chennai' },
};

function getMockData(licenseNumber: string): object {
  const preset = PRESETS[licenseNumber.toUpperCase()];
  return { ...MOCK_LICENSES.DEFAULT, licenseNumber: licenseNumber.toUpperCase(), ...(preset || {}) };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const licenseNumber = searchParams.get('licenseNumber');

  if (!licenseNumber) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'licenseNumber query parameter is required.' },
      { status: 400 }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isConfigured = !!(process.env.SARATHI_API_KEY && process.env.SARATHI_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.dl.lookup',
      details: { licenseNumber, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json(getMockData(licenseNumber), { status: 200 });
  }

  try {
    const response = await fetch(
      `${process.env.SARATHI_API_URL}?licenseNumber=${encodeURIComponent(licenseNumber)}`,
      { headers: { 'x-api-key': process.env.SARATHI_API_KEY as string, 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'vehicle.dl.lookup',
      details: { licenseNumber },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[vehicle/dl]', error);
    return NextResponse.json(getMockData(licenseNumber), { status: 200 });
  }
}
