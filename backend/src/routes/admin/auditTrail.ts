import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { requireSuperAdmin } from '../../middleware/superAdmin';
import AuditLog, { computeHash } from '../../models/AuditLog';

const router = Router();

// GET /api/admin/audit-trail
router.get('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { action, actor, from, to, page = '1', limit = '50' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (actor) filter.$or = [{ actor: new RegExp(actor, 'i') }, { actorEmail: new RegExp(actor, 'i') }];
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// GET /api/admin/audit-trail/verify — verify hash chain integrity
router.get('/verify', requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: 1 }).limit(500);
    let prevHash = '0';
    let broken = false;
    let brokenAt: string | null = null;

    for (const log of logs) {
      const expected = computeHash({ ...log.toObject(), prevHash });
      if (log.hash !== expected) {
        broken = true;
        brokenAt = log.id;
        break;
      }
      prevHash = log.hash;
    }

    res.json({ chainIntact: !broken, brokenAt, logsChecked: logs.length });
  } catch (e) {
    res.status(500).json({ error: 'VERIFY_ERROR', message: (e as Error).message });
  }
});

export default router;
