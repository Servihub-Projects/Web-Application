import { create } from 'zustand';
import type { SessionUser } from '@/src/lib/types';

type MeResponse = { user: SessionUser | null };

type LoginResponse = { user: SessionUser } | { error: string };

type AuthState = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  reset: () => void;
};

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  reset: () => set({ user: null, isAuthenticated: false, loading: false }),

  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
      const data = (await readJsonSafe(res)) as MeResponse | null;
      const user = data && 'user' in data ? data.user : null;
      set({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = (await readJsonSafe(res)) as LoginResponse | null;
      if (!res.ok || !data || !('user' in data)) {
        const msg = data && 'error' in data ? data.error : 'Sign in failed.';
        return { ok: false, error: msg };
      }
      set({ user: data.user, isAuthenticated: true });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Something went wrong.' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* clear client state even if the request fails */
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
