import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

const RegisterSchema = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  password:     z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  phone:        z.string().optional(),
  organization: z.string().optional(),
  role:         z.enum(['citizen', 'sme', 'enterprise', 'official']).optional(),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { name, email, password, phone, organization, role } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: 'CONFLICT', message: 'An account with this email already exists.' });
    return;
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, phone, organization, role: role || 'citizen', isVerified: true });
  const token = signToken(String(user._id), user.email, user.role);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    return;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    return;
  }
  user.lastLogin = new Date();
  await user.save();
  const token = signToken(String(user._id), user.email, user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me  — returns current user from token
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization });
});

export default router;
