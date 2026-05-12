import { Router, Request, Response } from 'express';
import { requireSuperAdmin } from '../../middleware/superAdmin';
import AuditLog from '../../models/AuditLog';

const router = Router();

function mockTrendline(days: number, base: number, variance: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().slice(0, 10),
    value: Math.round(base + Math.sin(i * 0.4) * variance + Math.random() * (variance * 0.3)),
  }));
}

// GET /api/admin/analytics/overview
router.get('/overview', requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 86400000);
    const last30d = new Date(now.getTime() - 30 * 86400000);

    const [calls24h, calls30d, errors30d] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ createdAt: { $gte: last30d } }),
      AuditLog.countDocuments({ createdAt: { $gte: last30d }, status: 'failure' }),
    ]);

    const useMock = calls30d === 0;

    res.json({
      _mock: useMock,
      apiCalls24h:      useMock ? 142_380 : calls24h,
      apiCalls30d:      useMock ? 3_847_291 : calls30d,
      successRate:      useMock ? 99.2 : calls30d > 0 ? +((1 - errors30d / calls30d) * 100).toFixed(1) : 100,
      errorRate:        useMock ? 0.8 : calls30d > 0 ? +(errors30d / calls30d * 100).toFixed(1) : 0,
      activeOrgs:       useMock ? 847 : 0,
      pendingErasures:  useMock ? 3 : 0,
      anomalyAlerts:    useMock ? 2 : 0,
    });
  } catch (e) {
    res.status(500).json({ error: 'AGGREGATION_ERROR', message: (e as Error).message });
  }
});

// GET /api/admin/analytics/trendline?period=30d|7d|24h
router.get('/trendline', requireSuperAdmin, async (req: Request, res: Response) => {
  const period = (req.query.period as string) || '30d';
  const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;

  try {
    const from = new Date(Date.now() - days * 86400000);
    const logs = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    if (logs.length === 0) {
      res.json({
        _mock: true,
        enterprise: mockTrendline(days, 80000, 15000),
        citizen:    mockTrendline(days, 62000, 9000),
      });
      return;
    }

    res.json({ _mock: false, raw: logs });
  } catch (e) {
    res.status(500).json({ error: 'AGGREGATION_ERROR', message: (e as Error).message });
  }
});

// GET /api/admin/analytics/modules
router.get('/modules', requireSuperAdmin, async (_req: Request, res: Response) => {
  const modules = [
    { name: 'VAHAN (RC Lookup)',    calls: 892_341, errors: 2_100 },
    { name: 'FASTag',               calls: 643_120, errors: 890 },
    { name: 'GSTN Compliance',      calls: 421_880, errors: 1_440 },
    { name: 'ICEGATE (EXIM)',       calls: 312_450, errors: 3_210 },
    { name: 'Multi-Modal Tracking', calls: 284_670, errors: 560 },
    { name: 'Route Planner',        calls: 198_340, errors: 320 },
    { name: 'Sarathi (DL)',         calls: 176_210, errors: 880 },
    { name: 'DigiLocker / Identity',calls: 134_780, errors: 240 },
  ];
  res.json({ _mock: true, modules });
});

export default router;
