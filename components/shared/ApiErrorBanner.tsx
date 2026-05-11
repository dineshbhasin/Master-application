import { AlertTriangle } from 'lucide-react';

interface ApiErrorBannerProps {
  error: string;
  message: string;
  onRetry?: () => void;
}

export function ApiErrorBanner({ error, message, onRetry }: ApiErrorBannerProps) {
  const isNotConfigured = error === 'API_NOT_CONFIGURED';

  return (
    <div className="api-error-banner animate-fade-in">
      <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, marginRight: '0.375rem' }}>{error}</span>
          {message}
        </p>
        {isNotConfigured && (
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem', color: '#A16207' }}>
            Contact your administrator to configure API credentials for this service.
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            flexShrink: 0,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#92400E',
            background: 'rgba(146,64,14,0.1)',
            border: '1px solid rgba(146,64,14,0.25)',
            borderRadius: '6px',
            padding: '0.3125rem 0.75rem',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(146,64,14,0.18)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(146,64,14,0.1)';
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
