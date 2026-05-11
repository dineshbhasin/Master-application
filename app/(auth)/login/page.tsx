'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, ChevronDown } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  token: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showTokenField, setShowTokenField] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', token: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      token: data.token ?? '',
      redirect: false,
    });

    setIsLoading(false);

    if (result?.ok) {
      router.push('/dashboard');
      return;
    }

    const errMsg = result?.error ?? 'Login failed. Please try again.';

    if (errMsg === '2FA_REQUIRED' || errMsg.toLowerCase().includes('2fa') || errMsg.toLowerCase().includes('two-factor')) {
      setShowTokenField(true);
      setServerError('Your account has 2FA enabled. Please enter your authentication token below.');
      return;
    }

    setServerError(errMsg === 'CredentialsSignin' ? 'Invalid email or password.' : errMsg);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0A2342', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
          Sign in to your ULIP account
        </p>
      </div>

      {serverError && (
        <div
          style={{
            background: showTokenField ? '#FEF3C7' : '#FEE2E2',
            border: `1px solid ${showTokenField ? '#FCD34D' : '#FECACA'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: showTokenField ? '#92400E' : '#B91C1C',
            lineHeight: 1.5,
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Email */}
        <div>
          <label className="ulip-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="ulip-input"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
            style={errors.email ? { borderColor: '#EF4444' } : undefined}
          />
          {errors.email && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <label className="ulip-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}
            >
              Forgot Password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="ulip-input"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
              style={{
                paddingRight: '2.75rem',
                ...(errors.password ? { borderColor: '#EF4444' } : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 2FA Token Toggle */}
        {!showTokenField && (
          <button
            type="button"
            onClick={() => setShowTokenField(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              fontSize: '0.8125rem',
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              padding: '0.25rem 0',
              width: 'fit-content',
            }}
          >
            <KeyRound size={14} />
            I have a 2FA token
            <ChevronDown size={14} />
          </button>
        )}

        {/* 2FA Token Field */}
        {showTokenField && (
          <div className="animate-fade-in">
            <label className="ulip-label" htmlFor="token">
              2FA Authentication Token
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <KeyRound size={14} />
              </div>
              <input
                id="token"
                type="text"
                className="ulip-input"
                placeholder="6-digit code"
                maxLength={6}
                inputMode="numeric"
                {...register('token')}
                style={{ paddingLeft: '2.5rem', letterSpacing: '0.15em', fontWeight: 600 }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem', marginBottom: 0 }}>
              Enter the code from your authenticator app.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="ulip-btn-primary"
          disabled={isLoading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.8125rem', fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem' }}
        >
          {isLoading ? (
            <>
              <style>{`@keyframes s{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <span
                style={{
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '9999px',
                  animation: 's 0.7s linear infinite',
                }}
              />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#0A2342', fontWeight: 700, textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>

      <div style={{ marginTop: '1.75rem', padding: '0.875rem', background: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
          This is a Government of India platform. Unauthorised access is prohibited.
          All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
