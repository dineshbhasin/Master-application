import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '16px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#CBD5E1',
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
              size: 28,
              style: { color: '#94A3B8' },
            })
          : icon}
      </div>
      <div style={{ maxWidth: '20rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0A2342',
            margin: '0 0 0.375rem',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#64748B',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>
      {action && (
        <button className="ulip-btn-primary" onClick={action.onClick} style={{ marginTop: '0.25rem' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
