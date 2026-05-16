import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import type { BookingStatus, CurrencyCode } from '@/src/lib/types';
import { getCurrency } from '@/src/lib/constants/currencies';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// All amounts are stored in NGN. This converts to any supported currency for display.
export function formatPrice(amountInNGN: number, currency: CurrencyCode = 'NGN'): string {
  const curr = getCurrency(currency);
  const converted = amountInNGN / curr.rateToNGN;
  const decimals = currency === 'NGN' ? 0 : 2;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);
  return `${curr.symbol}${formatted}`;
}

// Legacy alias — kept for backward compat, defaults to NGN.
export function formatCurrency(amount: number): string {
  return formatPrice(amount, 'NGN');
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function bookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'Pending',
    AWAITING_PAYMENT: 'Awaiting Payment',
    ESCROW_PAID: 'Escrow Held',
    ESCROW_FUNDED: 'Escrow Funded',
    IN_PROGRESS: 'In Progress',
    PARTIALLY_RELEASED: 'Partially Released',
    COMPLETED: 'Awaiting Release',
    RELEASED: 'Complete',
    DECLINED: 'Declined',
    CANCELLED: 'Cancelled',
    DISPUTED: 'Disputed',
    REFUND_PENDING: 'Refund Pending',
    REFUNDED: 'Refunded',
  };
  return labels[status];
}

export function bookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    AWAITING_PAYMENT: 'bg-sky-50 text-sky-700 border-sky-200',
    ESCROW_PAID: 'bg-blue-50 text-blue-700 border-blue-200',
    ESCROW_FUNDED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
    PARTIALLY_RELEASED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-purple-50 text-purple-700 border-purple-200',
    RELEASED: 'bg-green-50 text-green-700 border-green-200',
    DECLINED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-slate-50 text-slate-700 border-slate-200',
    DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUND_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REFUNDED: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return colors[status];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb >= 100 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
