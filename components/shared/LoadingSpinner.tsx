interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: { width: '1.25rem', height: '1.25rem', border: '2px' },
  md: { width: '2rem', height: '2rem', border: '2.5px' },
  lg: { width: '3rem', height: '3rem', border: '3px' },
};

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const dim = sizeMap[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <style>{`
        @keyframes ulip-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          width: dim.width,
          height: dim.height,
          borderRadius: '9999px',
          border: `${dim.border} solid #E2E8F0`,
          borderTopColor: '#0A2342',
          animation: 'ulip-spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
      {text && (
        <p
          style={{
            fontSize: '0.875rem',
            color: '#64748B',
            fontWeight: 500,
            margin: 0,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
