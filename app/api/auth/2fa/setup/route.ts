import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TOTP, generateSecret } from 'otplib';
import QRCode from 'qrcode';
import { authOptions } from '../../../../../lib/auth';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'You must be logged in.' }, { status: 401 });
  }

  const secret = generateSecret();
  const appName = 'ULIP';
  const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(session.user.email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;

  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  return NextResponse.json({ secret, qrCode, otpAuthUrl });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'You must be logged in.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'token and secret are required.' },
        { status: 400 }
      );
    }

    const totp = new TOTP();
    const isValid = await totp.verify(token, { secret });
    if (!isValid) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'The provided 2FA token is invalid.' },
        { status: 400 }
      );
    }

    await connectDB();

    await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      { twoFactorSecret: secret, twoFactorEnabled: true }
    );

    return NextResponse.json({ message: 'Two-factor authentication has been enabled.' });
  } catch (error) {
    console.error('[2fa/setup]', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
