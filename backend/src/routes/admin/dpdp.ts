import { Router, Request, Response } from 'express';
import { requireSuperAdmin, verifyTOTP, writeAuditLog } from '../../middleware/superAdmin';
import ErasureRequest from '../../models/ErasureRequest';
import User from '../../models/User';

const router = Router();

const MOCK_REQUESTS = [
  { id: 'er1', userEmail: 'rahul.sharma@example.com', userName: 'Rahul Sharma', reason: 'No longer using the service', dataCategories: ['profile', 'audit_logs', 'api_usage'], status: 'pending', requestedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'er2', userEmail: 'priya.nair@sme.in', userName: 'Priya Nair', reason: 'Privacy concerns', dataCategories: ['profile', 'audit_logs'], status: 'pending', requestedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'er3', userEmail: 'arjun.verma@logistics.co', userName: 'Arjun Verma', reason: 'Switching provider', dataCategories: ['profile'], status: 'completed', requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(), reviewedAt: new Date(Date.now() - 12 * 86400000).toISOString(), anonymizedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

// GET /api/admin/dpdp
router.get('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const requests = await ErasureRequest.find(filter).sort({ requestedAt: -1 });
    if (requests.length === 0) {
      const filtered = status ? MOCK_REQUESTS.filter((r) => r.status === status) : MOCK_REQUESTS;
      return res.json({ _mock: true, requests: filtered, total: filtered.length });
    }
    res.json({ _mock: false, requests, total: requests.length });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/dpdp/:id/approve — requires TOTP
router.post('/:id/approve', requireSuperAdmin, async (req: Request, res: Response) => {
  const { totpToken, note } = req.body as { totpToken: string; note?: string };
  if (!totpToken) return res.status(400).json({ error: 'TOTP_REQUIRED' });

  const valid = await verifyTOTP(req.superAdmin!.userId, totpToken);
  if (!valid) return res.status(400).json({ error: 'INVALID_TOTP', message: 'Authenticator code incorrect.' });

  try {
    const request = await ErasureRequest.findById(req.params.id);
    if (!request) {
      // Mock approval flow
      await writeAuditLog({
        actor: req.superAdmin!.userId,
        actorEmail: req.superAdmin!.email,
        action: 'DPDP_ERASURE_APPROVED',
        module: 'dpdp',
        target: req.params.id,
        details: { note, mock: true },
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });
      return res.json({ success: true, message: 'Erasure approved (mock). User data anonymized.' });
    }

    // Anonymize the user
    const anonSuffix = Date.now().toString(36).toUpperCase();
    await User.findByIdAndUpdate(request.userId, {
      name: `ANONYMIZED_${anonSuffix}`,
      email: `anon_${anonSuffix}@deleted.ulip.gov.in`,
      phone: null,
      organization: null,
      isAnonymized: true,
    });

    request.status = 'completed';
    request.reviewedAt = new Date();
    request.reviewedBy = req.superAdmin!.email;
    request.reviewNote = note;
    request.anonymizedAt = new Date();
    await request.save();

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'DPDP_ERASURE_APPROVED',
      module: 'dpdp',
      target: request.userId,
      details: { requestId: req.params.id, userEmail: request.userEmail, note },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true, message: 'User data anonymized per DPDP Act 2023.' });
  } catch (e) {
    res.status(500).json({ error: 'ERASURE_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/dpdp/:id/reject
router.post('/:id/reject', requireSuperAdmin, async (req: Request, res: Response) => {
  const { reason } = req.body as { reason: string };
  if (!reason) return res.status(400).json({ error: 'REASON_REQUIRED' });

  try {
    const request = await ErasureRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', reviewedAt: new Date(), reviewedBy: req.superAdmin!.email, reviewNote: reason },
      { new: true }
    );

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'DPDP_ERASURE_REJECTED',
      module: 'dpdp',
      target: req.params.id,
      details: { reason },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true, request: request || { id: req.params.id, status: 'rejected' } });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/dpdp/:id/export — data portability (DPDP Art. 6)
router.post('/:id/export', requireSuperAdmin, async (req: Request, res: Response) => {
  const { userId } = req.body as { userId: string };

  await writeAuditLog({
    actor: req.superAdmin!.userId,
    actorEmail: req.superAdmin!.email,
    action: 'DPDP_DATA_EXPORT',
    module: 'dpdp',
    target: userId,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  // In production: stream from DB. Here: return mock export manifest.
  res.json({
    _mock: true,
    exportId: `EXPORT_${Date.now().toString(36).toUpperCase()}`,
    userId,
    categories: ['profile', 'audit_logs', 'api_usage', 'compliance_history'],
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    downloadUrl: `/api/admin/dpdp/exports/${Date.now().toString(36)}.json`,
  });
});

export default router;
