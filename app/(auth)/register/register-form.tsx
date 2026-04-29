'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Briefcase, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { useRegister } from '@/src/hooks/useAuth';
import { CURRENCIES, NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import type { CurrencyCode, UserRole } from '@/src/lib/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['CLIENT', 'PROVIDER']),
  preferredCurrency: z.enum(['NGN', 'USD']),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const roles: { value: UserRole; label: string; description: string; icon: typeof User }[] = [
  { value: 'CLIENT', label: 'Client', description: 'I want to hire professionals', icon: User },
  { value: 'PROVIDER', label: 'Provider', description: 'I want to offer my services', icon: Briefcase },
];

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { authRegister, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT', preferredCurrency: 'NGN' },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: FormValues) => {
    authRegister(
      data.name,
      data.email,
      data.password,
      data.role,
      data.preferredCurrency as CurrencyCode,
      data.location || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Role selector */}
      <div>
        <label className="label">I am a…</label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value)}
              className={cn(
                'flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all',
                selectedRole === value
                  ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-400'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={15} className={selectedRole === value ? 'text-orange-500' : 'text-gray-400'} />
                <span className={cn('text-sm font-medium', selectedRole === value ? 'text-orange-700' : 'text-gray-700')}>
                  {label}
                </span>
              </div>
              <span className="text-xs text-gray-500">{description}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('role')} />
      </div>

      <div>
        <label htmlFor="name" className="label">Full name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Amaka Okonkwo"
          className="input-field"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="input-field"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="input-field pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {/* Currency + Location row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="preferredCurrency" className="label">Currency</label>
          <select
            id="preferredCurrency"
            className="input-field text-sm"
            {...register('preferredCurrency')}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="label">Location <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            id="location"
            className="input-field text-sm"
            {...register('location')}
          >
            <option value="">Select city</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        By creating an account you agree to our{' '}
        <span className="text-orange-500 cursor-pointer">Terms</span> and{' '}
        <span className="text-orange-500 cursor-pointer">Privacy Policy</span>.
      </p>
    </form>
  );
}
