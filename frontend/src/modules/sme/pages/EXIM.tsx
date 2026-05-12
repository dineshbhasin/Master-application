import React, { useState } from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import {
  Globe2, FileText, CheckCircle2, AlertTriangle, Info,
  ChevronDown, ChevronUp, Package, Banknote, ShieldCheck, Loader2,
} from 'lucide-react';

interface ChecklistItem {
  label: string;
  description: string;
  mandatory: boolean;
  authority?: string;
  status: 'required' | 'conditional' | 'info';
}

interface ChecklistSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  items: ChecklistItem[];
}

interface TariffInfo {
  bcd: string;
  igst: string;
  socialWelfareCharge: string;
  totalDuty: string;
  ftaNote?: string;
}

interface ComplianceResult {
  hsnCode: string;
  commodityName: string;
  origin: string;
  destination: string;
  riskLevel: 'low' | 'medium' | 'high' | 'restricted';
  sections: ChecklistSection[];
  tariff: TariffInfo;
  generatedAt: string;
}

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'China',
  'Germany', 'Japan', 'South Korea', 'Australia', 'Singapore', 'Canada',
  'France', 'Netherlands', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Malaysia',
  'Thailand', 'Indonesia', 'Vietnam', 'Saudi Arabia', 'Brazil', 'South Africa',
  'Egypt', 'Kenya', 'Nigeria', 'Mexico', 'Argentina', 'Italy', 'Spain',
  'Belgium', 'Switzerland', 'Sweden', 'Russia', 'Turkey', 'Israel',
  'Pakistan', 'Myanmar', 'Cambodia', 'Philippines', 'New Zealand',
];

function resolveHSN(code: string): { name: string; chapter: number; category: string } {
  const ch = parseInt(code.slice(0, 2), 10);
  if (ch <= 5)  return { name: 'Live Animals & Animal Products', chapter: ch, category: 'animal' };
  if (ch <= 14) return { name: 'Vegetable Products', chapter: ch, category: 'vegetable' };
  if (ch === 15) return { name: 'Animal/Vegetable Oils & Fats', chapter: ch, category: 'oils' };
  if (ch <= 24) return { name: 'Food & Beverage Products', chapter: ch, category: 'food' };
  if (ch <= 27) return { name: 'Mineral Products & Fuels', chapter: ch, category: 'minerals' };
  if (ch <= 38) return { name: 'Chemical Products', chapter: ch, category: 'chemicals' };
  if (ch <= 40) return { name: 'Plastics & Rubber Articles', chapter: ch, category: 'plastics' };
  if (ch <= 43) return { name: 'Leather & Fur Products', chapter: ch, category: 'leather' };
  if (ch <= 49) return { name: 'Wood, Paper & Printed Matter', chapter: ch, category: 'wood' };
  if (ch <= 63) return { name: 'Textile Articles', chapter: ch, category: 'textiles' };
  if (ch <= 67) return { name: 'Footwear, Headgear & Umbrellas', chapter: ch, category: 'footwear' };
  if (ch <= 70) return { name: 'Stone, Glass & Ceramic Products', chapter: ch, category: 'stone' };
  if (ch === 71) return { name: 'Gems, Jewellery & Precious Metals', chapter: ch, category: 'gems' };
  if (ch <= 83) return { name: 'Base Metals & Articles', chapter: ch, category: 'metals' };
  if (ch <= 85) return { name: 'Machinery, Electronics & Equipment', chapter: ch, category: 'electronics' };
  if (ch <= 89) return { name: 'Transport Equipment', chapter: ch, category: 'transport' };
  if (ch === 93) return { name: 'Arms, Ammunition & Military Equipment', chapter: ch, category: 'arms' };
  if (ch <= 96) return { name: 'Miscellaneous Manufactured Articles', chapter: ch, category: 'misc' };
  if (ch === 97) return { name: 'Works of Art & Antiques', chapter: ch, category: 'art' };
  return { name: 'General Goods', chapter: ch, category: 'general' };
}

