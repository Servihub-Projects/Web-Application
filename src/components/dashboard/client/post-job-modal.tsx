'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, BriefcaseBusiness } from 'lucide-react';
import { createJobAction } from '@/src/actions/jobs';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';

const SERVICE_CATEGORIES = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
] as const;

const URGENCY_OPTIONS = [
  { value: 'FLEXIBLE',    label: 'Flexible',       description: 'No fixed timeline' },
  { value: 'WITHIN_WEEK', label: 'Within a week',  description: 'Need it soon' },
  { value: 'URGENT',      label: 'Urgent',          description: 'ASAP' },
] as const;

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  category: z.enum(SERVICE_CATEGORIES),
  description: z.string().min(20, 'Describe the job (min 20 characters).').max(1000),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  location: z.string().min(1, 'Select a location.'),
  urgency: z.enum(['FLEXIBLE', 'WITHIN_WEEK', 'URGENT']),
});

type FormValues = z.infer<typeof schema>;

interface PostJobModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostJobModal({ onClose, onSuccess }: PostJobModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: 'FLEXIBLE' },
  });

  const urgency = watch('urgency');

  const onSubmit = (data: FormValues) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description);
      fd.append('category', data.category);
      if (data.budgetMin) fd.append('budgetMin', data.budgetMin);
      if (data.budgetMax) fd.append('budgetMax', data.budgetMax);
      fd.append('location', data.location);
      fd.append('urgency', data.urgency);

      const result = await createJobAction(fd);
      if ('error' in result) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-lg bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <BriefcaseBusiness size={16} className="text-orange-500" />
            <h3 className="text-base font-semibold text-[var(--dash-text)]">Post a Job</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5">
          <form id="post-job-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="pj-title" className="label">Job title</label>
              <input
                id="pj-title"
                type="text"
                placeholder="e.g. Plumbing repairs for 3-bedroom flat"
                className="input-field"
                {...register('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            {/* Category + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pj-category" className="label">Category</label>
                <select id="pj-category" className="input-field text-sm" {...register('category')}>
                  <option value="">Select category…</option>
                  {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
              </div>
              <div>
                <label htmlFor="pj-location" className="label">Location</label>
                <select id="pj-location" className="input-field text-sm" {...register('location')}>
                  <option value="">Select city…</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="pj-description" className="label">Description</label>
              <textarea
                id="pj-description"
                rows={4}
                className="input-field resize-none"
                placeholder="Describe the work needed, any special requirements, preferred timeline, access details…"
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            {/* Budget */}
            <div>
              <label className="label">Budget range (₦) <span className="text-[var(--dash-text-muted)] font-normal text-xs">optional</span></label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Min"
                    className="input-field"
                    {...register('budgetMin')}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Max"
                    className="input-field"
                    {...register('budgetMax')}
                  />
                  {errors.budgetMax && <p className="mt-1 text-xs text-red-600">{errors.budgetMax.message}</p>}
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="label">Timeline</label>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_OPTIONS.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('urgency', value)}
                    className={`flex flex-col gap-0.5 p-3 rounded-lg border text-left transition-all ${
                      urgency === value
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 ring-1 ring-orange-400'
                        : 'border-[var(--dash-border)] hover:border-[var(--dash-text-muted)]'
                    }`}
                  >
                    <span className={`text-xs font-semibold ${urgency === value ? 'text-orange-600' : 'text-[var(--dash-text)]'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-[var(--dash-text-muted)]">{description}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[var(--dash-border)] flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            form="post-job-form"
            disabled={isPending}
            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Post job
          </button>
        </div>
      </div>
    </div>
  );
}
