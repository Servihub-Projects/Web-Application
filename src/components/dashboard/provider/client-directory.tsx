// src/components/dashboard/client-directory.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, MapPin, Clock, SlidersHorizontal, X, Users } from 'lucide-react';
import { cn, timeAgo, initials } from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import EmptyState from '../shared/empty-state';
import type { JobRequestWithClient, ServiceCategory, JobUrgency, PaginatedResult } from '@/src/lib/types';

interface ClientDirectoryProps {
  initialData: PaginatedResult<JobRequestWithClient>;
}

const CATEGORIES: ServiceCategory[] = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
];

const URGENCY_CONFIG: Record<JobUrgency, { label: string; color: string }> = {
  FLEXIBLE: { label: 'Flexible', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  WITHIN_WEEK: { label: 'Within a week', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' },
  URGENT: { label: 'Urgent', color: 'bg-red-50 text-red-600 dark:bg-red-950/30' },
};

// Builds a window like: [1, 2, '...', 7, 8, 9, '...', 15]
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

export default function ClientDirectory({ initialData }: ClientDirectoryProps) {
  const { items, total, page, totalPages } = initialData;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const format = useCurrency((s) => s.format);

  // Generic helper — updates one or more URL params and navigates
  const updateParams = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      if (resetPage) next.delete('page'); // always go back to page 1 when filters change
      startTransition(() => router.push(`${pathname}?${next.toString()}`));
    },
    [params, pathname, router]
  );

  const goToPage = (p: number) => updateParams({ page: String(p) }, false);

  const clearFilters = () => {
    startTransition(() => router.push(pathname));
  };

  const hasFilters = params.get('search') || params.get('category') ||
    params.get('location') || params.get('urgency');

  return (
    // Dim the list while a navigation is in flight
    <div className={cn('space-y-5 transition-opacity duration-150', isPending && 'opacity-50 pointer-events-none')}>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" />
        <input
          type="text"
          placeholder="Search job requests by title, category, or client…"
          defaultValue={params.get('search') ?? ''}
          // Debounce: only navigate after user stops typing for 400ms
          onChange={(e) => {
            const val = e.target.value;
            const timer = setTimeout(() => updateParams({ search: val }), 400);
            return () => clearTimeout(timer);
          }}
          className="input-field !pl-9"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <select
          value={params.get('category') ?? ''}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="input-field w-auto text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={params.get('location') ?? ''}
          onChange={(e) => updateParams({ location: e.target.value })}
          className="input-field w-auto text-sm"
        >
          <option value="">All locations</option>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={params.get('urgency') ?? ''}
          onChange={(e) => updateParams({ urgency: e.target.value })}
          className="input-field w-auto text-sm"
        >
          <option value="">Any urgency</option>
          <option value="URGENT">Urgent</option>
          <option value="WITHIN_WEEK">Within a week</option>
          <option value="FLEXIBLE">Flexible</option>
        </select>
      </div>

      {/* Filter summary */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-[var(--dash-text-muted)]" />
          <span className="text-xs text-[var(--dash-text-muted)]">
            {total} result{total !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 ml-1"
          >
            <X size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No job requests found"
          description="Adjust your filters or check back later."
        />
      ) : (
        <div className="space-y-3">
          {items.map((req) => {
            const urgencyMeta = URGENCY_CONFIG[req.urgency];
            return (
              <div key={req.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                    {initials(req.client.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--dash-text)] leading-snug">
                          {req.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                            {req.category}
                          </span>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', urgencyMeta.color)}>
                            {urgencyMeta.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[var(--dash-text)]">
                          {format(req.budgetMin)} – {format(req.budgetMax)}
                        </p>
                        <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">budget</p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--dash-text-muted)] mt-2 leading-relaxed line-clamp-2">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--dash-text-muted)] flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} /><span>{req.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} /><span>{timeAgo(req.createdAt)}</span>
                      </div>
                      <span>by {req.client.name}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--dash-border)] flex justify-end">
                  <button className="btn-primary text-sm px-5 py-2">Send Proposal</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}

      {/* Page position indicator */}
      {totalPages > 1 && (
        <p className="text-center text-xs text-[var(--dash-text-muted)]">
          Page {page} of {totalPages} · {total} total results
        </p>
      )}
    </div>
  );
}
