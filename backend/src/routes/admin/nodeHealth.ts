import { Router, Request, Response } from 'express';
import { requireSuperAdmin } from '../../middleware/superAdmin';

const router = Router();

type NodeStatus = 'operational' | 'degraded' | 'down';

interface NodeHealth {
  id: string;
  name: string;
  ministry: string;
  endpoint: string;
  latencyMs: number;
  status: NodeStatus;
  uptime30d: number;
  lastChecked: string;
  incidents: { date: string; duration: string; description: string }[];
}

function mockLatency(base: number): number {
  return Math.round(base + (Math.random() - 0.5) * base * 0.3);
}

function statusFromLatency(ms: number): NodeStatus {
  if (ms > 2000) return 'down';
  if (ms > 500) return 'degraded';
  return 'operational';
}

// GET /api/admin/node-health
router.get('/', requireSuperAdmin, (_req: Request, res: Response) => {
  const nodes: NodeHealth[] = [
    {
      id: 'vahan',
      name: 'VAHAN (Vehicle RC)',
      ministry: 'Ministry of Road Transport',
      endpoint: 'vahan.nic.in/api',
      latencyMs: mockLatency(120),
      uptime30d: 99.8,
      incidents: [],
    },
    {
      id: 'sarathi',
      name: 'Sarathi (Driving Licence)',
      ministry: 'Ministry of Road Transport',
      endpoint: 'sarathi.nic.in/api',
      latencyMs: mockLatency(145),
      uptime30d: 99.5,
      incidents: [{ date: '2026-05-03', duration: '23 min', description: 'Scheduled maintenance' }],
    },
    {
      id: 'gstn',
      name: 'GSTN (Tax Network)',
      ministry: 'Ministry of Finance',
      endpoint: 'api.gstin.in',
      latencyMs: mockLatency(210),
      uptime30d: 98.9,
      incidents: [{ date: '2026-05-08', duration: '11 min', description: 'Rate limiter spike' }],
    },
    {
      id: 'icegate',
      name: 'ICEGATE (Customs)',
      ministry: 'Ministry of Finance',
      endpoint: 'icegate.gov.in/api',
      latencyMs: mockLatency(380),
      uptime30d: 97.4,
      incidents: [
        { date: '2026-04-29', duration: '47 min', description: 'Database failover' },
        { date: '2026-05-09', duration: '8 min', description: 'Network blip' },
      ],
    },
    {
      id: 'nhai',
      name: 'NHAI (FASTag)',
      ministry: 'Ministry of Road Transport',
      endpoint: 'fastag.nhai.gov.in',
      latencyMs: mockLatency(95),
      uptime30d: 99.9,
      incidents: [],
    },
    {
      id: 'uidai',
      name: 'UIDAI (DigiLocker)',
      ministry: 'Ministry of Electronics & IT',
      endpoint: 'api.uidai.gov.in',
      latencyMs: mockLatency(160),
      uptime30d: 99.6,
      incidents: [],
    },
    {
      id: 'nsdl',
      name: 'NSDL (PAN / TAN)',
      ministry: 'Ministry of Finance',
      endpoint: 'nsdlpan.utiitsl.com/api',
      latencyMs: mockLatency(290),
      uptime30d: 98.2,
      incidents: [{ date: '2026-05-01', duration: '31 min', description: 'Upstream cert renewal' }],
    },
    {
      id: 'dgft',
      name: 'DGFT (Export Policy)',
      ministry: 'Ministry of Commerce',
      endpoint: 'dgft.gov.in/api',
      latencyMs: mockLatency(450),
      uptime30d: 96.8,
      incidents: [
        { date: '2026-04-22', duration: '2h 14m', description: 'Data centre relocation' },
        { date: '2026-05-07', duration: '19 min', description: 'SSL certificate issue' },
      ],
    },
    {
      id: 'irctc',
      name: 'Indian Railways (Rail)',
      ministry: 'Ministry of Railways',
      endpoint: 'indianrailways.gov.in/api',
      latencyMs: mockLatency(330),
      uptime30d: 98.1,
      incidents: [{ date: '2026-05-05', duration: '28 min', description: 'Peak load throttling' }],
    },
    {
      id: 'dgca',
      name: 'DGCA (Air Cargo)',
      ministry: 'Ministry of Civil Aviation',
      endpoint: 'dgca.gov.in/api',
      latencyMs: mockLatency(185),
      uptime30d: 99.3,
      incidents: [],
    },
  ].map((n) => ({
    ...n,
    status: statusFromLatency(n.latencyMs),
    lastChecked: new Date().toISOString(),
  }));

  const summary = {
    operational: nodes.filter((n) => n.status === 'operational').length,
    degraded: nodes.filter((n) => n.status === 'degraded').length,
    down: nodes.filter((n) => n.status === 'down').length,
  };

  res.json({ _mock: true, nodes, summary, checkedAt: new Date().toISOString() });
});

export default router;
