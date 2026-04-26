'use client';

import { useState, useTransition } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  cn,
  formatDate,
  timeAgo,
  bookingStatusLabel,
  bookingStatusColor,
  initials,
} from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import EmptyState from '../shared/empty-state';
import { acceptBookingAction, declineBookingAction } from '@/src/actions/booking';
import type { BookingWithDetails, BookingStatus } from '@/src/lib/types';

interface BookingQueueProps {
  bookings: BookingWithDetails[];
}

const STATUS_FILTERS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Awaiting Release', value: 'COMPLETED' },
  { label: 'Complete', value: 'RELEASED' },
];

export default function BookingQueue({ bookings: initial }: BookingQueueProps) {
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [isPending, startTransition] = useTransition();
  const format = useCurrency((s) => s.format);

  const filtered =
    filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const handleAccept = (id: string) => {
    startTransition(async () => {
      const result = await acceptBookingAction(id);
      if (result.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'ESCROW_PAID' as BookingStatus } : b))
        );
        toast.success('Booking accepted. Client notified.');
      } else {
        toast.error(result.error ?? 'Something went wrong.');
      }
    });
  };

  const handleDecline = (id: string) => {
    startTransition(async () => {
      const result = await declineBookingAction(id);
      if (result.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'DECLINED' as BookingStatus } : b))
        );
        toast.success('Booking declined.');
      } else {
        toast.error(result.error ?? 'Something went wrong.');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-[var(--dash-bg)] rounded-lg p-1 w-fit flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              filter === value
                ? 'bg-white dark:bg-[var(--dash-card)] text-[var(--dash-text)] shadow-sm'
                : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]'
            )}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-60">
              {value === 'ALL'
                ? bookings.length
                : bookings.filter((b) => b.status === value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Queue */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No bookings here"
          description="Bookings in this status will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {booking.client && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                      {initials(booking.client.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--dash-text)] truncate">
                      {booking.service.title}
                    </p>
                    <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
                      {booking.client?.name} · {timeAgo(booking.createdAt)}
                    </p>
                    <p className="text-sm text-[var(--dash-text-muted)] mt-2 line-clamp-2">
                      {booking.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-full border',
                      bookingStatusColor(booking.status)
                    )}
                  >
                    {bookingStatusLabel(booking.status)}
                  </span>
                  <span className="text-base font-bold text-[var(--dash-text)]">
                    {format(booking.totalAmount)}
                  </span>
                  <span className="text-xs text-[var(--dash-text-muted)]">
                    {formatDate(booking.startDate)}
                  </span>
                </div>
              </div>

              {/* Escrow info */}
              {(booking.status === 'IN_PROGRESS' || booking.status === 'ESCROW_PAID') && (
                <div className="mt-3 pt-3 border-t border-[var(--dash-border)] flex gap-4 text-xs text-[var(--dash-text-muted)]">
                  <span>
                    50% upfront:{' '}
                    <span className={cn('font-medium', booking.upfrontPaid ? 'text-green-600' : 'text-[var(--dash-text)]')}>
                      {booking.upfrontPaid ? `Paid (${format(booking.totalAmount * 0.5)})` : 'Pending'}
                    </span>
                  </span>
                  <span>
                    Platform fee:{' '}
                    <span className="font-medium text-[var(--dash-text)]">
                      {format(booking.platformFee)}
                    </span>
                  </span>
                </div>
              )}

              {/* Actions */}
              {booking.status === 'PENDING' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAccept(booking.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(booking.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
