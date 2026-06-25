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
    PROPOSAL_SENT: 'Proposal Sent',
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    DECLINED: 'Declined',
    CANCELLED: 'Cancelled',
    DISPUTED: 'Disputed',
  };
  return labels[status];
}

export function bookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    PROPOSAL_SENT: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/60',
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900/60',
    ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/60',
    IN_PROGRESS: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/60',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:border-green-900/60',
    DECLINED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-red-900/60',
    CANCELLED: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700',
    DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60',
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
