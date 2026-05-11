import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RC: Record<string, object> = {
  'MH12AB1234': { vehicleNumber: 'MH12AB1234', ownerName: 'Rajesh Kumar Sharma', rcStatus: 'ACTIVE', make: 'TATA', model: 'NEXON EV MAX', year: 2023, fuelType: 'ELECTRIC', chassisNumber: 'MAT628196NE002345', engineNumber: 'NONE-EV', registrationDate: '15 Mar 2023', validUntil: '14 Mar 2038', insuranceValid: '14 Mar 2027', pucValid: '14 Sep 2026', vehicleClass: 'LMV', fitnessValid: '14 Mar 2038', _mock: true },
  'DL8CAB5678': { vehicleNumber: 'DL8CAB5678', ownerName: 'Priya Singh', rcStatus: 'ACTIVE', make: 'MARUTI SUZUKI', model: 'SWIFT VXI', year: 2021, fuelType: 'PETROL', chassisNumber: 'MA3FJEB1S00287654', engineNumber: 'K12MN2234567', registrationDate: '22 Jun 2021', validUntil: '21 Jun 2036', insuranceValid: '21 Jun 2026', pucValid: '21 Dec 2026', vehicleClass: 'LMV', fitnessValid: '21 Jun 2036', _mock: true },
  'KA03MN9012': { vehicleNumber: 'KA03MN9012', ownerName: 'Suresh Naidu', rcStatus: 'ACTIVE', make: 'MAHINDRA', model: 'SCORPIO-N Z8 L', year: 2022, fuelType: 'DIESEL', chassisNumber: 'MA1WK2GCXN8Y01892', engineNumber: 'CR4-M-Z8-JM45892', registrationDate: '10 Jan 2022', validUntil: '09 Jan 2037', insuranceValid: '09 Jan 2026', pucValid: '09 Jul 2026', vehicleClass: 'LMV', fitnessValid: '09 Jan 2037', _mock: true },
  'TN09CD3456': { vehicleNumber: 'TN09CD3456', ownerName: 'Meena Rajan', rcStatus: 'EXPIRED', make: 'HYUNDAI', model: 'CRETA SX(O)', year: 2019, fuelType: 'PETROL', chassisNumber: 'MALC281EBKM789456', engineNumber: 'G4FAHY234567', registrationDate: '18 Apr 2019', validUntil: '17 Apr 2034', insuranceValid: '17 Apr 2024', pucValid: '17 Apr 2025', vehicleClass: 'LMV', fitnessValid: '17 Apr 2034', _mock: true },
  'GJ01XX7890': { vehicleNumber: 'GJ01XX7890', ownerName: 'Hardik Patel Transporters Pvt Ltd', rcStatus: 'ACTIVE', make: 'ASHOK LEYLAND', model: 'BOSS 1415', year: 2020, fuelType: 'DIESEL', chassisNumber: '01AM20AXX5023456', engineNumber: 'H4-2345678', registrationDate: '05 Feb 2020', validUntil: '04 Feb 2035', insuranceValid: '04 Feb 2026', pucValid: '04 Aug 2026', vehicleClass: 'HGV', permitType: 'National', grossWeight: '14500 kg', _mock: true },
};

function getMockRC(vehicleNumber: string): object {
  const v = vehicleNumber.toUpperCase();
  if (MOCK_RC[v]) return MOCK_RC[v];
  return {
    vehicleNumber: v, ownerName: 'Rajesh Kumar Sharma', rcStatus: 'ACTIVE',
    make: 'TATA', model: 'NEXON EV MAX', year: 2023, fuelType: 'ELECTRIC',
    registrationDate: '15 Mar 2023', validUntil: '14 Mar 2038',
    insuranceValid: '14 Mar 2027', pucValid: '14 Sep 2026',
    vehicleClass: 'LMV', _mock: true,
  };
}

