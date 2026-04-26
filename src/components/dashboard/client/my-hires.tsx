'use client';

import { Briefcase } from 'lucide-react';
import {
  cn,
  formatDate,
  bookingStatusLabel,
  bookingStatusColor,
  initials,
} from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import EmptyState from '../shared/empty-state';
import type { BookingWithDetails } from '@/src/lib/types';

interface MyHiresProps {
  bookings: BookingWithDetails[];
}

export default function MyHires({ bookings }: MyHiresProps) {
  const format = useCurrency((s) => s.format);

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No hires yet"
        description="Start by discovering talented providers for your next project."
        action={{ label: 'Discover providers', href: '/dashboard/discover' }}
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
              <th className="text-left text-xs font-medium text-[var(--dash-text-muted)] uppercase tracking-wider px-4 py-3">
                Service
              </th>
              <th className="text-left text-xs font-medium text-[var(--dash-text-muted)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Provider
              </th>
              <th className="text-left text-xs font-medium text-[var(--dash-text-muted)] uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-[var(--dash-text-muted)] uppercase tracking-wider px-4 py-3">
                Amount
              </th>
              <th className="text-right text-xs font-medium text-[var(--dash-text-muted)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dash-border)]">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-[var(--dash-bg)] transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-medium text-[var(--dash-text)] line-clamp-1">
                      {booking.service.title}
                    </p>
                    <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                      {booking.service.category}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5 hidden md:table-cell">
                  {booking.provider && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                        {initials(booking.provider.name)}
                      </div>
                      <span className="text-[var(--dash-text)]">{booking.provider.name}</span>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      'inline-flex text-xs font-medium px-2.5 py-1 rounded-full border',
                      bookingStatusColor(booking.status)
                    )}
                  >
                    {bookingStatusLabel(booking.status)}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right font-semibold text-[var(--dash-text)]">
                  {format(booking.totalAmount)}
                </td>

                <td className="px-4 py-3.5 text-right text-[var(--dash-text-muted)] hidden lg:table-cell">
                  {formatDate(booking.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
