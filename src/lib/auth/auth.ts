import bcrypt from 'bcryptjs';
import { cache } from 'react';
import { MOCK_USERS } from '@/src/lib/constants/mockData';
import { getSession, setSession, clearSession } from './session';
import type { SessionUser, UserRole, CurrencyCode } from '@/src/lib/types';

type LoginResult =
  | { success: true; user: SessionUser }
  | { success: false; error: string };

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  preferredCurrency: CurrencyCode;
  location?: string;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = MOCK_USERS.find((u) => u.email === email);

  // Always run bcrypt regardless of whether the user exists.
  // Skipping it when the user is not found creates a timing difference that
  // lets an attacker enumerate valid email addresses.
  const hashToTest = user?.passwordHash ?? MOCK_USERS[0].passwordHash;
  const valid = await bcrypt.compare(password, hashToTest);

  if (!user || !valid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    preferredCurrency: user.preferredCurrency ?? 'NGN',
    location: user.location,
  };

  await setSession(session);
  return { success: true, user: session };
}

export async function register(payload: RegisterPayload): Promise<LoginResult> {
  const exists = MOCK_USERS.some((u) => u.email === payload.email);

  if (exists) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  // In production: hash password, persist user to DB, then set session.
  const session: SessionUser = {
    id: `user_${Date.now()}`,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    preferredCurrency: payload.preferredCurrency,
    location: payload.location,
  };

  await setSession(session);
  return { success: true, user: session };
}

// cache() deduplicates this call within a single React render pass.
// Layout + page both call this; without cache() each call re-reads and
// re-verifies the cookie independently.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  return getSession();
});

export async function logout(): Promise<void> {
  await clearSession();
}
