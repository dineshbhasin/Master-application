import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

const MOCK_BALANCES: Record<string, object> = {
  'MH12AB1234': { vehicleNumber: 'MH12AB1234', tagId: 'NETC10012345678901', balance: 1785.50, tagStatus: 'ACTIVE', vehicleClass: 'Car/Jeep/Van', issuingBank: 'HDFC Bank', lastRecharge: '05 May 2026', lastRechargeAmount: 500, _mock: true },
  'DL8CAB5678': { vehicleNumber: 'DL8CAB5678', tagId: 'NETC10098765432109', balance: 145.00, tagStatus: 'LOW_BALANCE', vehicleClass: 'Car/Jeep/Van', issuingBank: 'SBI', lastRecharge: '01 Apr 2026', lastRechargeAmount: 300, _mock: true },
  'KA03MN9012': { vehicleNumber: 'KA03MN9012', tagId: 'NETC10055566778899', balance: 3200.00, tagStatus: 'ACTIVE', vehicleClass: 'Car/Jeep/Van', issuingBank: 'ICICI Bank', lastRecharge: '08 May 2026', lastRechargeAmount: 1000, _mock: true },
  'GJ01XX7890': { vehicleNumber: 'GJ01XX7890', tagId: 'NETC20099988877766', balance: 8450.75, tagStatus: 'ACTIVE', vehicleClass: 'Heavy Goods Vehicle', issuingBank: 'Axis Bank', lastRecharge: '10 May 2026', lastRechargeAmount: 5000, _mock: true },
};

const MOCK_TRANSACTIONS = [
  { id: 'TXN2026051001', dateTime: '2026-05-10 14:32', tollPlaza: 'Khalapur (Mumbai-Pune Expy)', amount: 170, balance: 1785.50, status: 'SUCCESS', direction: 'Mumbai → Pune' },
  { id: 'TXN2026050901', dateTime: '2026-05-09 09:15', tollPlaza: 'Sinhagad Road Toll', amount: 60, balance: 1955.50, status: 'SUCCESS', direction: 'City' },
  { id: 'TXN2026050801', dateTime: '2026-05-08 18:44', tollPlaza: 'Vadape (NH-48)', amount: 95, balance: 2015.50, status: 'SUCCESS', direction: 'Mumbai → Nashik' },
  { id: 'TXN2026050701', dateTime: '2026-05-07 07:22', tollPlaza: 'Talegaon (Mumbai-Pune Expy)', amount: 75, balance: 2110.50, status: 'FAILED', direction: 'Pune → Mumbai', failReason: 'Insufficient balance — topped up at booth' },
  { id: 'TXN2026050601', dateTime: '2026-05-06 16:05', tollPlaza: 'Khed Shivapur Toll', amount: 85, balance: 2185.50, status: 'SUCCESS', direction: 'Pune → Satara' },
  { id: 'TXN2026050501', dateTime: '2026-05-05 11:30', tollPlaza: 'Charoti (NH-48)', amount: 135, balance: 2270.50, status: 'SUCCESS', direction: 'Nashik → Mumbai' },
  { id: 'TXN2026050401', dateTime: '2026-05-04 08:55', tollPlaza: 'Palaspe (Mumbai-Pune Expy)', amount: 170, balance: 2405.50, status: 'SUCCESS', direction: 'Pune → Mumbai' },
  { id: 'TXN2026050301', dateTime: '2026-05-03 14:10', tollPlaza: 'Vashi Creek Toll', amount: 30, balance: 2575.50, status: 'SUCCESS', direction: 'Navi Mumbai' },
  { id: 'TXN2026050201', dateTime: '2026-05-02 19:25', tollPlaza: 'Airoli (Thane-Belapur)', amount: 25, balance: 2605.50, status: 'SUCCESS', direction: 'Navi Mumbai' },
  { id: 'TXN2026050101', dateTime: '2026-05-01 06:40', tollPlaza: 'Pune-Nashik Highway Toll', amount: 110, balance: 2630.50, status: 'SUCCESS', direction: 'Pune → Nashik' },
];

// GET /api/fastag/balance?vehicleNumber=
router.get('/balance', requireAuth, async (req: Request, res: Response) => {
  const { vehicleNumber } = req.query;
  if (!vehicleNumber || typeof vehicleNumber !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'vehicleNumber query parameter is required.' });
    return;
  }
  const isConfigured = !!(process.env.FASTAG_API_KEY && process.env.FASTAG_API_URL);
  if (!isConfigured) {
    const v = vehicleNumber.toUpperCase();
    res.json(MOCK_BALANCES[v] || { ...MOCK_BALANCES['MH12AB1234'], vehicleNumber: v });
    return;
  }
  try {
    const r = await fetch(`${process.env.FASTAG_API_URL}/balance?vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
      headers: { 'x-api-key': process.env.FASTAG_API_KEY as string },
    });
    res.status(r.status).json(await r.json());
  } catch { res.json({ ...MOCK_BALANCES['MH12AB1234'], vehicleNumber: vehicleNumber.toUpperCase() }); }
});

// GET /api/fastag/transactions?vehicleNumber=
router.get('/transactions', requireAuth, async (req: Request, res: Response) => {
  const { vehicleNumber } = req.query;
  if (!vehicleNumber || typeof vehicleNumber !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'vehicleNumber query parameter is required.' });
    return;
  }
  const isConfigured = !!(process.env.FASTAG_API_KEY && process.env.FASTAG_API_URL);
  if (!isConfigured) {
    res.json({ transactions: MOCK_TRANSACTIONS, total: MOCK_TRANSACTIONS.length, vehicleNumber: vehicleNumber.toUpperCase(), _mock: true });
    return;
  }
  try {
    const r = await fetch(`${process.env.FASTAG_API_URL}/transactions?vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
      headers: { 'x-api-key': process.env.FASTAG_API_KEY as string },
    });
    res.status(r.status).json(await r.json());
  } catch { res.json({ transactions: MOCK_TRANSACTIONS, total: MOCK_TRANSACTIONS.length, _mock: true }); }
});

export default router;
