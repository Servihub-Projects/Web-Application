'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProviderCard from './provider-card';
import EmptyState from '../shared/empty-state';
import { ProviderCardSkeleton } from '../shared/skeletons';
import { useCurrency } from '@/src/hooks/useCurrency';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import { cn } from '@/src/lib/utils';
import type { ServiceCategory, ServiceWithProvider, PaginatedResult } from '@/src/lib/types';

interface ProviderGridProps {
  initialData: PaginatedResult<ServiceWithProvider>;
}

const CATEGORIES: ServiceCategory[] = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
];

const PRICE_RANGES = [
  { min: undefined, max: undefined },
  { min: 0, max: 10_000 },
  { min: 10_000, max: 50_000 },
  { min: 50_000, max: 150_000 },
  { min: 150_000, max: undefined },
];

function getPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function ProviderGrid({ initialData }: ProviderGridProps) {
  const { items, total, page, totalPages } = initialData;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const format = useCurrency((s) => s.format);

  const priceLabels = [
    'Any price',
    `Under ${format(10_000)}`,
    `${format(10_000)} – ${format(50_000)}`,
    `${format(50_000)} – ${format(150_000)}`,
    `Over ${format(150_000)}`,
  ];

  const updateParams = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v && v !== '0') next.set(k, v);
        else next.delete(k);
      });
      if (resetPage) next.delete('page');
      startTransition(() => router.push(`${pathname}?${next.toString()}`));
    },
    [params, pathname, router]
  );

  const goToPage = (p: number) => updateParams({ page: String(p) }, false);

  const clearFilters = () => startTransition(() => router.push(pathname));

  const hasFilters =
    params.get('search') ||
    params.get('category') ||
    params.get('location') ||
    params.get('priceRange') ||
    params.get('minRating');

  return (
    <div className={cn('space-y-5 transition-opacity duration-150', isPending && 'opacity-50 pointer-events-none')}>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" />
        <input
          type="text"
          placeholder="Search services, trades, providers…"
          defaultValue={params.get('search') ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            const timer = setTimeout(() => updateParams({ search: val }), 400);
            return () => clearTimeout(timer);
          }}
          className="input-field !pl-9"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          value={params.get('category') ?? ''}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="input-field text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={params.get('location') ?? ''}
          onChange={(e) => updateParams({ location: e.target.value })}
          className="input-field text-sm"
        >
          <option value="">All locations</option>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={params.get('priceRange') ?? '0'}
          onChange={(e) => updateParams({ priceRange: e.target.value })}
          className="input-field text-sm"
        >
          {priceLabels.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>

        <select
          value={params.get('minRating') ?? '0'}
          onChange={(e) => updateParams({ minRating: e.target.value })}
          className="input-field text-sm"
        >
          <option value="0">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
          <option value="4.8">4.8+ stars</option>
        </select>
      </div>

      {/* Filter summary */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-[var(--dash-text-muted)]" />
          <span className="text-xs text-[var(--dash-text-muted)]">
            {total} result{total !== 1 ? 's' : ''}
          </span>
          {params.get('location') && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/30">
              {params.get('location')}
              <button onClick={() => updateParams({ location: '' })}>×</button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 ml-1"
          >
            <X size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProviderCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No services found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{ label: 'Clear filters', href: '/dashboard/discover' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((service) => <ProviderCard key={service.id} service={service} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-1 pt-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded border border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {getPageWindow(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-[var(--dash-text-muted)] text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={cn(
                    'w-8 h-8 text-sm rounded transition-colors',
                    p === page
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'border border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-raised)]'
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded border border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          <p className="text-center text-xs text-[var(--dash-text-muted)]">
            Page {page} of {totalPages} · {total} total results
          </p>
        </>
      )}
    </div>
  );
}
