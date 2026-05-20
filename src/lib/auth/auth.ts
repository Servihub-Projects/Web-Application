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

type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  yearsOfExperience?: number | null;
  hourlyRate?: number | null;
  skills?: string[] | null;
  preferredCurrency?: CurrencyCode | null;
  location?: string | null;
  providerDetailsCompleted?: boolean | null;
};

function providerDetailsAreComplete(user: AuthUserRecord): boolean {
  if (user.role !== 'PROVIDER') return true;
  if (typeof user.providerDetailsCompleted === 'boolean') return user.providerDetailsCompleted;
  return Boolean(user.bio && user.location && user.skills && user.skills.length > 0);
}

function toSessionUser(user: AuthUserRecord): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar ?? undefined,
    bio: user.bio ?? undefined,
    yearsOfExperience: user.yearsOfExperience ?? undefined,
    hourlyRate: user.hourlyRate ?? undefined,
    skills: user.skills ?? undefined,
    preferredCurrency: user.preferredCurrency ?? 'NGN',
    location: user.location ?? undefined,
    providerDetailsCompleted: providerDetailsAreComplete(user),
  };
}

async function getPrismaForAuth() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import('@/src/lib/prisma');
  return prisma;
}

async function loginWithMockUser(email: string, password: string): Promise<LoginResult> {
  const user = MOCK_USERS.find((u) => u.email === email);

  const hashToTest = user?.passwordHash ?? MOCK_USERS[0].passwordHash;
  const valid = await bcrypt.compare(password, hashToTest);

  if (!user || !valid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const session = toSessionUser(user);
  await setSession(session);
  return { success: true, user: session };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const prisma = await getPrismaForAuth();

  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return { success: false, error: 'Invalid email or password.' };

        const session = toSessionUser(user);
        await setSession(session);
        return { success: true, user: session };
      }
    } catch {
      return { success: false, error: 'Unable to sign in right now.' };
    }
  }

  return loginWithMockUser(email, password);
}

export async function register(payload: RegisterPayload): Promise<LoginResult> {
  const prisma = await getPrismaForAuth();

  if (prisma) {
    try {
      const exists = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true },
      });

      if (exists) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const user = await prisma.user.create({
        data: {
          email: payload.email,
          passwordHash: await bcrypt.hash(payload.password, 12),
          name: payload.name,
          role: payload.role,
          preferredCurrency: payload.preferredCurrency,
          location: payload.location,
          skills: [],
          providerDetailsCompleted: payload.role !== 'PROVIDER',
        },
      });

      const session = toSessionUser(user);
      await setSession(session);
      return { success: true, user: session };
    } catch {
      return { success: false, error: 'Unable to create account right now.' };
    }
  }

  const exists = MOCK_USERS.some((u) => u.email === payload.email);

  if (exists) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const mockUser = {
    id: `user_${Date.now()}`,
    email: payload.email,
    passwordHash: await bcrypt.hash(payload.password, 12),
    name: payload.name,
    role: payload.role,
    preferredCurrency: payload.preferredCurrency,
    location: payload.location,
    skills: [],
    isVerified: false,
    providerDetailsCompleted: payload.role !== 'PROVIDER',
    createdAt: new Date().toISOString(),
  };

  MOCK_USERS.push(mockUser);
  const session = toSessionUser(mockUser);
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
