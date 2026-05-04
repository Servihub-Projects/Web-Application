import { cookies } from 'next/headers';
import type { SessionUser } from '@/src/lib/types';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from './session-constants';
import { encodeSessionUser, parseSessionToken } from './session-token-node';

export { SESSION_COOKIE_NAME } from './session-constants';

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return parseSessionToken(raw);
}

export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, encodeSessionUser(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
