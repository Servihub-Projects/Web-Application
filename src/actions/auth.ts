'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { login, register, logout } from '@/src/lib/auth/auth';
import type { UserRole, CurrencyCode } from '@/src/lib/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['CLIENT', 'PROVIDER']),
  preferredCurrency: z.enum(['NGN', 'USD', 'GBP', 'EUR', 'GHS']).default('NGN'),
  location: z.string().optional(),
});

export type ActionResult = { error: string } | { success: true };

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const result = await login(parsed.data.email, parsed.data.password);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') as UserRole,
    preferredCurrency: (formData.get('preferredCurrency') as CurrencyCode) ?? 'NGN',
    location: formData.get('location') ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const result = await register(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/login');
}
