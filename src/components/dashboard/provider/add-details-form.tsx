'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  MapPin,
  Sparkles,
  Tags,
  X,
} from 'lucide-react';
import { updateProviderDetailsAction } from '@/src/actions/provider-details';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import {
  mergeSelectedOptions,
  PRICE_TYPES,
  SERVICE_CATEGORIES,
  type MultiSelectOption,
  type ProviderDetailsDefaults,
  type ProviderDetailsOptions,
} from '@/src/lib/provider-details';
import { cn } from '@/src/lib/utils';
import type { CurrencyCode } from '@/src/lib/types';

function numberString(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number.`)
    .refine((value) => Number(value) >= min, `${label} must be at least ${min}.`)
    .refine((value) => Number(value) <= max, `${label} must be ${max} or less.`);
}

const schema = z.object({
  bio: z.string().trim().min(30, 'Professional description must be at least 30 characters.').max(700),
  yearsOfExperience: numberString('Years of experience', 0, 60).refine(
    (value) => Number.isInteger(Number(value)),
    'Years of experience must be a whole number.'
  ),
  hourlyRate: numberString('Hourly rate', 1, 100_000_000),
  skills: z.array(z.string().trim().min(1)).min(1, 'Select at least one service offered.').max(12),
  location: z.string().trim().min(1, 'Select your work location.'),
  serviceTitles: z.array(z.string().trim().min(5)).min(1, 'Select at least one service title.').max(8),
  serviceDescription: z.string().trim().min(20, 'Service description must be at least 20 characters.').max(1000),
  category: z.enum(SERVICE_CATEGORIES),
  price: numberString('Starting price', 1, 1_000_000_000),
  priceType: z.enum(['FIXED', 'HOURLY']),
  deliveryTime: numberString('Delivery time', 1, 365).refine(
    (value) => Number.isInteger(Number(value)),
    'Delivery time must be a whole number.'
  ),
  tags: z.array(z.string().trim().min(1)).max(12),
});

type FormValues = z.infer<typeof schema>;

function Field({
  label,
  icon: Icon,
  error,
  htmlFor,
  children,
}: {
  label: string;
  icon?: typeof BriefcaseBusiness;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-orange-500" />}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function MultiSelect({
  id,
  options,
  selected,
  placeholder,
  onChange,
}: {
  id: string;
  options: MultiSelectOption[];
  selected: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(selected);

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  }

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="input-field flex min-h-11 items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--dash-text)]">
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 text-[var(--dash-text-muted)] transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/30"
            >
              <span className="truncate">{value}</span>
              <button
                type="button"
                onClick={() => toggle(value)}
                className="rounded-full p-0.5 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                aria-label={`Remove ${value}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-xl">
          <div className="app-scrollbar max-h-64 overflow-y-auto p-2">
            {options.map((option) => {
              const active = selectedSet.has(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30'
                      : 'text-[var(--dash-text)] hover:bg-[var(--dash-bg)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                      active ? 'border-orange-500 bg-orange-500 text-white' : 'border-[var(--dash-border)]'
                    )}
                  >
                    {active && <Check size={12} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-[var(--dash-border)] px-3 py-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddProviderDetailsForm({
  defaults,
  options,
  currencyCode,
  isCompleted,
}: {
  defaults: ProviderDetailsDefaults;
  options: ProviderDetailsOptions;
  currencyCode: CurrencyCode;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const serviceOptions = mergeSelectedOptions(options.servicesOffered, defaults.skills);
  const titleOptions = mergeSelectedOptions(options.serviceTitles, defaults.serviceTitles);
  const tagOptions = mergeSelectedOptions(options.serviceTags, defaults.tags);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: defaults.bio,
      yearsOfExperience: defaults.yearsOfExperience,
      hourlyRate: defaults.hourlyRate,
      skills: defaults.skills,
      location: defaults.location,
      serviceTitles: defaults.serviceTitles,
      serviceDescription: defaults.serviceDescription,
      category: defaults.category as FormValues['category'],
      price: defaults.price,
      priceType: defaults.priceType,
      deliveryTime: defaults.deliveryTime,
      tags: defaults.tags,
    },
  });

  const priceType = useWatch({ control, name: 'priceType' });
  const selectedSkills = useWatch({ control, name: 'skills' }) ?? [];
  const selectedServiceTitles = useWatch({ control, name: 'serviceTitles' }) ?? [];
  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];

  const onSubmit = (data: FormValues) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('bio', data.bio);
      fd.append('yearsOfExperience', data.yearsOfExperience);
      fd.append('hourlyRate', data.hourlyRate);
      data.skills.forEach((skill) => fd.append('skills', skill));
      fd.append('location', data.location);
      data.serviceTitles.forEach((title) => fd.append('serviceTitles', title));
      fd.append('serviceDescription', data.serviceDescription);
      fd.append('category', data.category);
      fd.append('price', data.price);
      fd.append('priceType', data.priceType);
      fd.append('deliveryTime', data.deliveryTime);
      data.tags.forEach((tag) => fd.append('tags', tag));

      const result = await updateProviderDetailsAction(fd);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="card overflow-visible">
      <div className="border-b border-[var(--dash-border)] px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--dash-text)]">Professional profile</h2>
            <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
              Add the details clients use to understand your work.
            </p>
          </div>
          {isCompleted && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30">
              <BadgeCheck size={13} />
              Details saved
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Services offered"
            icon={Sparkles}
            error={errors.skills?.message}
            htmlFor="provider-skills"
          >
            <MultiSelect
              id="provider-skills"
              options={serviceOptions}
              selected={selectedSkills}
              placeholder="Select services"
              onChange={(values) => setValue('skills', values, { shouldDirty: true, shouldValidate: true })}
            />
          </Field>

          <Field
            label="Work location"
            icon={MapPin}
            error={errors.location?.message}
            htmlFor="provider-location"
          >
            <select id="provider-location" className="input-field text-sm" {...register('location')}>
              <option value="">Select city</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Years of experience"
            icon={Clock3}
            error={errors.yearsOfExperience?.message}
            htmlFor="provider-experience"
          >
            <input
              id="provider-experience"
              type="number"
              min={0}
              max={60}
              className="input-field"
              placeholder="5"
              {...register('yearsOfExperience')}
            />
          </Field>

          <Field
            label={`Usual hourly rate (${currencyCode})`}
            error={errors.hourlyRate?.message}
            htmlFor="provider-hourly-rate"
          >
            <input
              id="provider-hourly-rate"
              type="number"
              min={1}
              step="any"
              className="input-field"
              placeholder="9000"
              {...register('hourlyRate')}
            />
          </Field>
        </div>

        <Field
          label="Short professional description"
          error={errors.bio?.message}
          htmlFor="provider-bio"
        >
          <textarea
            id="provider-bio"
            rows={4}
            className="input-field resize-none"
            placeholder="Describe your background, standards, certifications, and the type of clients you serve."
            {...register('bio')}
          />
        </Field>

        <div className="border-t border-[var(--dash-border)] pt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[var(--dash-text)]">Service listings</h2>
            <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
              Selected titles are saved as active services clients can discover and book.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Service title"
                icon={BriefcaseBusiness}
                error={errors.serviceTitles?.message}
                htmlFor="service-title"
              >
                <MultiSelect
                  id="service-title"
                  options={titleOptions}
                  selected={selectedServiceTitles}
                  placeholder="Select service titles"
                  onChange={(values) =>
                    setValue('serviceTitles', values, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </Field>

              <Field
                label="Specialization"
                icon={Tags}
                error={errors.category?.message}
                htmlFor="service-category"
              >
                <select id="service-category" className="input-field text-sm" {...register('category')}>
                  <option value="">Select category</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Service description"
              error={errors.serviceDescription?.message}
              htmlFor="service-description"
            >
              <textarea
                id="service-description"
                rows={4}
                className="input-field resize-none"
                placeholder="Explain what is included, your process, materials, guarantees, and timelines."
                {...register('serviceDescription')}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={`Starting price (${currencyCode})`} error={errors.price?.message} htmlFor="service-price">
                <input
                  id="service-price"
                  type="number"
                  min={1}
                  step={500}
                  className="input-field"
                  placeholder="50000"
                  {...register('price')}
                />
              </Field>

              <Field label="Price type" error={errors.priceType?.message}>
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('priceType', option.value, { shouldValidate: true })}
                      className={cn(
                        'min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors',
                        priceType === option.value
                          ? 'border-orange-400 bg-orange-50 text-orange-700 ring-1 ring-orange-400 dark:bg-orange-950/30'
                          : 'border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-bg)]'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Delivery time (days)" error={errors.deliveryTime?.message} htmlFor="service-delivery">
                <input
                  id="service-delivery"
                  type="number"
                  min={1}
                  max={365}
                  className="input-field"
                  placeholder="7"
                  {...register('deliveryTime')}
                />
              </Field>
            </div>

            <Field label="Search tags" error={errors.tags?.message} htmlFor="service-tags">
              <MultiSelect
                id="service-tags"
                options={tagOptions}
                selected={selectedTags}
                placeholder="Select search tags"
                onChange={(values) => setValue('tags', values, { shouldDirty: true, shouldValidate: true })}
              />
              <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
                Leave blank to use your services offered.
              </p>
            </Field>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--dash-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary flex min-h-10 items-center justify-center gap-2 px-5"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isCompleted ? 'Save changes' : 'Complete profile'}
        </button>
      </div>
    </form>
  );
}
