'use client';

import { useTransition, useState } from 'react';
import { loginAction, registerAction, logoutAction } from '@/src/actions/auth';
import type { CurrencyCode, UserRole } from '@/src/lib/types';
import { toast } from 'sonner';

export function useLogin() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function authLogin(email: string, password: string) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('password', password);
      const result = await loginAction(fd);
      if ('error' in result) setError(result.error);
    });
  }

  return { authLogin, isPending, error, clearError: () => setError(null) };
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
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return { submit, isPending };
}

type data = {
  email: string
}
export function useResetPassword() {
  const [isPending, startTransition] = useTransition()
  function sendResetPasswordEmail(data: data) {
    startTransition(async () => {
      try {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast.success('Password reset link sent to your email.');
      } catch (err) {
        toast.error('Something went wrong. Try again.');
      }
    })
  }

  return { sendResetPasswordEmail, isPending }
}
