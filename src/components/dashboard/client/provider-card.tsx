'use client';

import { MapPin, Star, BadgeCheck, Clock } from 'lucide-react';
import { cn, initials } from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import type { ServiceWithProvider } from '@/src/lib/types';

interface ProviderCardProps {
  service: ServiceWithProvider;
}

export default function ProviderCard({ service }: ProviderCardProps) {
  const { provider } = service;
  const format = useCurrency((s) => s.format);

  return (
    <div className="card p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Provider info */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
          {initials(provider.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{provider.name}</p>
            {provider.isVerified && (
              <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
            )}
          </div>
          {provider.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-[var(--dash-text-muted)]" />
              <span className="text-xs text-[var(--dash-text-muted)]">{provider.location}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-[var(--dash-text)]">
            {provider.rating?.toFixed(1) ?? '—'}
          </span>
          <span className="text-xs text-[var(--dash-text-muted)]">({provider.reviewCount ?? 0})</span>
        </div>
      </div>

      {/* Service info */}
      <div className="flex-1">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/30 mb-2">
          {service.category}
        </span>
        <h3 className="text-sm font-semibold text-[var(--dash-text)] leading-snug mb-1.5">
          {service.title}
        </h3>
        <p className="text-xs text-[var(--dash-text-muted)] line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {service.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-md bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--dash-border)]">
        <div>
          <span className="text-base font-bold text-[var(--dash-text)]">
            {format(service.price)}
          </span>
          <span className="text-xs text-[var(--dash-text-muted)] ml-1">
            {service.priceType === 'HOURLY' ? '/hr' : ' fixed'}
          </span>
        </div>
        <div className={cn('flex items-center gap-1 text-xs text-[var(--dash-text-muted)]')}>
          <Clock size={11} />
          <span>{service.deliveryTime}d delivery</span>
        </div>
      </div>

      <button className="btn-primary w-full text-sm py-2">
        View & Hire
      </button>
    </div>
  );
}
