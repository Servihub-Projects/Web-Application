'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../shared/modal';
import { hireProviderAction } from '@/src/actions/booking';
import { useCurrency } from '@/src/hooks/useCurrency';
import { bookingStatusColor, bookingStatusLabel, cn, formatPrice } from '@/src/lib/utils';
import type { BookingStatus, CurrencyCode } from '@/src/lib/types';

interface ExistingBooking {
  id: string;
  status: BookingStatus;
}

interface HireProviderPanelProps {
  serviceId: string;
  providerName: string;
  serviceTitle: string;
  defaultAmount: number;
  priceType: 'FIXED' | 'HOURLY';
  currencyCode: CurrencyCode;
  existingBooking: ExistingBooking | null;
}

// Default the start date to tomorrow so the date input is never in the past.
function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function HireProviderPanel({
  serviceId,
  providerName,
  serviceTitle,
  defaultAmount,
  priceType,
  currencyCode,
  existingBooking,
}: HireProviderPanelProps) {
  const router = useRouter();
  const format = useCurrency((s) => s.format);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(String(defaultAmount));
  const [startDate, setStartDate] = useState(tomorrowIso());

  const numericAmount = Number(amount);
  const feeEstimate = Number.isFinite(numericAmount) ? Math.round(numericAmount * 0.1) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await hireProviderAction({
        serviceId,
        description: description.trim(),
        totalAmount: numericAmount,
        startDate,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      toast.success(`Request sent to ${providerName}. You'll be notified when they respond.`);
      router.push('/dashboard/my-hires');
      router.refresh();
    });
  };

  // Already engaged with this provider for this service — surface state, not a duplicate CTA.
  if (existingBooking) {
    return (
      <section
        id="hire"
        className="scroll-mt-24 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--dash-text)]">Booking in progress</h3>
            <p className="mt-1 text-sm text-[var(--dash-text-muted)]">
              You already have a booking with {providerName} for this service.
            </p>
          </div>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
              bookingStatusColor(existingBooking.status)
            )}
          >
            {bookingStatusLabel(existingBooking.status)}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard/my-hires"
            className="btn-primary inline-flex min-h-11 flex-1 items-center justify-center px-4 py-2.5 text-center text-sm sm:flex-none"
          >
            View my hires
          </Link>
          <Link
            href="/dashboard/messages"
            className="btn-secondary inline-flex min-h-11 flex-1 items-center justify-center gap-2 px-4 py-2.5 text-center text-sm sm:flex-none"
          >
            <MessageSquare size={16} />
            Message provider
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="hire"
        className="scroll-mt-24 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4 sm:p-5"
      >
        <h3 className="text-base font-semibold text-[var(--dash-text)]">Hire {providerName}</h3>
        <p className="mt-1 text-sm text-[var(--dash-text-muted)]">
          Send a booking request with your job details. {providerName} can accept or decline, and
          you can track everything under My Hires.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-2 px-4 py-2.5 text-center text-sm sm:flex-none"
          >
            <CheckCircle2 size={16} />
            Hire provider
          </button>
          <Link
            href="/dashboard/messages"
            className="btn-secondary inline-flex min-h-11 flex-1 items-center justify-center gap-2 px-4 py-2.5 text-center text-sm sm:flex-none"
          >
            <MessageSquare size={16} />
            Message first
          </Link>
        </div>
      </section>

      {open && (
        <Modal
          title={`Hire ${providerName}`}
          description={serviceTitle}
          onClose={() => !isPending && setOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="hire-description" className="label">
                Job details
              </label>
              <textarea
                id="hire-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the work, location, and any specific requirements."
                className="input-field resize-none"
                maxLength={1000}
              />
              <p className="mt-1 text-right text-xs text-[var(--dash-text-muted)]">
                {description.trim().length}/1000
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hire-amount" className="label">
                  Agreed amount ({currencyCode})
                </label>
                <input
                  id="hire-amount"
                  type="number"
                  min={1}
                  step={priceType === 'HOURLY' ? 500 : 1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                />
                <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
                  Listed: {format(defaultAmount)}
                  {priceType === 'HOURLY' ? '/hr' : ' fixed'}
                </p>
              </div>

              <div>
                <label htmlFor="hire-start" className="label">
                  Preferred start
                </label>
                <input
                  id="hire-start"
                  type="date"
                  min={tomorrowIso()}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] px-3 py-2.5 text-xs text-[var(--dash-text-muted)]">
              <Clock size={14} className="flex-shrink-0 text-orange-500" />
              <span>
                Includes an estimated {formatPrice(feeEstimate, 'NGN')} platform fee (10%), settled
                on completion.
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="btn-secondary min-h-10 px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary inline-flex min-h-10 items-center justify-center gap-2 px-5 text-sm"
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                Send hire request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
