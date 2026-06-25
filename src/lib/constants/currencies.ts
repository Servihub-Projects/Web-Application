import type { CurrencyCode } from '@/src/lib/types';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateToNGN: number;
}

// Rates are approximate and for display purposes only.
// In production, replace with a live exchange rate API (e.g. Open Exchange Rates).
export const CURRENCIES: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira',   symbol: '₦', rateToNGN: 1       },
  { code: 'USD', name: 'US Dollar',        symbol: '$', rateToNGN: 1530    },
  { code: 'GBP', name: 'British Pound',    symbol: '£', rateToNGN: 1960    },
  { code: 'EUR', name: 'Euro',             symbol: '€', rateToNGN: 1670    },
  { code: 'GHS', name: 'Ghanaian Cedi',    symbol: '₵', rateToNGN: 106     },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'NGN';

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export const NIGERIAN_STATES = [
  'Lagos',
  'Abuja',
  'Kano',
  'Ibadan',
  'Port Harcourt',
  'Enugu',
  'Benin City',
  'Kaduna',
  'Aba',
  'Onitsha',
  'Owerri',
  'Warri',
  'Abeokuta',
  'Jos',
  'Calabar',
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];
