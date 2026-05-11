import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const MOCK_GSTIN: Record<string, object> = {
  '27AABCU9603R1ZX': { gstin: '27AABCU9603R1ZX', legalName: 'Ultratech Cement Limited', tradeName: 'Ultratech Cement', status: 'ACTIVE', registrationDate: '01 Jul 2017', state: 'Maharashtra', businessType: 'Public Limited Company', taxpayerType: 'Regular', address: 'B Wing, Century Bhavan, Dr Annie Besant Road, Worli, Mumbai - 400030', lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED', panNumber: 'AABCU9603R', _mock: true },
  '29AAJCS5738K1Z5': { gstin: '29AAJCS5738K1Z5', legalName: 'Infosys Limited', tradeName: 'Infosys', status: 'ACTIVE', registrationDate: '01 Jul 2017', state: 'Karnataka', businessType: 'Public Limited Company', taxpayerType: 'Regular', address: 'Electronics City, Hosur Road, Bangalore - 560100', lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED', panNumber: 'AAJCS5738K', _mock: true },
  '24AAACR5055K1ZD': { gstin: '24AAACR5055K1ZD', legalName: 'Reliance Industries Limited', tradeName: 'Reliance', status: 'ACTIVE', registrationDate: '01 Jul 2017', state: 'Gujarat', businessType: 'Public Limited Company', taxpayerType: 'Regular', address: '222 Nariman Point, Mumbai - 400021', lastFilingDate: '20 Apr 2026', lastFilingPeriod: 'Mar 2026', filingStatus: 'FILED', panNumber: 'AAACR5055K', _mock: true },
};

const MOCK_EWB: Record<string, object> = {
  'EWB-4121009876': { ewaybillNumber: 'EWB-4121009876', status: 'ACTIVE', generatedDate: '10 May 2026 09:14', validUntil: '11 May 2026 23:59', supplierGstin: '27AABCU9603R1ZX', supplierName: 'Ultratech Cement Ltd', recipientGstin: '29AAJCS5738K1Z5', recipientName: 'Infosys Limited', invoiceNumber: 'INV/2026/05/001234', invoiceValue: 1845600, hsnCode: '2523', productDescription: 'Portland Cement — OPC 53 Grade', vehicleNumber: 'GJ01XX7890', transportMode: 'Road', distanceKm: 1400, _mock: true },
  'EWB-3987654321': { ewaybillNumber: 'EWB-3987654321', status: 'ACTIVE', generatedDate: '08 May 2026 15:30', validUntil: '12 May 2026 23:59', supplierGstin: '24AAACR5055K1ZD', supplierName: 'Reliance Industries Ltd', recipientGstin: '27AABCU9603R1ZX', recipientName: 'Ultratech Cement Ltd', invoiceNumber: 'RIL/INV/26/04/9901', invoiceValue: 3200000, hsnCode: '2710', productDescription: 'High Speed Diesel (HSD)', vehicleNumber: 'GJ01CC1234', transportMode: 'Road', distanceKm: 1250, _mock: true },
};

// GET /api/compliance/gstin?gstin=
router.get('/gstin', requireAuth, async (req: Request, res: Response) => {
  const { gstin } = req.query;
  if (!gstin || typeof gstin !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'gstin query parameter is required.' });
    return;
  }
  const normalized = gstin.toUpperCase().trim();
  if (!GSTIN_REGEX.test(normalized)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid GSTIN format.' });
    return;
  }
  const isConfigured = !!(process.env.GSTIN_API_KEY && process.env.GSTIN_API_URL);
  if (!isConfigured) {
    res.json(MOCK_GSTIN[normalized] || { gstin: normalized, legalName: 'Sunrise Logistics Pvt Ltd', status: 'ACTIVE', state: 'India', taxpayerType: 'Regular', _mock: true });
    return;
  }
  try {
    const r = await fetch(`${process.env.GSTIN_API_URL}?gstin=${encodeURIComponent(normalized)}`, {
      headers: { 'x-api-key': process.env.GSTIN_API_KEY as string },
    });
    res.status(r.status).json(await r.json());
  } catch { res.json(MOCK_GSTIN[normalized] || { gstin: normalized, status: 'ACTIVE', _mock: true }); }
});

// POST /api/compliance/ewaybill  — body: { ewaybillNumber } for lookup, or full payload for generate
router.post('/ewaybill', requireAuth, async (req: Request, res: Response) => {
  const isLookup = !!req.body.ewaybillNumber;
  const isConfigured = !!(process.env.EWAYBILL_API_KEY && process.env.EWAYBILL_API_URL);

  if (!isConfigured) {
    if (isLookup) {
      const key = String(req.body.ewaybillNumber).toUpperCase();
      const found = MOCK_EWB[key];
      if (found) { res.json(found); return; }
      res.status(404).json({ error: 'NOT_FOUND', message: 'E-Way Bill not found.' });
      return;
    }
    const ewbNum = `EWB-${Math.floor(4000000000 + Math.random() * 999999999)}`;
    res.status(201).json({ ewaybillNumber: ewbNum, status: 'ACTIVE', generatedDate: new Date().toLocaleString('en-IN'), ...req.body, _mock: true });
    return;
  }

  try {
    const apiPath = isLookup ? `${process.env.EWAYBILL_API_URL}/fetch` : `${process.env.EWAYBILL_API_URL}/generate`;
    const r = await fetch(apiPath, {
      method: 'POST',
      headers: { 'x-api-key': process.env.EWAYBILL_API_KEY as string, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch {
    if (isLookup) {
      const key = String(req.body.ewaybillNumber).toUpperCase();
      if (MOCK_EWB[key]) { res.json(MOCK_EWB[key]); return; }
    }
    res.status(503).json({ error: 'SERVICE_UNAVAILABLE' });
  }
});

export default router;
