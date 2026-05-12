import { Router, Request, Response } from 'express';
import { requireSuperAdmin, verifyTOTP, writeAuditLog } from '../../middleware/superAdmin';
import ApiKey, { generateRawKey, hashKey } from '../../models/ApiKey';

const router = Router();

const MOCK_KEYS = [
  { id: 'k1', organizationName: 'Tata Logistics Ltd', keyPrefix: 'ulip_a4f2', label: 'Production', scopes: ['read', 'write'], callsTotal: 892341, callsLast30d: 284670, lastUsedAt: new Date(Date.now() - 2 * 3600000).toISOString(), isRevoked: false, createdAt: new Date(Date.now() - 180 * 86400000).toISOString() },
  { id: 'k2', organizationName: 'Mahindra Freight', keyPrefix: 'ulip_b7e1', label: 'Staging', scopes: ['read'], callsTotal: 43210, callsLast30d: 12340, lastUsedAt: new Date(Date.now() - 24 * 3600000).toISOString(), isRevoked: false, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
  { id: 'k3', organizationName: 'Blue Dart Express', keyPrefix: 'ulip_c9d3', label: 'Production', scopes: ['read', 'write'], callsTotal: 312450, callsLast30d: 98430, lastUsedAt: new Date(Date.now() - 1 * 3600000).toISOString(), isRevoked: false, createdAt: new Date(Date.now() - 120 * 86400000).toISOString() },
  { id: 'k4', organizationName: 'Simplex Infra', keyPrefix: 'ulip_d2a8', label: 'Production', scopes: ['read'], callsTotal: 18920, callsLast30d: 0, lastUsedAt: new Date(Date.now() - 45 * 86400000).toISOString(), isRevoked: true, createdAt: new Date(Date.now() - 200 * 86400000).toISOString() },
];

// GET /api/admin/api-keys
router.get('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { org } = req.query as { org?: string };
    const filter: Record<string, unknown> = {};
    if (org) filter.organizationId = org;

    const keys = await ApiKey.find(filter).sort({ createdAt: -1 });
    if (keys.length === 0) {
      return res.json({ _mock: true, keys: MOCK_KEYS, total: MOCK_KEYS.length });
    }
    res.json({ _mock: false, keys, total: keys.length });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/api-keys — generate new key
router.post('/', requireSuperAdmin, async (req: Request, res: Response) => {
  const { organizationId, organizationName, label, scopes } = req.body as {
    organizationId: string;
    organizationName: string;
    label?: string;
    scopes?: string[];
  };
  if (!organizationId || !organizationName) {
    return res.status(400).json({ error: 'MISSING_FIELDS' });
  }

  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 11);

  try {
    const apiKey = await ApiKey.create({
      organizationId,
      organizationName,
      keyHash,
      keyPrefix,
      label: label || 'Default',
      scopes: scopes || ['read'],
      createdBy: req.superAdmin!.email,
    });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'API_KEY_GENERATED',
      module: 'api_keys',
      target: organizationId,
      details: { keyPrefix, organizationName },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    // Return raw key ONCE — never stored in plaintext
    res.status(201).json({ key: rawKey, apiKeyId: apiKey.id, keyPrefix, message: 'Store this key securely — it will not be shown again.' });
  } catch (e) {
    res.status(500).json({ error: 'CREATE_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/api-keys/:id/rotate — requires TOTP
router.post('/:id/rotate', requireSuperAdmin, async (req: Request, res: Response) => {
  const { totpToken } = req.body as { totpToken: string };
  if (!totpToken) return res.status(400).json({ error: 'TOTP_REQUIRED' });

  const valid = await verifyTOTP(req.superAdmin!.userId, totpToken);
  if (!valid) return res.status(400).json({ error: 'INVALID_TOTP' });

  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 11);

  try {
    const updated = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { keyHash, keyPrefix },
      { new: true }
    );

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'API_KEY_ROTATED',
      module: 'api_keys',
      target: req.params.id,
      details: { newPrefix: keyPrefix, organizationName: updated?.organizationName },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ key: rawKey, keyPrefix, message: 'Key rotated. Old key is immediately invalid.' });
  } catch (e) {
    res.status(500).json({ error: 'ROTATE_ERROR', message: (e as Error).message });
  }
});

// DELETE /api/admin/api-keys/:id — revoke
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await ApiKey.findByIdAndUpdate(req.params.id, { isRevoked: true }, { new: true });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'API_KEY_REVOKED',
      module: 'api_keys',
      target: req.params.id,
      details: { organizationName: updated?.organizationName },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'REVOKE_ERROR', message: (e as Error).message });
  }
});

export default router;
