'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { setSession } from '@/src/lib/auth/session';
import { MOCK_USERS } from '@/src/lib/constants/mockData';
import type { CurrencyCode } from '@/src/lib/types';

export type ProfileActionResult = { error: string } | { success: true };

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(60),
  email: z.string().email('Enter a valid email address.'),
  location: z.string().optional(),
  preferredCurrency: z.enum(['NGN', 'USD', 'GBP', 'EUR', 'GHS']).default('NGN'),
  bio: z.string().max(300, 'Bio must be under 300 characters.').optional(),
});

export async function updateProfileAction(formData: FormData): Promise<ProfileActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    location: formData.get('location') || undefined,
    preferredCurrency: formData.get('preferredCurrency') ?? 'NGN',
    bio: formData.get('bio') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const { name, email, location, preferredCurrency, bio } = parsed.data;

  const emailTaken = MOCK_USERS.some((u) => u.email === email && u.id !== user.id);
  if (emailTaken) return { error: 'That email address is already in use.' };

  // In production: await prisma.user.update({ where: { id: user.id }, data: { name, email, location, preferredCurrency, bio } });
  await setSession({ ...user, name, email, location, preferredCurrency: preferredCurrency as CurrencyCode, bio });
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export async function changePasswordAction(formData: FormData): Promise<ProfileActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const mockUser = MOCK_USERS.find((u) => u.id === user.id);
  if (!mockUser) return { error: 'User not found.' };

  const valid = await bcrypt.compare(parsed.data.currentPassword, mockUser.passwordHash);
  if (!valid) return { error: 'Incorrect current password.' };

  // In production: await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  mockUser.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  return { success: true };
}
