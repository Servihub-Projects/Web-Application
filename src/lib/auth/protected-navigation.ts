'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/auth-store';

export type AppRouterPush = { push: (href: string) => void };

export async function handleProtectedRoute(
  router: AppRouterPush,
  destination: string,
  fallback: string,
): Promise<void> {
  await useAuthStore.getState().fetchUser();
  if (useAuthStore.getState().isAuthenticated) {
    router.push(destination);
  } else {
    router.push(fallback);
  }
}

export function useProtectedNavigate() {
  const router = useRouter();
  return useCallback(
    (destination: string, fallback: string) => handleProtectedRoute(router, destination, fallback),
    [router],
  );
}
