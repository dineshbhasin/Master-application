import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'navy' | 'saffron' | 'emerald' | 'red';
}

const colorMap = {
  navy: { bg: '#EEF2F7', icon: '#0A2342', text: '#0A2342' },
  saffron: { bg: '#FEF3C7', icon: '#D97706', text: '#D97706' },
  emerald: { bg: '#D1FAE5', icon: '#059669', text: '#059669' },
  red: { bg: '#FEE2E2', icon: '#DC2626', text: '#DC2626' },
};

export function StatCard({ title, value, subtitle, icon, trend, color = 'navy' }: StatCardProps) {
  const palette = colorMap[color];
  const isPositive = trend && trend.value >= 0;

  return (
    <div className="ulip-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748B', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0A2342', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>{subtitle}</p>
          )}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: isPositive ? '#059669' : '#DC2626',
                }}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{trend.label}</span>
            </div>
          )}
        </div>
        <div
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '10px',
            backgroundColor: palette.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.icon,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
