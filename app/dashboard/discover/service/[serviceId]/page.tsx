import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Briefcase, ChevronLeft, Clock, MapPin, Star, BadgeCheck } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getActiveBookingFor, getProvidersLastJob, getServiceById } from '@/src/lib/data';
import { bookingStatusColor, bookingStatusLabel, formatDate, formatPrice, initials } from '@/src/lib/utils';
import { HireHashScroll } from '@/src/components/dashboard/client/hire-hash-scroll';
import HireProviderPanel from '@/src/components/dashboard/client/hire-provider-panel';

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function DiscoverServiceDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'CLIENT') redirect('/dashboard');

  const { serviceId } = await params;
  const service = await getServiceById(serviceId);
  if (!service) notFound();

  const { provider } = service;
  const [lastJob, existingBooking] = await Promise.all([
    getProvidersLastJob(provider.id),
    getActiveBookingFor(user.id, service.id),
  ]);
  const priceLabel =
    service.priceType === 'HOURLY'
      ? `${formatPrice(service.price, user.preferredCurrency)}/hr`
      : `${formatPrice(service.price, user.preferredCurrency)} fixed`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 max-md:max-w-full">
      <HireHashScroll />

      <Link
        href="/dashboard/discover"
        className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-[var(--dash-text-muted)] transition-colors hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]"
      >
        <ChevronLeft size={18} className="flex-shrink-0" />
        <span className="truncate">Back to Discover</span>
      </Link>

      <div className="card overflow-hidden">
        <div className="border-b border-[var(--dash-border)] bg-[var(--dash-bg)] px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-base font-bold text-orange-600 dark:from-orange-950/50 dark:to-orange-900/50">
                {initials(provider.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-[var(--dash-text)] sm:text-xl">{provider.name}</h1>
                  {provider.isVerified && (
                    <BadgeCheck size={18} className="flex-shrink-0 text-blue-500" aria-label="Verified" />
                  )}
                </div>
                {provider.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-[var(--dash-text-muted)]">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{provider.location}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-[var(--dash-text)]">{provider.rating?.toFixed(1) ?? '—'}</span>
                  <span className="text-[var(--dash-text-muted)]">({provider.reviewCount ?? 0} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-col items-start gap-1 sm:items-end">
              <p className="text-2xl font-bold text-[var(--dash-text)]">{priceLabel}</p>
              <div className="flex items-center gap-1 text-xs text-[var(--dash-text-muted)]">
                <Clock size={12} />
                <span>{service.deliveryTime} day delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <div>
            <span className="mb-2 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-950/30">
              {service.category}
            </span>
            <h2 className="text-base font-semibold text-[var(--dash-text)] sm:text-lg">{service.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dash-text-muted)]">{service.description}</p>
          </div>

          {service.tags.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--dash-text-muted)]">Tags</p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] px-2 py-1 text-xs text-[var(--dash-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {lastJob && (
            <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Briefcase size={16} className="text-[var(--dash-text-muted)]" aria-hidden />
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--dash-text-muted)]">
                  Last job on ServiHub
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--dash-text)]">{lastJob.serviceTitle}</p>
                  <p className="mt-0.5 text-xs text-[var(--dash-text-muted)]">{lastJob.category}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--dash-text-muted)]">
                    {lastJob.description}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${bookingStatusColor(lastJob.status)}`}
                  >
                    {bookingStatusLabel(lastJob.status)}
                  </span>
                  <p className="text-xs text-[var(--dash-text-muted)]">{formatDate(lastJob.dateIso)}</p>
                </div>
              </div>
            </div>
          )}

          <HireProviderPanel
            serviceId={service.id}
            providerName={provider.name}
            serviceTitle={service.title}
            defaultAmount={service.price}
            priceType={service.priceType}
            currencyCode={user.preferredCurrency}
            existingBooking={existingBooking ? { id: existingBooking.id, status: existingBooking.status } : null}
          />
        </div>
      </div>
    </div>
  );
}
