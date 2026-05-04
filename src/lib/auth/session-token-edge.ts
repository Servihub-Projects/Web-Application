import type { SessionUser } from '@/src/lib/types';
import { getSessionSecret } from './session-secret';

function timingSafeEqualAscii(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const u = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (b64.length % 4)) % 4;
  const bin = atob(b64 + '='.repeat(padding));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

let hmacKey: Promise<CryptoKey> | null = null;

function getHmacKey(): Promise<CryptoKey> {
  if (!hmacKey) {
    hmacKey = crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  }
  return hmacKey;
}

async function signPayload(payload: string): Promise<string> {
  const key = await getHmacKey();
  const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64Url(buf);
}

export async function parseSessionTokenEdge(token: string): Promise<SessionUser | null> {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await signPayload(payload);
  if (!timingSafeEqualAscii(expected, sig)) return null;

  try {
    const bytes = base64UrlToBytes(payload);
    return JSON.parse(new TextDecoder().decode(bytes)) as SessionUser;
  } catch {
    return null;
  }
}
