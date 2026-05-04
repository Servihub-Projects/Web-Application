'use client';

import { useTransition, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerAction } from '@/src/actions/auth';
import { useAuthStore } from '@/src/stores/auth-store';
import type { CurrencyCode, UserRole } from '@/src/lib/types';
import { toast } from 'sonner';

function postLoginRedirectPath(from: string | null): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/dashboard';
  return from;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function authLogin(email: string, password: string) {
    setError(null);
    void (async () => {
      setPending(true);
      try {
        const result = await useAuthStore.getState().login(email, password);
        if (!result.ok) setError(result.error);
        else router.push(postLoginRedirectPath(searchParams.get('from')));
      } finally {
        setPending(false);
      }
    })();
  }

  return { authLogin, isPending: pending, error, clearError: () => setError(null) };
}

export function useRegister() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function authRegister(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    preferredCurrency: CurrencyCode = 'NGN',
    location?: string
  ) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('role', role);
      fd.append('preferredCurrency', preferredCurrency);
      if (location) fd.append('location', location);
      const result = await registerAction(fd);
      if ('error' in result) setError(result.error);
    });
  }

  return { authRegister, isPending, error, clearError: () => setError(null) };
}

export function useLogout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      await useAuthStore.getState().logout();
      router.push('/');
    });
  }

  return { submit, isPending };
}

type data = {
  email: string;
};
export function useResetPassword() {
  const [isPending, startTransition] = useTransition();
  function sendResetPasswordEmail(data: data) {
    startTransition(async () => {
      try {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Password reset link sent to your email.');
      } catch {
        toast.error('Something went wrong. Try again.');
      }
    });
  }

  return { sendResetPasswordEmail, isPending };
}
