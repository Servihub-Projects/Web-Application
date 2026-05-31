'use client';

import { useState, useTransition } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../shared/modal';
import { sendProposalAction } from '@/src/actions/booking';
import { useCurrency } from '@/src/hooks/useCurrency';
import type { JobRequestWithClient } from '@/src/lib/types';

interface SendProposalModalProps {
  job: JobRequestWithClient;
  onClose: () => void;
  onSent: (jobId: string) => void;
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function SendProposalModal({ job, onClose, onSent }: SendProposalModalProps) {
  const format = useCurrency((s) => s.format);
  const currency = useCurrency((s) => s.currency);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(String(job.budgetMin));
  const [startDate, setStartDate] = useState(tomorrowIso());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendProposalAction({
        jobRequestId: job.id,
        message: message.trim(),
        amount: Number(amount),
        startDate,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSent(job.id);
      toast.success(`Proposal sent to ${job.client.name}.`);
      onClose();
    });
  };

  return (
    <Modal title="Send a proposal" description={job.title} onClose={() => !isPending && onClose()}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 text-xs text-[var(--dash-text-muted)]">
          <Wallet size={14} className="flex-shrink-0 text-orange-500" />
          <span>
            Client budget: {format(job.budgetMin)} – {format(job.budgetMax)}
          </span>
        </div>

        <div>
          <label htmlFor="proposal-message" className="label">
            Your proposal
          </label>
          <textarea
            id="proposal-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, outline your approach, and explain why you're a great fit."
            className="input-field resize-none"
            maxLength={1000}
          />
          <p className="mt-1 text-right text-xs text-[var(--dash-text-muted)]">
            {message.trim().length}/1000
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="proposal-amount" className="label">
              Your quote ({currency})
            </label>
            <input
              id="proposal-amount"
              type="number"
              min={1}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="proposal-start" className="label">
              Earliest start
            </label>
            <input
              id="proposal-start"
              type="date"
              min={tomorrowIso()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
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
            Send proposal
          </button>
        </div>
      </form>
    </Modal>
  );
}
