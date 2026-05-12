import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateSecret, verifySync } from 'otplib';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

export { generateSecret };

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface SuperAdminPayload {
  userId: string;
  email: string;
  role: string;
  totpVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      superAdmin?: SuperAdminPayload;
    }
  }
}

export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing token.' });
  }

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as SuperAdminPayload;
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Super admin access required.' });
    }
    if (!payload.totpVerified) {
      return res.status(403).json({ error: 'TOTP_REQUIRED', message: '2FA verification required for this endpoint.' });
    }
    req.superAdmin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token invalid or expired.' });
  }
}

export async function verifyTOTP(userId: string, token: string): Promise<boolean> {
  const user = await User.findById(userId).select('+totpSecret');
  if (!user?.totpSecret) return false;
  const result = verifySync({ token, secret: user.totpSecret, strategy: 'totp' });
  return result.valid;
}

export async function writeAuditLog(params: {
  actor: string;
  actorEmail: string;
  action: string;
  module: string;
  target?: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  status?: 'success' | 'failure';
}) {
  try {
    const last = await AuditLog.findOne().sort({ createdAt: -1 }).select('hash');
    const prevHash = last?.hash || '0';
    await AuditLog.create({ ...params, prevHash, status: params.status || 'success' });
  } catch {
    // Audit log failures must not block the action
  }
}