const FTA_AGREEMENTS: Record<string, string> = {
  'Singapore': 'India–Singapore CECA',
  'Japan': 'India–Japan CEPA',
  'South Korea': 'India–Korea CEPA',
  'Malaysia': 'India–Malaysia CECA',
  'Sri Lanka': 'India–Sri Lanka FTA',
  'Nepal': 'India–Nepal Treaty of Trade',
  'Bangladesh': 'SAFTA (South Asian Free Trade Area)',
  'Australia': 'India–Australia ECTA',
  'United Arab Emirates': 'India–UAE CEPA',
  'Thailand': 'India–ASEAN FTA',
  'Indonesia': 'India–ASEAN FTA',
  'Vietnam': 'India–ASEAN FTA',
  'Myanmar': 'India–ASEAN FTA',
  'Cambodia': 'India–ASEAN FTA',
  'Philippines': 'India–ASEAN FTA',
};

function getFTA(origin: string, dest: string): string | null {
  if (origin === 'India') return FTA_AGREEMENTS[dest] ?? null;
  if (dest === 'India') return FTA_AGREEMENTS[origin] ?? null;
  return null;
}

function generateChecklist(hsnCode: string, origin: string, destination: string): ComplianceResult {
  const { name: commodityName, category } = resolveHSN(hsnCode);
  const isExportFromIndia = origin === 'India';
  const isImportToIndia = destination === 'India';
  const ftaAgreement = getFTA(origin, destination);

  let riskLevel: ComplianceResult['riskLevel'] = 'low';
  if (['chemicals', 'arms', 'animal', 'gems'].includes(category)) riskLevel = 'medium';
  if (category === 'arms') riskLevel = 'restricted';
  if (['food', 'vegetable', 'animal', 'oils'].includes(category)) riskLevel = 'medium';

  const exportItems: ChecklistItem[] = [
    { label: 'Commercial Invoice', description: 'Itemized invoice with unit price, quantity, HS code, total value in invoice currency, and Incoterms.', mandatory: true, status: 'required' },
    { label: 'Packing List', description: 'Gross/net weight, dimensions, number of packages, marks & numbers for each shipment.', mandatory: true, status: 'required' },
    { label: 'Shipping Bill (ICEGATE)', description: 'Filed electronically via ICEGATE portal. Required for customs clearance at Indian ports.', mandatory: isExportFromIndia, status: isExportFromIndia ? 'required' : 'conditional', authority: 'CBIC / ICEGATE' },
    { label: 'Bill of Lading / Airway Bill / Railway Receipt', description: 'Transport document issued by the carrier. Original copy required for customs.', mandatory: true, status: 'required' },
    { label: 'Certificate of Origin (CoO)', description: ftaAgreement ? `Preferential CoO required under ${ftaAgreement} for duty concession.` : 'Non-preferential Certificate of Origin from Chamber of Commerce or DGFT.', mandatory: !!ftaAgreement, status: ftaAgreement ? 'required' : 'conditional', authority: 'DGFT / Chamber of Commerce' },
    { label: 'IEC (Import Export Code)', description: '10-digit code mandatory for all importers and exporters in India. Obtained from DGFT.', mandatory: origin === 'India' || destination === 'India', status: 'required', authority: 'DGFT' },
  ];

  if (['food', 'vegetable', 'animal', 'oils'].includes(category)) {
    exportItems.push({ label: 'FSSAI Export Certificate', description: 'Food Safety & Standards Authority of India certificate for food/agri exports.', mandatory: true, status: 'required', authority: 'FSSAI' });
    exportItems.push({ label: 'Phytosanitary Certificate', description: 'Required for plant-based commodities. Issued by Plant Quarantine Officer.', mandatory: category === 'vegetable', status: 'required', authority: 'NPPO / Plant Quarantine' });
  }
  if (category === 'textiles') {
    exportItems.push({ label: 'Textile Committee Certificate', description: 'Quality certification for textile exports from designated testing labs.', mandatory: false, status: 'conditional', authority: 'Textile Committee of India' });
  }
  if (category === 'chemicals') {
    exportItems.push({ label: 'Material Safety Data Sheet (MSDS/SDS)', description: 'Mandatory for hazardous chemicals. Must comply with GHS/REACH standards.', mandatory: true, status: 'required' });
    exportItems.push({ label: 'DGFT NOC / CIB Clearance', description: 'Required for restricted chemicals.', mandatory: false, status: 'conditional', authority: 'DGFT / CIB' });
  }
  if (category === 'gems') {
    exportItems.push({ label: 'Kimberley Process Certificate', description: 'Mandatory for rough diamond trade to prevent conflict diamonds.', mandatory: hsnCode.startsWith('71'), status: 'required', authority: 'GJEPC' });
  }
  if (category === 'electronics') {
    exportItems.push({ label: 'BIS Certification (if applicable)', description: 'Bureau of Indian Standards certification for electronics under compulsory CRS scheme.', mandatory: false, status: 'conditional', authority: 'BIS' });
    exportItems.push({ label: 'WPC / TEC Approval', description: 'Required for wireless/radio frequency products.', mandatory: false, status: 'conditional', authority: 'WPC / TEC' });
  }
  if (category === 'arms') {
    exportItems.push({ label: 'DGFT Export Licence — Restricted Item', description: 'SCOMET export licence required for arms, ammunition and dual-use items.', mandatory: true, status: 'required', authority: 'DGFT / MoD' });
    exportItems.push({ label: 'End-User Certificate (EUC)', description: 'Certified undertaking from end user in destination country.', mandatory: true, status: 'required', authority: 'Ministry of Defence' });
  }
  if (category === 'minerals') {
    exportItems.push({ label: 'Statutory Mining Clearance', description: 'District Collector/DMG clearance for mineral extraction and export compliance.', mandatory: true, status: 'required', authority: 'IBM / DMG' });
  }

  const importItems: ChecklistItem[] = [
    { label: 'Bill of Entry (BE)', description: isImportToIndia ? 'Filed on ICEGATE. Home Consumption BE or Into Bond BE for bonded warehouse.' : 'Import declaration filed with destination country customs authority.', mandatory: true, status: 'required', authority: isImportToIndia ? 'CBIC / ICEGATE' : 'Destination Customs' },
    { label: 'Import Licence / Permit', description: `Check if HSN ${hsnCode} falls under restricted or canalized items.`, mandatory: false, status: 'conditional', authority: isImportToIndia ? 'DGFT' : 'Destination Ministry of Commerce' },
    { label: 'Customs Bond / Duty Payment', description: 'BCD, IGST, and Social Welfare Surcharge must be paid before release.', mandatory: true, status: 'required' },
    { label: 'Letter of Credit / Bank Guarantee', description: 'For high-value shipments, a confirmed irrevocable LC may be required.', mandatory: false, status: 'conditional' },
  ];

  if (isImportToIndia && ['food', 'vegetable'].includes(category)) {
    importItems.push({ label: 'FSSAI Import Clearance', description: 'Mandatory for all food imports. FSSAI licence required prior to clearance.', mandatory: true, status: 'required', authority: 'FSSAI' });
  }
  if (isImportToIndia && category === 'electronics') {
    importItems.push({ label: 'BIS Compulsory Registration (CRS)', description: 'Electronics under Schedule I require CRS registration before import.', mandatory: false, status: 'conditional', authority: 'BIS' });
  }

  const dgftItems: ChecklistItem[] = [
    { label: 'IEC Registration (DGFT)', description: 'Import Export Code — mandatory for all cross-border trade.', mandatory: true, status: 'required', authority: 'DGFT' },
    { label: 'RCMC (Registration cum Membership Certificate)', description: 'Required to claim benefits under FTP 2023 schemes.', mandatory: false, status: 'conditional', authority: 'Relevant EPC' },
    { label: 'RoDTEP / RoSCTL Refund Claim', description: 'Remission of Duties and Taxes on Exported Products.', mandatory: false, status: 'info', authority: 'DGFT / CBIC' },
    { label: 'Advance Authorisation / EPCG', description: 'Advance Authorisation allows duty-free imports of inputs.', mandatory: false, status: 'info', authority: 'DGFT' },
  ];

  if (category === 'arms' || category === 'chemicals') {
    dgftItems.unshift({ label: 'SCOMET Licence', description: 'Special Chemicals, Organisms, Materials, Equipment & Technologies export licence.', mandatory: category === 'arms', status: category === 'arms' ? 'required' : 'conditional', authority: 'DGFT / NSCS' });
  }

  const restrictionItems: ChecklistItem[] = [];
  if (category === 'arms') restrictionItems.push({ label: '⛔ SCOMET Category Item', description: 'Unlicensed export is a criminal offence under FTDRA.', mandatory: true, status: 'required', authority: 'DGFT / MoD' });
  if (category === 'animal') restrictionItems.push({ label: 'CITES Compliance (if wildlife)', description: 'Verify species is not listed under Appendix I/II before export.', mandatory: false, status: 'conditional', authority: 'MoEF / CITES' });
  if (destination === 'United States') restrictionItems.push({ label: 'US FDA / FCC / EPA Compliance', description: 'FDA for food/pharma/medical devices, FCC for electronics, EPA for chemicals.', mandatory: false, status: 'conditional', authority: 'US FDA / FCC / EPA' });
  if (['Germany', 'France', 'Netherlands', 'Belgium', 'Italy', 'Spain', 'Sweden'].includes(destination)) {
    restrictionItems.push({ label: 'CE Marking / REACH Compliance', description: 'Mandatory CE marking for electronics, machinery entering EU market.', mandatory: false, status: 'conditional' });
  }
  if (restrictionItems.length === 0) {
    restrictionItems.push({ label: 'No Major Trade Restrictions Found', description: `No SCOMET/CITES restrictions for HSN ${hsnCode} on this trade lane.`, mandatory: false, status: 'info' });
  }

  const tariffMap: Record<string, { bcd: string; igst: string }> = {
    animal: { bcd: '30%', igst: '5%' }, vegetable: { bcd: '30–100%', igst: '0–5%' }, oils: { bcd: '100%', igst: '5%' },
    food: { bcd: '30–150%', igst: '5–12%' }, minerals: { bcd: '2.5%', igst: '5%' }, chemicals: { bcd: '7.5%', igst: '18%' },
    plastics: { bcd: '10%', igst: '18%' }, leather: { bcd: '10%', igst: '12%' }, wood: { bcd: '10%', igst: '12%' },
    textiles: { bcd: '20%', igst: '12%' }, footwear: { bcd: '25%', igst: '12%' }, stone: { bcd: '10%', igst: '12%' },
    gems: { bcd: '7.5%', igst: '3%' }, metals: { bcd: '7.5%', igst: '18%' }, electronics: { bcd: '10%', igst: '18%' },
    transport: { bcd: '35%', igst: '28%' }, arms: { bcd: 'Varies', igst: '12%' }, art: { bcd: '0%', igst: '12%' },
    misc: { bcd: '10%', igst: '18%' }, general: { bcd: '10%', igst: '18%' },
  };
  const tariffBase = tariffMap[category] || tariffMap.general;
  const tariff: TariffInfo = {
    bcd: isImportToIndia ? tariffBase.bcd : 'Refer destination tariff schedule',
    igst: isImportToIndia ? tariffBase.igst : 'N/A',
    socialWelfareCharge: isImportToIndia ? '10% of BCD' : 'N/A',
    totalDuty: isImportToIndia ? `~${tariffBase.bcd} BCD + ${tariffBase.igst} IGST + SWS` : 'Refer destination customs authority',
    ftaNote: ftaAgreement ? `Preferential duty rate available under ${ftaAgreement}. Provide valid CoO to claim concession.` : undefined,
  };

  const sections: ChecklistSection[] = [
    { title: 'Export Clearance Documents', icon: <FileText size={16} />, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', items: exportItems },
    { title: 'Import & Customs Requirements', icon: <Package size={16} />, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', items: importItems },
    { title: 'DGFT & Export Policy', icon: <ShieldCheck size={16} />, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', items: dgftItems },
    { title: 'Restrictions & Prohibitions', icon: <AlertTriangle size={16} />, color: riskLevel === 'restricted' ? '#DC2626' : '#D97706', bg: riskLevel === 'restricted' ? '#FEF2F2' : '#FFFBEB', border: riskLevel === 'restricted' ? '#FECACA' : '#FDE68A', items: restrictionItems },
  ];

  return { hsnCode, commodityName, origin, destination, riskLevel, sections, tariff, generatedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) };
}

function StatusBadge({ status }: { status: ChecklistItem['status'] }) {
  const map = {
    required:    { label: 'Mandatory', bg: '#FEE2E2', color: '#DC2626' },
    conditional: { label: 'Conditional', bg: '#FEF3C7', color: '#D97706' },
    info:        { label: 'Advisory', bg: '#EFF6FF', color: '#1D4ED8' },
  };
  const s = map[status];
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function Section({ section }: { section: ChecklistSection }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: `1px solid ${section.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', textAlign: 'left', background: section.bg, cursor: 'pointer', border: 'none' }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: section.color }}>{section.icon}</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: section.color }}>{section.title}</span>
          <span style={{ background: section.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 9999 }}>{section.items.length}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: section.color }} /> : <ChevronDown size={16} style={{ color: section.color }} />}
      </button>
      {open && section.items.map((item, i) => (
        <div key={i} style={{ padding: '12px 16px', background: 'white', display: 'flex', gap: 12, borderTop: `1px solid ${section.border}` }}>
          <div style={{ marginTop: 2, flexShrink: 0 }}>
            {item.mandatory ? <CheckCircle2 size={16} style={{ color: '#10B981' }} /> : item.status === 'info' ? <Info size={16} style={{ color: '#6B7280' }} /> : <AlertTriangle size={16} style={{ color: '#D97706' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
              <StatusBadge status={item.status} />
              {item.authority && <span style={{ fontSize: 10, color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>{item.authority}</span>}
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: 0 }}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const PRESETS = [
  { label: 'Pharma Export to US', hsn: '30049099', origin: 'India', dest: 'United States' },
  { label: 'Textile to UAE (FTA)', hsn: '61091000', origin: 'India', dest: 'United Arab Emirates' },
  { label: 'Electronics Import', hsn: '85171200', origin: 'China', dest: 'India' },
  { label: 'Diesel (Mineral Fuel)', hsn: '27101990', origin: 'Saudi Arabia', dest: 'India' },
  { label: 'Rice Export (Basmati)', hsn: '10063020', origin: 'India', dest: 'Singapore' },
  { label: 'Auto Parts Export', hsn: '87089900', origin: 'India', dest: 'Germany' },
];

export default function EXIM() {
  const { isMobile } = useBreakpoint();
  const [hsn, setHsn]             = useState('');
  const [origin, setOrigin]       = useState('India');
  const [destination, setDest]    = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ComplianceResult | null>(null);
  const [error, setError]         = useState('');

  function applyPreset(p: typeof PRESETS[0]) { setHsn(p.hsn); setOrigin(p.origin); setDest(p.dest); setResult(null); setError(''); }

  function handleGenerate() {
    setError('');
    if (!hsn.trim()) { setError('Please enter a valid HSN code.'); return; }
    if (hsn.trim().length < 4) { setError('HSN code must be at least 4 digits.'); return; }
    if (!/^\d+$/.test(hsn.trim())) { setError('HSN code must contain digits only.'); return; }
    if (!destination) { setError('Please select a destination country.'); return; }
    if (origin === destination) { setError('Origin and destination cannot be the same.'); return; }
    setLoading(true);
    setTimeout(() => { setResult(generateChecklist(hsn.trim(), origin, destination)); setLoading(false); }, 900);
  }

  const riskColors: Record<string, { bg: string; color: string; label: string }> = {
    low:        { bg: '#F0FDF4', color: '#059669', label: 'Low Risk' },
    medium:     { bg: '#FFFBEB', color: '#D97706', label: 'Moderate Risk' },
    high:       { bg: '#FEF2F2', color: '#DC2626', label: 'High Risk' },
    restricted: { bg: '#FEF2F2', color: '#DC2626', label: 'Restricted' },
  };

  const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 8, padding: '9px 12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 896, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Globe2 size={20} style={{ color: '#1D4ED8' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', margin: 0 }}>EXIM &amp; Trade Compliance</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Generate a compliance checklist for any cross-border shipment using HSN code</p>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0A2342', margin: 0 }}>Shipment Details</p>

        {/* Presets */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', marginBottom: 8 }}>Quick Presets</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}
                style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0A2342'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#374151' }}>HSN Code <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={hsn} onChange={(e) => setHsn(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="e.g. 61091000" maxLength={8} style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1D4ED8'; e.currentTarget.style.background = 'white'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }} />
            {hsn.length >= 2 && <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{resolveHSN(hsn).name}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Origin <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ ...inputStyle }}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Destination <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={destination} onChange={(e) => setDest(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select country</option>
              {COUNTRIES.filter((c) => c !== origin).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        <button onClick={handleGenerate} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, border: 'none', background: loading ? '#94A3B8' : '#1D4ED8', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, width: 'fit-content' }}>
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Globe2 size={16} />}
          {loading ? 'Generating Checklist…' : 'Generate Compliance Checklist'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary */}
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0A2342' }}>HSN {result.hsnCode}</span>
                <span style={{ background: riskColors[result.riskLevel].bg, color: riskColors[result.riskLevel].color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>{riskColors[result.riskLevel].label}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: 0 }}>{result.commodityName}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>{result.origin} → {result.destination} · Generated {result.generatedAt}</p>
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Total Items</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#0A2342', margin: '2px 0 0' }}>{result.sections.reduce((a, s) => a + s.items.length, 0)}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Mandatory</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#DC2626', margin: '2px 0 0' }}>{result.sections.reduce((a, s) => a + s.items.filter(i => i.mandatory).length, 0)}</p>
              </div>
            </div>
          </div>

          {/* Tariff */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Banknote size={15} style={{ color: '#059669' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0A2342', margin: 0 }}>Applicable Tariff (Import to {result.destination})</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Basic Customs Duty', value: result.tariff.bcd },
                { label: 'IGST', value: result.tariff.igst },
                { label: 'Social Welfare Charge', value: result.tariff.socialWelfareCharge },
                { label: 'Approx. Total Duty', value: result.tariff.totalDuty },
              ].map((t) => (
                <div key={t.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{t.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0A2342', margin: '2px 0 0' }}>{t.value}</p>
                </div>
              ))}
            </div>
            {result.tariff.ftaNote && (
              <div style={{ marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={14} style={{ color: '#059669', marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#065F46', margin: 0 }}>{result.tariff.ftaNote}</p>
              </div>
            )}
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.sections.map((s) => <Section key={s.title} section={s} />)}
          </div>

          <p style={{ fontSize: 12, textAlign: 'center', color: '#94A3B8' }}>
            Generated based on DGFT FTP 2023, CBIC Customs Tariff Act and publicly available trade regulations. Always verify with a licensed customs broker before shipment.
          </p>
        </div>
      )}
    </div>
  );
}
