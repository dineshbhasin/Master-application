import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './lib/db';
import authRouter from './routes/auth';
import vehicleRouter from './routes/vehicle';
import fastagRouter from './routes/fastag';
import complianceRouter from './routes/compliance';
import trackingRouter from './routes/tracking';
import adminAnalyticsRouter from './routes/admin/analytics';
import adminNodeHealthRouter from './routes/admin/nodeHealth';
import adminOrgsRouter from './routes/admin/organizations';
import adminUsersRouter from './routes/admin/users';
import adminAuditRouter from './routes/admin/auditTrail';
import adminDPDPRouter from './routes/admin/dpdp';
import adminApiKeysRouter from './routes/admin/apiKeys';
import adminTwoFactorRouter from './routes/admin/twoFactor';
import platformRouter from './routes/platform';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === (process.env.CLIENT_URL || '')) {
      cb(null, true);
    } else {
      cb(new Error('CORS: origin not allowed'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/vehicle',    vehicleRouter);
app.use('/api/fastag',     fastagRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/tracking',   trackingRouter);

// Super-admin routes — all gated by requireSuperAdmin + TOTP
app.use('/api/admin/2fa',         adminTwoFactorRouter);
app.use('/api/admin/analytics',   adminAnalyticsRouter);
app.use('/api/admin/node-health', adminNodeHealthRouter);
app.use('/api/admin/organizations', adminOrgsRouter);
app.use('/api/admin/users',       adminUsersRouter);
app.use('/api/admin/audit-trail', adminAuditRouter);
app.use('/api/admin/dpdp',        adminDPDPRouter);
app.use('/api/admin/api-keys',    adminApiKeysRouter);

// Platform admin routes — gated by requireRole('official', 'super_admin'), no TOTP
app.use('/api/platform',          platformRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found.' }));

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB();
  } catch (e) {
    console.warn('MongoDB unavailable — running with mock data only:', (e as Error).message);
  }
  app.listen(PORT, () => console.log(`ULIP backend running on http://localhost:${PORT}`));
}

start();
