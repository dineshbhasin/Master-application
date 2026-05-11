'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const roles = [
  { value: 'citizen', label: 'Citizen / Driver' },
  { value: 'sme', label: 'SME Logistics Provider' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'government', label: 'Government Official' },
] as const;

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    role: z.enum(['citizen', 'sme', 'enterprise', 'government'], 'Select your role'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { level: 'weak' | 'medium' | 'strong'; score: number } {
  if (!password) return { level: 'weak', score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'weak', score };
  if (score <= 4) return { level: 'medium', score };
  return { level: 'strong', score };
}

const strengthConfig = {
  weak: { color: '#EF4444', label: 'Weak', bars: 1 },
  medium: { color: '#F59E0B', label: 'Medium', bars: 2 },
  strong: { color: '#10B981', label: 'Strong', bars: 3 },
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '', organization: '', role: undefined },
  });

  const watchedPassword = watch('password', '');
  const strength = getPasswordStrength(watchedPassword);
  const strConfig = strengthConfig[strength.level];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          organization: data.organization,
          role: data.role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? json.message ?? 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0A2342', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
          Create Your Account
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
          Join India&apos;s Unified Logistics Platform
        </p>
      </div>

      {serverError && (
        <div
          style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: '#B91C1C',
            lineHeight: 1.5,
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Full Name */}
        <div>
          <label className="ulip-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="ulip-input"
            placeholder="Rajesh Kumar"
            autoComplete="name"
            {...register('name')}
            style={errors.name ? { borderColor: '#EF4444' } : undefined}
          />
          {errors.name && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>{errors.name.message}</p>
          )}
        </div>

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
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="ulip-label" htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="ulip-input"
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...register('password')}
              style={{ paddingRight: '2.75rem', ...(errors.password ? { borderColor: '#EF4444' } : {}) }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength Indicator */}
          {watchedPassword.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '9999px',
                      background: bar <= strConfig.bars ? strConfig.color : '#E2E8F0',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: strConfig.color, margin: 0, fontWeight: 600 }}>
                {strConfig.label} password
              </p>
            </div>
          )}

          {errors.password && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="ulip-label" htmlFor="confirmPassword">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              className="ulip-input"
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              style={{ paddingRight: '2.75rem', ...(errors.confirmPassword ? { borderColor: '#EF4444' } : {}) }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="ulip-label" htmlFor="role">Role</label>
          <select
            id="role"
            className="ulip-input"
            {...register('role')}
            style={errors.role ? { borderColor: '#EF4444' } : undefined}
          >
            <option value="">Select your role</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {errors.role && (
            <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', marginBottom: 0 }}>{errors.role.message}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="ulip-label" htmlFor="phone">
            Phone Number <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            className="ulip-input"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            {...register('phone')}
          />
        </div>

        {/* Organization (optional) */}
        <div>
          <label className="ulip-label" htmlFor="organization">
            Organisation <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optional)</span>
          </label>
          <input
            id="organization"
            type="text"
            className="ulip-input"
            placeholder="Your company or ministry"
            {...register('organization')}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="ulip-btn-accent"
          disabled={isLoading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.8125rem', fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.375rem' }}
        >
          {isLoading ? (
            <>
              <style>{`@keyframes rs{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <span
                style={{
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(10,35,66,0.3)',
                  borderTopColor: '#0A2342',
                  borderRadius: '9999px',
                  animation: 'rs 0.7s linear infinite',
                }}
              />
              Creating Account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0A2342', fontWeight: 700, textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>

      <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
          By registering, you agree to the ULIP Terms of Service and Privacy Policy.
          This platform is governed by the DPDP Act 2023.
        </p>
      </div>
    </div>
  );
}
