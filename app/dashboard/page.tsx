'use client';

import { useSession } from 'next-auth/react';
import {
  Car,
  CreditCard,
  Map,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  IdCard,
  Receipt,
  Package,
  CheckSquare,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeUp: boolean;
  icon: React.ReactNode;
  accentColor: string;
}

function StatCard({ label, value, change, changeUp, icon, accentColor }: StatCardProps) {
  return (
    <div className="ulip-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#64748B' }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#0A2342' }}>
            {value}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {changeUp ? (
              <ArrowUpRight size={14} style={{ color: '#10B981' }} />
            ) : (
              <ArrowDownRight size={14} style={{ color: '#EF4444' }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: changeUp ? '#10B981' : '#EF4444' }}
            >
              {change}
            </span>
          </div>
        </div>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: `${accentColor}18`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

const statCards: StatCardProps[] = [
  {
    label: 'Vehicles Verified Today',
    value: '1,284',
    change: '12% from yesterday',
    changeUp: true,
    icon: <Car size={22} />,
    accentColor: '#0A2342',
  },
  {
    label: 'FASTag Balance Checked',
    value: '847',
    change: '3% from yesterday',
    changeUp: false,
    icon: <CreditCard size={22} />,
    accentColor: '#F59E0B',
  },
  {
    label: 'Shipments Tracked',
    value: '203',
    change: '8% from yesterday',
    changeUp: true,
    icon: <Map size={22} />,
    accentColor: '#10B981',
  },
  {
    label: 'Compliance Lookups',
    value: '156',
    change: '5% from yesterday',
    changeUp: true,
    icon: <FileCheck size={22} />,
    accentColor: '#EF4444',
  },
];

const quickAccessServices = [
  {
    icon: <Search size={20} />,
    name: 'RC Lookup',
    description: 'Verify vehicle registration details via Vahan',
    href: '/dashboard/vehicle',
    color: '#0A2342',
  },
  {
    icon: <IdCard size={20} />,
    name: 'DL Lookup',
    description: "Verify driving licence via Sarathi",
    href: '/dashboard/vehicle',
    color: '#0A2342',
  },
  {
    icon: <CreditCard size={20} />,
    name: 'FASTag Balance',
    description: 'Check live FASTag wallet balance',
    href: '/dashboard/fastag',
    color: '#F59E0B',
  },
  {
    icon: <Receipt size={20} />,
    name: 'E-Way Bill',
    description: 'Verify or generate e-way bills',
    href: '/dashboard/compliance',
    color: '#10B981',
  },
  {
    icon: <CheckSquare size={20} />,
    name: 'GSTIN Check',
    description: 'Validate GSTIN and filing status',
    href: '/dashboard/compliance',
    color: '#8B5CF6',
  },
  {
    icon: <Navigation size={20} />,
    name: 'Multimodal Track',
    description: 'Track shipments across all transport modes',
    href: '/dashboard/tracking',
    color: '#0EA5E9',
  },
];

interface ActivityItem {
  id: number;
  action: string;
  detail: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const recentActivity: ActivityItem[] = [
  { id: 1, action: 'RC Lookup', detail: 'MH12AB1234', time: '2 min ago', status: 'success' },
  { id: 2, action: 'FASTag Balance', detail: 'DL8CAB1234', time: '11 min ago', status: 'success' },
  { id: 3, action: 'GSTIN Check', detail: '27AABCU9603R1ZX', time: '34 min ago', status: 'warning' },
  { id: 4, action: 'E-Way Bill', detail: 'EWB-4121009876', time: '1 hr ago', status: 'success' },
  { id: 5, action: 'DL Lookup', detail: 'MH1120230012345', time: '2 hr ago', status: 'error' },
];

const badgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  success: { bg: '#D1FAE5', color: '#059669', label: 'Success' },
  warning: { bg: '#FEF3C7', color: '#D97706', label: 'Partial' },
  error: { bg: '#FEE2E2', color: '#DC2626', label: 'Not Found' },
  info: { bg: '#DBEAFE', color: '#2563EB', label: 'Info' },
};

interface ApiStatusRow {
  name: string;
  status: 'operational' | 'not_configured' | 'degraded';
  latency: string;
  lastChecked: string;
}

const apiStatuses: ApiStatusRow[] = [
  { name: 'Vahan (RC Lookup)', status: 'operational', latency: '142ms', lastChecked: '1 min ago' },
  { name: 'Sarathi (DL Lookup)', status: 'operational', latency: '188ms', lastChecked: '1 min ago' },
  { name: 'FASTag / NETC', status: 'operational', latency: '95ms', lastChecked: '2 min ago' },
  { name: 'E-Way Bill (NIC)', status: 'operational', latency: '210ms', lastChecked: '2 min ago' },
  { name: 'GSTN API', status: 'operational', latency: '167ms', lastChecked: '3 min ago' },
  { name: 'ICEGATE (Sea)', status: 'not_configured', latency: '—', lastChecked: '—' },
  { name: 'FOIS (Rail)', status: 'not_configured', latency: '—', lastChecked: '—' },
];

function ApiStatusBadge({ status }: { status: ApiStatusRow['status'] }) {
  if (status === 'operational')
    return (
      <span className="badge-success">
        <CheckCircle2 size={11} /> Operational
      </span>
    );
  if (status === 'not_configured')
    return (
      <span className="badge-warning">
        <AlertCircle size={11} /> Not Configured
      </span>
    );
  return (
    <span className="badge-error">
      <Activity size={11} /> Degraded
    </span>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] ?? 'there';
  const greeting = getGreeting();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0A2342' }}>
            {greeting}, {userName} 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Last login: Today at 09:14 AM &middot; IP 103.x.x.x
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0"
          style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
        >
          <Clock size={14} />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-[3fr_2fr]">
        <div className="ulip-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#0A2342' }}>
              Quick Access
            </h3>
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              6 services
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickAccessServices.map((svc) => (
              <Link
                key={svc.name}
                href={svc.href}
                className="flex items-start gap-3 p-3 rounded-xl transition-all"
                style={{ border: '1px solid #F1F5F9', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = svc.color;
                  e.currentTarget.style.backgroundColor = `${svc.color}06`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#F1F5F9';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: `${svc.color}14`,
                    color: svc.color,
                  }}
                >
                  {svc.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#0A2342' }}>
                    {svc.name}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: '#94A3B8' }}>
                    {svc.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="ulip-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#0A2342' }}>
              Recent Activity
            </h3>
            <Link
              href="/dashboard/activity"
              className="text-xs font-medium"
              style={{ color: '#F59E0B', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const badge = badgeStyles[item.status];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid #F8FAFC' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{item.action}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#94A3B8' }}>
                      {item.detail}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#CBD5E1' }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ulip-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold" style={{ color: '#0A2342' }}>
              API Status
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              Real-time health of connected government APIs
            </p>
          </div>
          <span className="badge-success">
            <CheckCircle2 size={11} /> 5/7 Operational
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['API Name', 'Status', 'Latency', 'Last Checked'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-3 font-semibold text-xs uppercase tracking-wide"
                    style={{ color: '#94A3B8' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiStatuses.map((api) => (
                <tr
                  key={api.name}
                  style={{ borderBottom: '1px solid #F8FAFC' }}
                >
                  <td className="py-3 font-medium" style={{ color: '#0A2342' }}>
                    {api.name}
                  </td>
                  <td className="py-3">
                    <ApiStatusBadge status={api.status} />
                  </td>
                  <td className="py-3 font-mono text-sm" style={{ color: '#64748B' }}>
                    {api.latency}
                  </td>
                  <td className="py-3 text-sm" style={{ color: '#94A3B8' }}>
                    {api.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