const MOCK_DL: Record<string, object> = {
  'MH1220230012345': { licenseNumber: 'MH1220230012345', name: 'Rajesh Kumar Sharma', dob: '15 Aug 1988', dlStatus: 'ACTIVE', issuedOn: '20 Mar 2023', validUntil: '19 Mar 2043', issuingRTO: 'RTO Pune (MH-12)', vehicleClasses: ['LMV', 'MCWG'], bloodGroup: 'B+', address: '45 Deccan Gymkhana, Pune — 411004, Maharashtra', emergencyContact: '+91 98765 43210', _mock: true },
  'DL0420190054321': { licenseNumber: 'DL0420190054321', name: 'Priya Singh', dob: '02 Jan 1992', dlStatus: 'ACTIVE', issuedOn: '15 Jul 2019', validUntil: '14 Jul 2039', issuingRTO: 'RTO Dwarka (DL-04)', vehicleClasses: ['LMV', 'MCWG'], bloodGroup: 'A+', address: 'B-214 Vasant Kunj, New Delhi — 110070', emergencyContact: '+91 98123 45678', _mock: true },
  'KA0120181122334': { licenseNumber: 'KA0120181122334', name: 'Suresh Naidu', dob: '30 Nov 1985', dlStatus: 'ACTIVE', issuedOn: '05 Dec 2018', validUntil: '04 Dec 2038', issuingRTO: 'RTO Bengaluru West (KA-01)', vehicleClasses: ['LMV', 'HTV', 'MCWG'], bloodGroup: 'O+', address: '12 Rajajinagar, Bengaluru — 560010', emergencyContact: '+91 80123 56789', _mock: true },
  'TN0920150078965': { licenseNumber: 'TN0920150078965', name: 'Meena Rajan', dob: '14 May 1990', dlStatus: 'EXPIRED', issuedOn: '20 Jun 2015', validUntil: '19 Jun 2025', issuingRTO: 'RTO Chennai South (TN-09)', vehicleClasses: ['LMV'], bloodGroup: 'AB+', address: '34 Anna Nagar, Chennai — 600040', emergencyContact: '+91 44123 98765', _mock: true },
};

function getMockDL(licenseNumber: string): object {
  const l = licenseNumber.toUpperCase();
  if (MOCK_DL[l]) return MOCK_DL[l];
  return {
    licenseNumber: l, name: 'Rajesh Kumar Sharma', dob: '15 Aug 1988',
    dlStatus: 'ACTIVE', issuedOn: '20 Mar 2023', validUntil: '19 Mar 2043',
    issuingRTO: 'RTO Pune (MH-12)', vehicleClasses: ['LMV', 'MCWG'],
    bloodGroup: 'B+', _mock: true,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/vehicle/rc?vehicleNumber=
router.get('/rc', requireAuth, async (req: Request, res: Response) => {
  const { vehicleNumber } = req.query;
  if (!vehicleNumber || typeof vehicleNumber !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'vehicleNumber query parameter is required.' });
    return;
  }
  const isConfigured = !!(process.env.VAHAN_API_KEY && process.env.VAHAN_API_URL);
  if (!isConfigured) { res.json(getMockRC(vehicleNumber)); return; }
  try {
    const r = await fetch(`${process.env.VAHAN_API_URL}/rc?vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
      headers: { 'x-api-key': process.env.VAHAN_API_KEY as string },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch { res.json(getMockRC(vehicleNumber)); }
});

// GET /api/vehicle/dl?licenseNumber=
router.get('/dl', requireAuth, async (req: Request, res: Response) => {
  const { licenseNumber } = req.query;
  if (!licenseNumber || typeof licenseNumber !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'licenseNumber query parameter is required.' });
    return;
  }
  const isConfigured = !!(process.env.SARATHI_API_KEY && process.env.SARATHI_API_URL);
  if (!isConfigured) { res.json(getMockDL(licenseNumber)); return; }
  try {
    const r = await fetch(`${process.env.SARATHI_API_URL}/dl?licenseNumber=${encodeURIComponent(licenseNumber)}`, {
      headers: { 'x-api-key': process.env.SARATHI_API_KEY as string },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch { res.json(getMockDL(licenseNumber)); }
});

export default router;
