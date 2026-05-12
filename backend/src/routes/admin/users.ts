import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireSuperAdmin, verifyTOTP, writeAuditLog } from '../../middleware/superAdmin';
import User from '../../models/User';

const router = Router();

// GET /api/admin/users
router.get('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -totpSecret').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// PATCH /api/admin/users/:id/role — requires TOTP re-challenge
router.patch('/:id/role', requireSuperAdmin, async (req: Request, res: Response) => {
  const Schema = z.object({
    role:      z.enum(['citizen', 'sme', 'enterprise', 'official', 'super_admin']),
    totpToken: z.string().length(6),
  });
  const parse = Schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', issues: parse.error.issues });

  const { role, totpToken } = parse.data;
  const valid = await verifyTOTP(req.superAdmin!.userId, totpToken);
  if (!valid) return res.status(400).json({ error: 'INVALID_TOTP', message: 'Authenticator code incorrect.' });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'ROLE_CHANGE',
      module: 'users',
      target: req.params.id,
      details: { newRole: role, targetEmail: user.email },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

// DELETE /api/admin/users/:id — suspend (soft delete)
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  const { totpToken } = req.body as { totpToken: string };
  if (!totpToken) return res.status(400).json({ error: 'TOTP_REQUIRED' });

  const valid = await verifyTOTP(req.superAdmin!.userId, totpToken);
  if (!valid) return res.status(400).json({ error: 'INVALID_TOTP' });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'USER_SUSPENDED',
      module: 'users',
      target: req.params.id,
      details: { targetEmail: user.email },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

export default router;
