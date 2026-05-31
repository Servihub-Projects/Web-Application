'use client';

import { useMemo, useState, useTransition } from 'react';
import { Briefcase, CheckCircle, Inbox, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  cn,
  formatDate,
  bookingStatusLabel,
  bookingStatusColor,
  initials,
} from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import EmptyState from '../shared/empty-state';
import {
  acceptProposalAction,
  cancelBookingAction,
  completeJobAction,
  rejectProposalAction,
} from '@/src/actions/booking';
import type { BookingStatus, BookingWithDetails } from '@/src/lib/types';

interface MyHiresProps {
  bookings: BookingWithDetails[];
}

export default function MyHires({ bookings: initial }: MyHiresProps) {
  const format = useCurrency((s) => s.format);
  const [bookings, setBookings] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const proposals = useMemo(
    () => bookings.filter((b) => b.status === 'PROPOSAL_SENT'),
    [bookings]
  );
  const others = useMemo(
    () => bookings.filter((b) => b.status !== 'PROPOSAL_SENT'),
    [bookings]
  );

  // Optimistically patch a row's status and run the matching server action.
  const run = (
    id: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
    nextStatus: BookingStatus,
    successMessage: string
  ) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await action(id);
      if (result.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b))
        );
        toast.success(successMessage);
      } else {
        toast.error(result.error ?? 'Something went wrong.');
      }
      setPendingId(null);
    });
  };

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
    <div className="space-y-6">
      {/* Incoming proposals — providers responding to your job requests */}
      {proposals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-[var(--dash-text)]">
              Proposals for review
              <span className="ml-1.5 text-xs font-normal text-[var(--dash-text-muted)]">
                ({proposals.length})
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {proposals.map((proposal) => {
              const isRowPending = pendingId === proposal.id;
              return (
                <div
                  key={proposal.id}
                  className="card border-purple-200 p-5 dark:border-purple-900/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {proposal.provider && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-950/40">
                          {initials(proposal.provider.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--dash-text)]">
                          {proposal.jobRequestTitle ?? proposal.service.title}
                        </p>
                        <p className="mt-0.5 text-sm text-[var(--dash-text-muted)]">
                          Proposal from {proposal.provider?.name ?? 'a provider'}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-[var(--dash-text)]">
                      {format(proposal.totalAmount)}
                    </span>
                  </div>

                  {proposal.proposalMessage && (
                    <p className="mt-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 text-sm leading-relaxed text-[var(--dash-text-muted)]">
                      {proposal.proposalMessage}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        run(proposal.id, acceptProposalAction, 'ACCEPTED', 'Proposal accepted. Provider notified.')
                      }
                      disabled={isRowPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/30 dark:hover:bg-green-950/50"
                    >
                      {isRowPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Accept proposal
                    </button>
                    <button
                      onClick={() =>
                        run(proposal.id, rejectProposalAction, 'DECLINED', 'Proposal declined.')
                      }
                      disabled={isRowPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                    >
                      <XCircle size={14} />
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All bookings */}
      {others.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--dash-text-muted)]">
                    Service
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--dash-text-muted)] md:table-cell">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--dash-text-muted)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--dash-text-muted)]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--dash-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)]">
                {others.map((booking) => {
                  const isRowPending = pendingId === booking.id;
                  const canCancel = booking.status === 'PENDING' || booking.status === 'ACCEPTED';
                  const canComplete =
                    booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS';

                  return (
                    <tr key={booking.id} className="transition-colors hover:bg-[var(--dash-bg)]">
                      <td className="px-4 py-3.5">
                        <p className="line-clamp-1 font-medium text-[var(--dash-text)]">
                          {booking.service.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--dash-text-muted)]">
                          {booking.service.category} · {formatDate(booking.createdAt)}
                        </p>
                      </td>

                      <td className="hidden px-4 py-3.5 md:table-cell">
                        {booking.provider && (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-950/40">
                              {initials(booking.provider.name)}
                            </div>
                            <span className="text-[var(--dash-text)]">{booking.provider.name}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                            bookingStatusColor(booking.status)
                          )}
                        >
                          {bookingStatusLabel(booking.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold text-[var(--dash-text)]">
                        {format(booking.totalAmount)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          {canComplete && (
                            <button
                              onClick={() =>
                                run(booking.id, completeJobAction, 'COMPLETED', 'Marked complete.')
                              }
                              disabled={isRowPending}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50 dark:hover:bg-green-950/30"
                            >
                              {isRowPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                              Complete
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() =>
                                run(booking.id, cancelBookingAction, 'CANCELLED', 'Booking cancelled.')
                              }
                              disabled={isRowPending}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                            >
                              <XCircle size={13} />
                              Cancel
                            </button>
                          )}
                          {!canCancel && !canComplete && (
                            <span className="text-xs text-[var(--dash-text-muted)]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
