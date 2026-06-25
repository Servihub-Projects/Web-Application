'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrencyCode } from '@/src/lib/types';
import { formatPrice } from '@/src/lib/utils';

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  format: (amountInNGN: number) => string;
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'NGN',
      setCurrency: (currency) => set({ currency }),
      format: (amount) => formatPrice(amount, get().currency),
    }),
    { name: 'sh-currency' }
  )
);

export function useCurrencySync(serverCurrency?: CurrencyCode) {
  const setCurrency = useCurrency((s) => s.setCurrency);

  useEffect(() => {
    if (serverCurrency) setCurrency(serverCurrency);
  }, [serverCurrency, setCurrency]);
}
