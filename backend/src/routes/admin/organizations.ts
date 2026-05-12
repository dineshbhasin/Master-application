import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireSuperAdmin, writeAuditLog } from '../../middleware/superAdmin';
import Organization from '../../models/Organization';

const router = Router();

const MOCK_ORGS = [
  { id: 'org1', name: 'Tata Logistics Ltd', domain: 'tatalogistics.com', tier: 'enterprise', status: 'active', adminEmail: 'admin@tatalogistics.com', apiCalls30d: 892341, dataRegion: 'in-west1', modules: { vehicleIntel: true, fastag: true, compliance: true, tracking: true, routePlanner: true, exim: true, identity: false, esgTracker: true, railLogistics: true } },
  { id: 'org2', name: 'Mahindra Freight', domain: 'mahindrafreight.in', tier: 'enterprise', status: 'active', adminEmail: 'it@mahindrafreight.in', apiCalls30d: 643120, dataRegion: 'in-south1', modules: { vehicleIntel: true, fastag: true, compliance: true, tracking: true, routePlanner: true, exim: false, identity: false, esgTracker: false, railLogistics: false } },
  { id: 'org3', name: 'Ministry of Shipping', domain: 'shipping.gov.in', tier: 'government', status: 'active', adminEmail: 'tech@shipping.gov.in', apiCalls30d: 421880, dataRegion: 'in-central1', modules: { vehicleIntel: true, fastag: true, compliance: true, tracking: true, routePlanner: true, exim: true, identity: true, esgTracker: false, railLogistics: true } },
  { id: 'org4', name: 'Blue Dart Express', domain: 'bluedart.com', tier: 'enterprise', status: 'active', adminEmail: 'devops@bluedart.com', apiCalls30d: 312450, dataRegion: 'in-west1', modules: { vehicleIntel: true, fastag: true, compliance: false, tracking: true, routePlanner: true, exim: false, identity: false, esgTracker: false, railLogistics: false } },
  { id: 'org5', name: 'Aggarwal SME Exports', domain: 'aggarwalexports.com', tier: 'sme', status: 'active', adminEmail: 'owner@aggarwalexports.com', apiCalls30d: 18240, dataRegion: 'in-north1', modules: { vehicleIntel: true, fastag: true, compliance: true, tracking: false, routePlanner: false, exim: true, identity: true, esgTracker: false, railLogistics: false } },
  { id: 'org6', name: 'Kerala Spices Co-op', domain: 'keralaSpices.in', tier: 'sme', status: 'pending', adminEmail: 'admin@keralaspices.in', apiCalls30d: 0, dataRegion: 'in-south1', modules: { vehicleIntel: true, fastag: true, compliance: false, tracking: false, routePlanner: false, exim: false, identity: false, esgTracker: false, railLogistics: false } },
  { id: 'org7', name: 'Flipkart Commerce', domain: 'flipkart.com', tier: 'enterprise', status: 'active', adminEmail: 'ulip@flipkart.com', apiCalls30d: 284670, dataRegion: 'in-west1', modules: { vehicleIntel: true, fastag: true, compliance: true, tracking: true, routePlanner: true, exim: true, identity: false, esgTracker: false, railLogistics: false } },
  { id: 'org8', name: 'Simplex Infra', domain: 'simplexinfra.com', tier: 'sme', status: 'suspended', adminEmail: 'cto@simplexinfra.com', apiCalls30d: 0, dataRegion: 'in-east1', modules: { vehicleIntel: false, fastag: false, compliance: false, tracking: false, routePlanner: false, exim: false, identity: false, esgTracker: false, railLogistics: false } },
];

// GET /api/admin/organizations
router.get('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { search, tier, status } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { domain: new RegExp(search, 'i') }];
    if (tier) filter.tier = tier;
    if (status) filter.status = status;

    const orgs = await Organization.find(filter).sort({ createdAt: -1 });
    if (orgs.length === 0) {
      return res.json({ _mock: true, organizations: MOCK_ORGS, total: MOCK_ORGS.length });
    }
    res.json({ _mock: false, organizations: orgs, total: orgs.length });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', message: (e as Error).message });
  }
});

// PATCH /api/admin/organizations/:id/modules
router.patch('/:id/modules', requireSuperAdmin, async (req: Request, res: Response) => {
  const { modules } = req.body as { modules: Record<string, boolean> };
  const { id } = req.params;

  try {
    const org = await Organization.findByIdAndUpdate(id, { $set: { modules } }, { new: true });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'MODULE_TOGGLE',
      module: 'organizations',
      target: id,
      details: { modules },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true, organization: org || { id, modules } });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

// PATCH /api/admin/organizations/:id/status
router.patch('/:id/status', requireSuperAdmin, async (req: Request, res: Response) => {
  const StatusSchema = z.object({ status: z.enum(['active', 'suspended', 'pending']) });
  const parse = StatusSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', issues: parse.error.issues });

  const { id } = req.params;
  const { status } = parse.data;

  try {
    const org = await Organization.findByIdAndUpdate(id, { status }, { new: true });

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'ORG_STATUS_CHANGE',
      module: 'organizations',
      target: id,
      details: { status },
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.json({ success: true, organization: org || { id, status } });
  } catch (e) {
    res.status(500).json({ error: 'UPDATE_ERROR', message: (e as Error).message });
  }
});

// POST /api/admin/organizations
router.post('/', requireSuperAdmin, async (req: Request, res: Response) => {
  const OrgSchema = z.object({
    name:       z.string().min(2),
    domain:     z.string().min(3),
    tier:       z.enum(['government', 'enterprise', 'sme']),
    adminEmail: z.string().email(),
  });
  const parse = OrgSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', issues: parse.error.issues });

  try {
    const org = await Organization.create(parse.data);

    await writeAuditLog({
      actor: req.superAdmin!.userId,
      actorEmail: req.superAdmin!.email,
      action: 'ORG_CREATED',
      module: 'organizations',
      target: org.id,
      details: parse.data,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.status(201).json({ organization: org });
  } catch (e) {
    res.status(500).json({ error: 'CREATE_ERROR', message: (e as Error).message });
  }
});

export default router;
