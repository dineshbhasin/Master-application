import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateSecret, generateURI, verifySync } from 'otplib';
import User from '../../models/User';
import { writeAuditLog } from '../../middleware/superAdmin';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// POST /api/admin/2fa/setup
router.post('/setup', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; role: string };
    if (payload.role !== 'super_admin') return res.status(403).json({ error: 'FORBIDDEN' });

    const user = await User.findById(payload.userId).select('+totpSecret');
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

    if (user.totpEnabled) {
      return res.status(400).json({ error: 'ALREADY_ENABLED', message: '2FA is already active.' });
    }

    const secret = generateSecret();
    user.totpSecret = secret;
    await user.save();

    const otpauthUrl = generateURI({ strategy: 'totp', secret, label: user.email, issuer: 'ULIP Super Admin' });

    res.json({ secret, otpauthUrl });
  } catch {
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
});

// POST /api/admin/2fa/verify
router.post('/verify', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const { token } = req.body as { token: string };
  if (!token) return res.status(400).json({ error: 'TOKEN_REQUIRED' });

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; email: string; role: string };
    if (payload.role !== 'super_admin') return res.status(403).json({ error: 'FORBIDDEN' });

    const user = await User.findById(payload.userId).select('+totpSecret');
    if (!user?.totpSecret) {
      return res.status(400).json({ error: 'SETUP_REQUIRED', message: 'Complete 2FA setup first.' });
    }

    const { valid } = verifySync({ token, secret: user.totpSecret, strategy: 'totp' });
    if (!valid) return res.status(400).json({ error: 'INVALID_TOTP', message: 'Incorrect authenticator code.' });

    user.totpEnabled = true;
    await user.save();

    const signedToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, totpVerified: true },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    await writeAuditLog({
      actor: user.id,
      actorEmail: user.email,
      action: '2FA_VERIFIED',
      module: 'auth',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ token: signedToken, message: '2FA verified.' });
  } catch {
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
});

export default router;
