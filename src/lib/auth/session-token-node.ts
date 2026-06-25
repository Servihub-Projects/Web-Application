import { createHmac, timingSafeEqual } from 'crypto';
import type { SessionUser } from '@/src/lib/types';
import { getSessionSecret } from './session-secret';

function signPayload(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function encodeSessionUser(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
}

export function parseSessionToken(token: string): SessionUser | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = signPayload(payload);

  try {
    const a = Buffer.from(expected, 'ascii');
    const b = Buffer.from(sig, 'ascii');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as SessionUser;
  } catch {
    return null;
  }
}
