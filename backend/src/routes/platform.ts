import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

const router = Router();
const adminGate = [requireAuth, requireRole('official', 'super_admin')];

// GET /api/platform/users
router.get('/users', ...adminGate, async (req: Request, res: Response) => {
  try {
    const { search, role, page = '1', limit = '25' } = req.query as Record<string, string>;
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

// PATCH /api/platform/users/:id/role
router.patch('/users/:id/role', ...adminGate, async (req: Request, res: Response) => {
  const Schema = z.object({ role: z.enum(['citizen', 'sme', 'enterprise', 'official', 'super_admin']) });
  const parse = Schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', issues: parse.error.issues });

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: parse.data.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

    await AuditLog.create({
      actor: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'ROLE_CHANGE',
      module: 'platform_admin',
      target: req.params.id,
      details: { newRole: parse.data.role, targetEmail: user.email },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      prevHash: '0',
    });

    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

// DELETE /api/platform/users/:id
router.delete('/users/:id', ...adminGate, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

    await AuditLog.create({
      actor: req.user!.userId,
      actorEmail: req.user!.email,
      action: 'USER_DELETED',
      module: 'platform_admin',
      target: req.params.id,
      details: { deletedEmail: user.email },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      prevHash: '0',
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'DELETE_ERROR', message: (e as Error).message });
  }
});

// GET /api/platform/activity — unified activity log with user/API level filters
router.get('/activity', ...adminGate, async (req: Request, res: Response) => {
  try {
    const { view = 'all', search, module: mod, status, from, to, page = '1', limit = '50' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};

    if (view === 'user') {
      filter.actor = { $ne: 'system' };
    } else if (view === 'api') {
      filter.actor = 'system';
    }

    if (search) {
      filter.$or = [
        { actorEmail: new RegExp(search, 'i') },
        { action: new RegExp(search, 'i') },
        { target: new RegExp(search, 'i') },
      ];
    }
    if (mod) filter.module = mod;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to)   (filter.createdAt as Record<string, unknown>).$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      AuditLog.countDocuments(filter),
    ]);

    const modules = await AuditLog.distinct('module');

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), modules });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// GET /api/platform/activity/stats — quick summary numbers
router.get('/activity/stats', ...adminGate, async (_req: Request, res: Response) => {
  try {
    const last24h = new Date(Date.now() - 86400000);
    const [total, last24hCount, failures] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ status: 'failure' }),
    ]);
    res.json({ total, last24h: last24hCount, failures });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

export default router;
