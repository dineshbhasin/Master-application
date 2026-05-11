import Link from 'next/link';
import {
  Car,
  CreditCard,
  Map,
  FileCheck,
  Leaf,
  Landmark,
  BarChart3,
  Shield,
  CheckCircle2,
  Lock,
  Server,
  Globe,
  Award,
} from 'lucide-react';

function AshokaChakra({ size = 40 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const spokeCount = 24;
  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const angle = (i * 360) / spokeCount;
    const rad = (angle * Math.PI) / 180;
    const innerR = r * 0.22;
    const outerR = r * 0.82;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx={cx} cy={cy} r={r * 0.2} stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.87} stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

const services = [
  { icon: Car, title: 'Vehicle & Driver Intel', desc: 'Real-time VAHAN & SARATHI lookups for vehicles, ownership, permits, and driver licences.' },
  { icon: CreditCard, title: 'FASTag & Tolls', desc: 'Live FASTag status, transaction history, toll balance, and blacklist verification.' },
  { icon: Map, title: 'Multi-Modal Tracking', desc: 'End-to-end cargo visibility across road, rail, air, and sea freight corridors.' },
  { icon: FileCheck, title: 'Compliance Suite', desc: 'E-Way Bill generation, GSTIN verification, fitness certificates, and permit checks.' },
  { icon: Leaf, title: 'Sustainability & ESG', desc: 'Fleet carbon footprint analytics, emission benchmarks, and green-route recommendations.' },
  { icon: Landmark, title: 'Trade Finance', desc: 'Bill of Lading, Letter of Credit integration, and customs duty status via ICEGATE.' },
  { icon: BarChart3, title: 'Smart City Analytics', desc: 'Urban mobility insights, freight flow heatmaps, and last-mile logistics intelligence.' },
  { icon: Shield, title: 'DigiLocker Integration', desc: 'Instant verification of government-issued documents via National DigiLocker gateway.' },
];

const trustItems = [
  { icon: Award, label: 'ISO 27001 Certified' },
  { icon: Lock, label: 'DPDP Act 2023 Compliant' },
  { icon: Shield, label: '256-bit SSL Encrypted' },
  { icon: Globe, label: 'Government of India Platform' },
  { icon: Server, label: 'NIC Hosted Infrastructure' },
];

const personas = [
  { emoji: '🧑‍✈️', title: 'Citizen & Driver', desc: 'Check your vehicle status, FASTag balance, driving licence validity, and insurance — all in one place, for free.' },
  { emoji: '🏭', title: 'SME Logistics Provider', desc: 'Automate E-Way Bills, verify fleet compliance, and track consignments without expensive integrations.' },
  { emoji: '🏢', title: 'Enterprise', desc: 'High-volume API access, bulk processing, dedicated SLAs, and integration with your existing ERP/TMS systems.' },
  { emoji: '🏛️', title: 'Government Official', desc: 'Consolidated dashboards for cross-ministry freight analytics, enforcement intelligence, and policy insights.' },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', color: '#0A2342', background: '#F8FAFC' }}>

      {/* Top Government Bar */}
      <div
        style={{
          background: '#0A2342',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.75rem',
          fontWeight: 400,
          padding: '0.375rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ color: '#F59E0B', display: 'flex' }}>
            <AshokaChakra size={20} />
          </div>
          <span>
            Government of India&nbsp;&nbsp;|&nbsp;&nbsp;Ministry of Commerce &amp; Industry&nbsp;&nbsp;|&nbsp;&nbsp;NICDC Logistics Data Services Limited
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Lock size={10} /> Secure Platform
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'white',
          boxShadow: '0 2px 8px 0 rgba(10,35,66,0.12)',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '8px',
              background: '#0A2342',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
            }}
          >
            <AshokaChakra size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0A2342', lineHeight: 1.1 }}>ULIP</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 400, color: '#64748B', lineHeight: 1.2, letterSpacing: '0.02em' }}>
              Unified Logistics Interface Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {[
              { label: 'About', href: '#about' },
              { label: 'Services', href: '#services' },
              { label: 'API Docs', href: '#api-docs' },
              { label: 'Contact', href: '#contact' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#475569',
                  textDecoration: 'none',
                }}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href="/login"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0A2342',
                border: '1.5px solid #0A2342',
                borderRadius: '8px',
                padding: '0.5rem 1.25rem',
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0A2342',
                background: '#F59E0B',
                borderRadius: '8px',
                padding: '0.5rem 1.25rem',
                textDecoration: 'none',
                border: '1.5px solid transparent',
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A2342 0%, #1B3052 60%, #243B55 100%)',
          padding: '5rem 2rem 4.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.07) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '9999px',
                padding: '0.3125rem 0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  background: '#10B981',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F59E0B', letterSpacing: '0.04em' }}>
                PLATFORM LIVE — 99.97% UPTIME
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              India&apos;s Unified
              <br />
              <span style={{ color: '#F59E0B' }}>Logistics Gateway</span>
            </h1>

            <p
              style={{
                fontSize: '1.0625rem',
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.75,
                marginBottom: '2rem',
                maxWidth: '30rem',
              }}
            >
              A single sovereign API gateway connecting citizens, businesses, and government agencies to
              India&apos;s multi-modal logistics data — road, rail, air, and sea — in real time.
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#F59E0B',
                  color: '#0A2342',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '0.8125rem 1.75rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px 0 rgba(245,158,11,0.35)',
                }}
              >
                Access Platform
              </Link>
              <a
                href="#api-docs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  padding: '0.8125rem 1.75rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                }}
              >
                View Documentation
              </a>
            </div>
          </div>

          {/* Live Stats Glass Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#10B981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Live Platform Stats
              </span>
            </div>

            {[
              { label: 'Active Vehicles Tracked', value: '2,84,61,832', color: '#F59E0B' },
              { label: 'FASTag Transactions Today', value: '₹8,24,37,500', color: '#10B981' },
              { label: 'E-Way Bills Generated', value: '47,293', color: '#60A5FA' },
              { label: 'API Uptime', value: '99.97%', color: '#10B981' },
            ].map((stat, idx, arr) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 0',
                  borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)' }}>{stat.label}</span>
                <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '1.375rem 2rem' }}>
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
          }}
        >
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Icon size={16} style={{ color: '#0A2342' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" style={{ padding: '5rem 2rem', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              What We Offer
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0A2342', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
              Our Services
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.7 }}>
              Access 14 integrated service modules spanning the entire logistics value chain through a single, secure API.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ulip-card" style={{ padding: '1.375rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '10px',
                    background: '#EEF2F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A2342',
                    marginBottom: '0.875rem',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0A2342', marginBottom: '0.375rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.65, marginBottom: '0.875rem' }}>
                  {desc}
                </p>
                <a
                  href="#"
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F59E0B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Access →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: '#0A2342', padding: '4.5rem 2rem' }}>
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          {[
            { number: '14', label: 'Service Hubs' },
            { number: '50+', label: 'API Integrations' },
            { number: '4', label: 'Transport Modes' },
            { number: '1', label: 'Unified Platform' },
          ].map(({ number, label }) => (
            <div key={label}>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: '#F59E0B', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                {number}
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Personas Section */}
      <section id="about" style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Who Uses ULIP
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0A2342', letterSpacing: '-0.02em' }}>
              Built For Everyone
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {personas.map(({ emoji, title, desc }) => (
              <div
                key={title}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.75rem 1.375rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{emoji}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A2342', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A2342', color: 'rgba(255,255,255,0.65)', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '3rem',
              paddingBottom: '2.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ color: '#F59E0B' }}>
                  <AshokaChakra size={30} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>ULIP</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)' }}>Unified Logistics Interface Platform</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.75, maxWidth: '22rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                A Ministry of Commerce &amp; Industry initiative operated by NICDC Logistics Data Services Limited
                to unify India&apos;s logistics data ecosystem.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Platform
              </h4>
              {['API Docs', 'Services', 'About ULIP', 'Contact Us'].map((link) => (
                <a key={link} href="#" style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '0.625rem' }}>
                  {link}
                </a>
              ))}
            </div>

            <div>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Legal
              </h4>
              {['Privacy Policy', 'Terms of Service', 'Data Protection', 'Disclaimer'].map((link) => (
                <a key={link} href="#" style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '0.625rem' }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              paddingTop: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              © 2025 NICDC Logistics Data Services Limited | Government of India
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={13} style={{ color: '#10B981' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
