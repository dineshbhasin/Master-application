'use client';

import { useState } from 'react';
import {
  Globe2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Banknote,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Country list ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'China',
  'Germany', 'Japan', 'South Korea', 'Australia', 'Singapore', 'Canada',
  'France', 'Netherlands', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Malaysia',
  'Thailand', 'Indonesia', 'Vietnam', 'Saudi Arabia', 'Brazil', 'South Africa',
  'Egypt', 'Kenya', 'Nigeria', 'Mexico', 'Argentina', 'Italy', 'Spain',
  'Belgium', 'Switzerland', 'Sweden', 'Russia', 'Turkey', 'Israel',
  'Pakistan', 'Myanmar', 'Cambodia', 'Philippines', 'New Zealand',
];

// ─── HSN category resolver ────────────────────────────────────────────────────

function resolveHSN(code: string): { name: string; chapter: number; category: string } {
  const ch = parseInt(code.slice(0, 2), 10);
  if (ch <= 5) return { name: 'Live Animals & Animal Products', chapter: ch, category: 'animal' };
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

// ─── FTA checker ──────────────────────────────────────────────────────────────

const FTA_AGREEMENTS: Record<string, string> = {
  'Singapore': 'India–Singapore CECA (Comprehensive Economic Cooperation Agreement)',
  'Japan': 'India–Japan CEPA (Comprehensive Economic Partnership Agreement)',
  'South Korea': 'India–Korea CEPA',
  'Malaysia': 'India–Malaysia CECA',
  'Sri Lanka': 'India–Sri Lanka FTA',
  'Nepal': 'India–Nepal Treaty of Trade',
  'Bangladesh': 'SAFTA (South Asian Free Trade Area)',
  'Australia': 'India–Australia ECTA (Economic Cooperation & Trade Agreement)',
  'United Arab Emirates': 'India–UAE CEPA',
  'ASEAN (Thailand)': 'India–ASEAN FTA',
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

// ─── Checklist generator ──────────────────────────────────────────────────────

function generateChecklist(
  hsnCode: string,
  origin: string,
  destination: string
): ComplianceResult {
  const { name: commodityName, category } = resolveHSN(hsnCode);
  const isExportFromIndia = origin === 'India';
  const isImportToIndia = destination === 'India';
  const ftaAgreement = getFTA(origin, destination);

  // Risk level
  let riskLevel: ComplianceResult['riskLevel'] = 'low';
  if (['chemicals', 'arms', 'animal', 'gems'].includes(category)) riskLevel = 'medium';
  if (category === 'arms') riskLevel = 'restricted';
  if (['food', 'vegetable', 'animal', 'oils'].includes(category)) riskLevel = 'medium';

  // ── Export Documents ──────────────────────────────────────────────────────
  const exportItems: ChecklistItem[] = [
    {
      label: 'Commercial Invoice',
      description: 'Itemized invoice with unit price, quantity, HS code, total value in invoice currency, and Incoterms.',
      mandatory: true, status: 'required',
    },
    {
      label: 'Packing List',
      description: 'Gross/net weight, dimensions, number of packages, marks & numbers for each shipment.',
      mandatory: true, status: 'required',
    },
    {
      label: 'Shipping Bill (ICEGATE)',
      description: 'Filed electronically via ICEGATE portal. Required for customs clearance at Indian ports.',
      mandatory: isExportFromIndia, status: isExportFromIndia ? 'required' : 'conditional',
      authority: 'CBIC / ICEGATE',
    },
    {
      label: 'Bill of Lading / Airway Bill / Railway Receipt',
      description: 'Transport document issued by the carrier. Original copy required for customs.',
      mandatory: true, status: 'required',
    },
    {
      label: 'Certificate of Origin (CoO)',
      description: ftaAgreement
        ? `Preferential CoO required under ${ftaAgreement} for duty concession. Issued by DGFT/EPC/Chamber of Commerce.`
        : 'Non-preferential Certificate of Origin from Chamber of Commerce or DGFT.',
      mandatory: !!ftaAgreement, status: ftaAgreement ? 'required' : 'conditional',
      authority: 'DGFT / Chamber of Commerce',
    },
    {
      label: 'IEC (Import Export Code)',
      description: '10-digit code mandatory for all importers and exporters in India. Obtained from DGFT.',
      mandatory: origin === 'India' || destination === 'India', status: 'required',
      authority: 'DGFT',
    },
  ];

  // Category-specific export docs
  if (category === 'food' || category === 'vegetable' || category === 'animal' || category === 'oils') {
    exportItems.push({
      label: 'FSSAI Export Certificate',
      description: 'Food Safety & Standards Authority of India certificate for food/agri exports. Mandatory for all food items.',
      mandatory: true, status: 'required', authority: 'FSSAI',
    });
    exportItems.push({
      label: 'Phytosanitary Certificate (if applicable)',
      description: 'Required for plant-based commodities. Issued by Plant Quarantine Officer.',
      mandatory: category === 'vegetable', status: 'required', authority: 'NPPO / Plant Quarantine',
    });
  }
  if (category === 'textiles') {
    exportItems.push({
      label: 'Textile Committee Certificate',
      description: 'Quality certification for textile exports from designated testing labs.',
      mandatory: false, status: 'conditional', authority: 'Textile Committee of India',
    });
    exportItems.push({
      label: 'AEPC Membership / RC',
      description: 'Apparel Export Promotion Council registration certificate for MEIS/RoSCTL benefits.',
      mandatory: false, status: 'conditional', authority: 'AEPC',
    });
  }
  if (category === 'chemicals') {
    exportItems.push({
      label: 'Material Safety Data Sheet (MSDS/SDS)',
      description: 'Mandatory for hazardous chemicals. Must comply with GHS/REACH standards for the destination country.',
      mandatory: true, status: 'required',
    });
    exportItems.push({
      label: 'DGFT NOC / CIB Clearance',
      description: 'Required for restricted chemicals. Central Insecticides Board clearance for pesticide-class chemicals.',
      mandatory: false, status: 'conditional', authority: 'DGFT / CIB',
    });
  }
  if (category === 'gems') {
    exportItems.push({
      label: 'Kimberley Process Certificate',
      description: 'Mandatory for rough diamond trade to prevent conflict diamonds. Industry self-certification scheme.',
      mandatory: hsnCode.startsWith('71'), status: 'required', authority: 'GJEPC',
    });
    exportItems.push({
      label: 'GJEPC Export Licence',
      description: 'Gems & Jewellery Export Promotion Council registration for eligible exporters.',
      mandatory: false, status: 'conditional', authority: 'GJEPC',
    });
  }
  if (category === 'electronics') {
    exportItems.push({
      label: 'BIS Certification (if applicable)',
      description: 'Bureau of Indian Standards certification for electronics under compulsory CRS scheme.',
      mandatory: false, status: 'conditional', authority: 'BIS',
    });
    exportItems.push({
      label: 'WPC / TEC Approval',
      description: 'Wireless Planning & Coordination approval required for wireless/radio frequency products.',
      mandatory: false, status: 'conditional', authority: 'WPC / TEC',
    });
  }
  if (category === 'arms') {
    exportItems.push({
      label: 'DGFT Export Licence — Restricted Item',
      description: 'Arms, ammunition and dual-use items require SCOMET (Special Chemicals, Organisms, Materials, Equipment & Technologies) export licence.',
      mandatory: true, status: 'required', authority: 'DGFT / MoD',
    });
    exportItems.push({
      label: 'End-User Certificate (EUC)',
      description: 'Certified undertaking from end user in destination country approved by respective government ministry.',
      mandatory: true, status: 'required', authority: 'Ministry of Defence',
    });
  }
  if (category === 'minerals') {
    exportItems.push({
      label: 'Statutory Mining Clearance',
      description: 'District Collector/DMG clearance for mineral extraction and export compliance.',
      mandatory: true, status: 'required', authority: 'IBM / DMG',
    });
  }

  // ── Import / Customs Documents ─────────────────────────────────────────────
  const importItems: ChecklistItem[] = [
    {
      label: 'Bill of Entry (BE)',
      description: isImportToIndia ? 'Filed on ICEGATE. Home Consumption BE for immediate clearance or Into Bond BE for bonded warehouse.' : 'Import declaration filed with destination country customs authority.',
      mandatory: true, status: 'required',
      authority: isImportToIndia ? 'CBIC / ICEGATE' : 'Destination Customs',
    },
    {
      label: 'Import Licence / Permit',
      description: `Check if HSN ${hsnCode} falls under restricted or canalized items. Canalised items can only be imported through designated agencies.`,
      mandatory: false, status: 'conditional',
      authority: isImportToIndia ? 'DGFT' : 'Destination Ministry of Commerce',
    },
    {
      label: 'Customs Bond / Duty Payment',
      description: 'Basic Customs Duty (BCD), IGST, and Social Welfare Surcharge must be paid before release. Deferred duty schemes available.',
      mandatory: true, status: 'required',
    },
    {
      label: 'Letter of Credit / Bank Guarantee',
      description: 'For high-value shipments, a confirmed irrevocable LC from an AD-Category bank may be required by customs.',
      mandatory: false, status: 'conditional',
    },
  ];

  if (isImportToIndia && (category === 'food' || category === 'vegetable')) {
    importItems.push({
      label: 'FSSAI Import Clearance',
      description: 'Mandatory for all food imports. FSSAI licence and conformity assessment required prior to clearance.',
      mandatory: true, status: 'required', authority: 'FSSAI',
    });
  }
  if (isImportToIndia && category === 'electronics') {
    importItems.push({
      label: 'BIS Compulsory Registration (CRS)',
      description: 'Electronics falling under Schedule I of BIS Notification require CRS registration before import.',
      mandatory: false, status: 'conditional', authority: 'BIS',
    });
  }

  // ── DGFT / Regulatory ─────────────────────────────────────────────────────
  const dgftItems: ChecklistItem[] = [
    {
      label: 'IEC Registration (DGFT)',
      description: 'Import Export Code — 10-digit PAN-linked code mandatory for all cross-border trade. Valid for lifetime, no renewal.',
      mandatory: true, status: 'required', authority: 'DGFT',
    },
    {
      label: 'RCMC (Registration cum Membership Certificate)',
      description: 'Issued by relevant Export Promotion Council. Required to claim benefits under FTP 2023 schemes (RoDTEP, RoSCTL, MEIS).',
      mandatory: false, status: 'conditional', authority: 'Relevant EPC',
    },
    {
      label: 'RoDTEP / RoSCTL Refund Claim',
      description: 'Remission of Duties and Taxes on Exported Products. Applicable on shipping bill. Duty credit scrips issued.',
      mandatory: false, status: 'info', authority: 'DGFT / CBIC',
    },
    {
      label: 'Advance Authorisation / EPCG',
      description: 'Advance Authorisation allows duty-free imports of inputs. Export Promotion Capital Goods scheme for capital goods.',
      mandatory: false, status: 'info', authority: 'DGFT',
    },
  ];

  if (category === 'arms' || category === 'chemicals') {
    dgftItems.unshift({
      label: 'SCOMET Licence',
      description: 'Special Chemicals, Organisms, Materials, Equipment & Technologies — export licence for dual-use items and strategic goods.',
      mandatory: category === 'arms', status: category === 'arms' ? 'required' : 'conditional',
      authority: 'DGFT / NSCS',
    });
  }

  // ── Restrictions ───────────────────────────────────────────────────────────
  const restrictionItems: ChecklistItem[] = [];
  if (category === 'arms') {
    restrictionItems.push({
      label: '⛔ SCOMET Category Item',
      description: 'Arms, ammunition and military equipment are SCOMET-listed. Export requires prior approval of DGFT and Ministry of Defence. Unlicensed export is a criminal offence under FTDRA.',
      mandatory: true, status: 'required', authority: 'DGFT / MoD',
    });
  }
  if (category === 'animal') {
    restrictionItems.push({
      label: 'CITES Compliance (if wildlife)',
      description: 'Convention on International Trade in Endangered Species. Verify species is not listed under Appendix I/II before export.',
      mandatory: false, status: 'conditional', authority: 'MoEF / CITES',
    });
  }
  if (destination === 'China' && (category === 'electronics' || category === 'chemicals')) {
    restrictionItems.push({
      label: 'China Import Restrictions (GACC)',
      description: 'China\'s GACC may require product registration and facility registration for electronics, food, and certain chemicals. Verify current GACC notifications.',
      mandatory: false, status: 'conditional', authority: 'GACC',
    });
  }
  if (destination === 'United States') {
    restrictionItems.push({
      label: 'US FDA / FCC / EPA Compliance',
      description: 'Depending on product: FDA for food/pharma/medical devices, FCC for electronics with RF components, EPA for chemicals.',
      mandatory: false, status: 'conditional', authority: 'US FDA / FCC / EPA',
    });
  }
  if (destination === 'European Union' || destination === 'Germany' || destination === 'France' || destination === 'Netherlands' || destination === 'Belgium' || destination === 'Italy' || destination === 'Spain' || destination === 'Sweden') {
    restrictionItems.push({
      label: 'CE Marking / REACH Compliance',
      description: 'Mandatory CE marking for electronics, machinery, and certain products entering EU market. REACH regulation for chemicals.',
      mandatory: false, status: 'conditional',
    });
  }
  if (restrictionItems.length === 0) {
    restrictionItems.push({
      label: 'No Major Trade Restrictions Found',
      description: `No SCOMET/CITES/embargoed restrictions identified for HSN ${hsnCode} on this trade lane. Verify against DGFT Trade Notice for the current FTP 2023 schedule.`,
      mandatory: false, status: 'info',
    });
  }

  // ── Tariff ────────────────────────────────────────────────────────────────
  const tariffMap: Record<string, { bcd: string; igst: string }> = {
    animal:      { bcd: '30%', igst: '5%' },
    vegetable:   { bcd: '30–100%', igst: '0–5%' },
    oils:        { bcd: '100%', igst: '5%' },
    food:        { bcd: '30–150%', igst: '5–12%' },
    minerals:    { bcd: '2.5%', igst: '5%' },
    chemicals:   { bcd: '7.5%', igst: '18%' },
    plastics:    { bcd: '10%', igst: '18%' },
    leather:     { bcd: '10%', igst: '12%' },
    wood:        { bcd: '10%', igst: '12%' },
    textiles:    { bcd: '20%', igst: '12%' },
    footwear:    { bcd: '25%', igst: '12%' },
    stone:       { bcd: '10%', igst: '12%' },
    gems:        { bcd: '7.5%', igst: '3%' },
    metals:      { bcd: '7.5%', igst: '18%' },
    electronics: { bcd: '10%', igst: '18%' },
    transport:   { bcd: '35%', igst: '28%' },
    arms:        { bcd: 'Varies', igst: '12%' },
    art:         { bcd: '0%', igst: '12%' },
    misc:        { bcd: '10%', igst: '18%' },
    general:     { bcd: '10%', igst: '18%' },
  };
  const tariffBase = tariffMap[category] || tariffMap.general;

  const tariff: TariffInfo = {
    bcd: isImportToIndia ? tariffBase.bcd : 'Refer destination tariff schedule',
    igst: isImportToIndia ? tariffBase.igst : 'N/A (domestic tax applies at destination)',
    socialWelfareCharge: isImportToIndia ? '10% of BCD' : 'N/A',
    totalDuty: isImportToIndia ? `~${tariffBase.bcd} BCD + ${tariffBase.igst} IGST + SWS` : 'Refer destination customs authority',
    ftaNote: ftaAgreement ? `Preferential duty rate available under ${ftaAgreement}. Provide valid CoO to claim concession.` : undefined,
  };

  // ── Assemble sections ──────────────────────────────────────────────────────
  const sections: ChecklistSection[] = [
    {
      title: 'Export Clearance Documents',
      icon: <FileText size={16} />,
      color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
      items: exportItems,
    },
    {
      title: 'Import & Customs Requirements',
      icon: <Package size={16} />,
      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
      items: importItems,
    },
    {
      title: 'DGFT & Export Policy',
      icon: <ShieldCheck size={16} />,
      color: '#059669', bg: '#F0FDF4', border: '#BBF7D0',
      items: dgftItems,
    },
    {
      title: 'Restrictions & Prohibitions',
      icon: <AlertTriangle size={16} />,
      color: riskLevel === 'restricted' ? '#DC2626' : '#D97706',
      bg: riskLevel === 'restricted' ? '#FEF2F2' : '#FFFBEB',
      border: riskLevel === 'restricted' ? '#FECACA' : '#FDE68A',
      items: restrictionItems,
    },
  ];

  return {
    hsnCode,
    commodityName,
    origin,
    destination,
    riskLevel,
    sections,
    tariff,
    generatedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ChecklistItem['status'] }) {
  const map = {
    required:    { label: 'Mandatory', bg: '#FEE2E2', color: '#DC2626' },
    conditional: { label: 'Conditional', bg: '#FEF3C7', color: '#D97706' },
    info:        { label: 'Advisory', bg: '#EFF6FF', color: '#1D4ED8' },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg, color: s.color,
        fontSize: '10px', fontWeight: 700, padding: '2px 7px',
        borderRadius: '9999px', letterSpacing: '0.04em', whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function Section({ section }: { section: ChecklistSection }) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${section.border}` }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: section.bg }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: section.color }}>{section.icon}</span>
          <span className="font-semibold text-sm" style={{ color: section.color }}>
            {section.title}
          </span>
          <span
            style={{
              background: section.color, color: 'white',
              fontSize: '10px', fontWeight: 700, padding: '1px 6px',
              borderRadius: '9999px',
            }}
          >
            {section.items.length}
          </span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: section.color }} /> : <ChevronDown size={16} style={{ color: section.color }} />}
      </button>
      {open && (
        <div className="divide-y" style={{ borderColor: section.border }}>
          {section.items.map((item, i) => (
            <div key={i} className="px-4 py-3 bg-white flex gap-3">
              <div className="mt-0.5 shrink-0">
                {item.mandatory
                  ? <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                  : item.status === 'info'
                    ? <Info size={16} style={{ color: '#6B7280' }} />
                    : <AlertTriangle size={16} style={{ color: '#D97706' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{item.label}</span>
                  <StatusBadge status={item.status} />
                  {item.authority && (
                    <span
                      style={{
                        fontSize: '10px', color: '#64748B',
                        background: '#F1F5F9', padding: '1px 6px',
                        borderRadius: '4px', fontWeight: 500,
                      }}
                    >
                      {item.authority}
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: '#64748B', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick presets ────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Pharma Export to US', hsn: '30049099', origin: 'India', dest: 'United States' },
  { label: 'Textile to UAE (FTA)', hsn: '61091000', origin: 'India', dest: 'United Arab Emirates' },
  { label: 'Electronics Import', hsn: '85171200', origin: 'China', dest: 'India' },
  { label: 'Diesel (Mineral Fuel)', hsn: '27101990', origin: 'Saudi Arabia', dest: 'India' },
  { label: 'Rice Export (Basmati)', hsn: '10063020', origin: 'India', dest: 'Singapore' },
  { label: 'Auto Parts Export', hsn: '87089900', origin: 'India', dest: 'Germany' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EXIMPage() {
  const [hsn, setHsn] = useState('');
  const [origin, setOrigin] = useState('India');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState('');

  function applyPreset(p: typeof PRESETS[0]) {
    setHsn(p.hsn);
    setOrigin(p.origin);
    setDestination(p.dest);
    setResult(null);
    setError('');
  }

  function handleGenerate() {
    setError('');
    if (!hsn.trim()) { setError('Please enter a valid HSN code.'); return; }
    if (hsn.trim().length < 4) { setError('HSN code must be at least 4 digits.'); return; }
    if (!/^\d+$/.test(hsn.trim())) { setError('HSN code must contain digits only.'); return; }
    if (!destination) { setError('Please select a destination country.'); return; }
    if (origin === destination) { setError('Origin and destination cannot be the same.'); return; }

    setLoading(true);
    setTimeout(() => {
      setResult(generateChecklist(hsn.trim(), origin, destination));
      setLoading(false);
    }, 900);
  }

  const riskColors: Record<string, { bg: string; color: string; label: string }> = {
    low:        { bg: '#F0FDF4', color: '#059669', label: 'Low Risk' },
    medium:     { bg: '#FFFBEB', color: '#D97706', label: 'Moderate Risk' },
    high:       { bg: '#FEF2F2', color: '#DC2626', label: 'High Risk' },
    restricted: { bg: '#FEF2F2', color: '#DC2626', label: 'Restricted' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: '#EFF6FF' }}
          >
            <Globe2 size={20} style={{ color: '#1D4ED8' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#0A2342' }}>EXIM & Trade Compliance</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Generate a compliance checklist for any cross-border shipment using HSN code</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6 space-y-5" style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-semibold" style={{ color: '#0A2342' }}>Shipment Details</p>

        {/* Quick presets */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E2E8F0';
                  e.currentTarget.style.color = '#0A2342';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HSN Code */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              HSN Code <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={hsn}
              onChange={(e) => setHsn(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="e.g. 61091000"
              maxLength={8}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1D4ED8'; e.currentTarget.style.background = 'white'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
            />
            {hsn.length >= 2 && (
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                {resolveHSN(hsn).name}
              </p>
            )}
          </div>

          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              Origin Country <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A' }}
            >
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              Destination Country <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A' }}
            >
              <option value="">Select country</option>
              {COUNTRIES.filter((c) => c !== origin).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#DC2626' }}>
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: loading ? '#94A3B8' : '#1D4ED8',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe2 size={16} />}
          {loading ? 'Generating Checklist…' : 'Generate Compliance Checklist'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Summary banner */}
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold" style={{ color: '#0A2342' }}>
                  HSN {result.hsnCode}
                </span>
                <span
                  style={{
                    background: riskColors[result.riskLevel].bg,
                    color: riskColors[result.riskLevel].color,
                    fontSize: '11px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '9999px',
                  }}
                >
                  {riskColors[result.riskLevel].label}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>{result.commodityName}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                {result.origin} → {result.destination} · Generated {result.generatedAt}
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-xs" style={{ color: '#94A3B8' }}>Total Items</p>
                <p className="text-xl font-bold" style={{ color: '#0A2342' }}>
                  {result.sections.reduce((acc, s) => acc + s.items.length, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: '#94A3B8' }}>Mandatory</p>
                <p className="text-xl font-bold" style={{ color: '#DC2626' }}>
                  {result.sections.reduce((acc, s) => acc + s.items.filter(i => i.mandatory).length, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Tariff box */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Banknote size={15} style={{ color: '#059669' }} />
              <p className="text-sm font-semibold" style={{ color: '#0A2342' }}>Applicable Tariff (Import to {result.destination})</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Basic Customs Duty', value: result.tariff.bcd },
                { label: 'IGST', value: result.tariff.igst },
                { label: 'Social Welfare Charge', value: result.tariff.socialWelfareCharge },
                { label: 'Approx. Total Duty', value: result.tariff.totalDuty },
              ].map((t) => (
                <div key={t.label} className="rounded-lg p-3" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{t.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#0A2342' }}>{t.value}</p>
                </div>
              ))}
            </div>
            {result.tariff.ftaNote && (
              <div className="mt-3 rounded-lg px-3 py-2 flex items-start gap-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={14} style={{ color: '#059669', marginTop: '1px', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: '#065F46' }}>{result.tariff.ftaNote}</p>
              </div>
            )}
          </div>

          {/* Checklist sections */}
          <div className="space-y-3">
            {result.sections.map((section) => (
              <Section key={section.title} section={section} />
            ))}
          </div>

          <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
            This checklist is generated based on DGFT FTP 2023, CBIC Customs Tariff Act and publicly available trade regulations.
            Always verify with a licensed customs broker or DGFT office before shipment.
          </p>
        </div>
      )}
    </div>
  );
}
