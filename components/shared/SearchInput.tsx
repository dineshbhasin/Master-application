'use client';

import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

interface SearchInputProps {
  placeholder: string;
  onSearch: (value: string) => void;
  loading?: boolean;
  className?: string;
}

export function SearchInput({ placeholder, onSearch, loading = false, className }: SearchInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    onSearch(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <div
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <>
              <style>{`
                @keyframes search-spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '9999px',
                  border: '2px solid #E2E8F0',
                  borderTopColor: '#0A2342',
                  animation: 'search-spin 0.7s linear infinite',
                }}
              />
            </>
          ) : (
            <Search size={16} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="ulip-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
        />
      </div>
      <button
        className="ulip-btn-primary"
        onClick={handleSearch}
        disabled={loading}
        style={{ flexShrink: 0, padding: '0.625rem 1.25rem' }}
      >
        Search
      </button>
    </div>
  );
}
