import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const MOCK_GSTIN: Record<string, object> = {
  '27AABCU9603R1ZX': {
    gstin: '27AABCU9603R1ZX', legalName: 'Ultratech Cement Limited', tradeName: 'Ultratech Cement',
    status: 'ACTIVE', registrationDate: '01 Jul 2017', stateCode: '27', state: 'Maharashtra',
    businessType: 'Public Limited Company', taxpayerType: 'Regular',
    address: 'B Wing, Century Bhavan, Dr Annie Besant Road, Worli, Mumbai - 400030',
    lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED',
    panNumber: 'AABCU9603R',
  },
  '29AAJCS5738K1Z5': {
    gstin: '29AAJCS5738K1Z5', legalName: 'Infosys Limited', tradeName: 'Infosys',
    status: 'ACTIVE', registrationDate: '01 Jul 2017', stateCode: '29', state: 'Karnataka',
    businessType: 'Public Limited Company', taxpayerType: 'Regular',
    address: 'Electronics City, Hosur Road, Bangalore - 560100',
    lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED',
    panNumber: 'AAJCS5738K',
  },
  '24AAACR5055K1ZD': {
    gstin: '24AAACR5055K1ZD', legalName: 'Reliance Industries Limited', tradeName: 'Reliance',
    status: 'ACTIVE', registrationDate: '01 Jul 2017', stateCode: '24', state: 'Gujarat',
    businessType: 'Public Limited Company', taxpayerType: 'Regular',
    address: 'Maker Chambers IV, 3rd Floor, 222 Nariman Point, Mumbai - 400021',
    lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED',
    panNumber: 'AAACR5055K',
  },
};

function getMockData(gstin: string): object {
  if (MOCK_GSTIN[gstin]) return { ...MOCK_GSTIN[gstin], _mock: true };
  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);
  return {
    gstin, legalName: 'Sunrise Logistics Pvt Ltd', tradeName: 'Sunrise Logistics',
    status: 'ACTIVE', registrationDate: '15 Aug 2018', stateCode, state: 'India',
    businessType: 'Private Limited Company', taxpayerType: 'Regular',
    address: 'Plot 47, Industrial Area Phase II, Chandigarh - 160002',
    lastFilingDate: '18 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED',
    panNumber: pan, _mock: true,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const gstin = searchParams.get('gstin');

  if (!gstin) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'gstin query parameter is required.' }, { status: 400 });
  }

  const normalizedGstin = gstin.toUpperCase().trim();
  if (!GSTIN_REGEX.test(normalizedGstin)) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Invalid GSTIN format. GSTIN must be a 15-character alphanumeric string.' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isConfigured = !!(process.env.GSTIN_API_KEY && process.env.GSTIN_API_URL);

  if (!isConfigured) {
    await connectDB().catch(() => undefined);
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'compliance.gstin.lookup',
      details: { gstin: normalizedGstin, mock: true },
      ip, userAgent, status: 'success',
    }).catch(() => undefined);
    return NextResponse.json(getMockData(normalizedGstin), { status: 200 });
  }

  try {
    const response = await fetch(`${process.env.GSTIN_API_URL}?gstin=${encodeURIComponent(normalizedGstin)}`, {
      headers: { 'x-api-key': process.env.GSTIN_API_KEY as string, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await connectDB();
    await AuditLog.create({
      userId: (session?.user as { id?: string })?.id,
      action: 'compliance.gstin.lookup',
      details: { gstin: normalizedGstin },
      ip, userAgent, status: response.ok ? 'success' : 'failure',
    });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[compliance/gstin]', error);
    return NextResponse.json(getMockData(normalizedGstin), { status: 200 });
  }
}
