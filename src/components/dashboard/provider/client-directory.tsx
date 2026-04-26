'use client';

import { useState } from 'react';
import { Search, MapPin, Clock, SlidersHorizontal, X, Users } from 'lucide-react';
import { cn, timeAgo, initials } from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import EmptyState from '../shared/empty-state';
import type { JobRequestWithClient, ServiceCategory, JobUrgency } from '@/src/lib/types';

interface ClientDirectoryProps {
  jobRequests: JobRequestWithClient[];
}

const CATEGORIES: ServiceCategory[] = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
];

const URGENCY_CONFIG: Record<JobUrgency, { label: string; color: string }> = {
  FLEXIBLE:    { label: 'Flexible',     color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  WITHIN_WEEK: { label: 'Within a week', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' },
  URGENT:      { label: 'Urgent',       color: 'bg-red-50 text-red-600 dark:bg-red-950/30' },
};

export default function ClientDirectory({ jobRequests }: ClientDirectoryProps) {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency]   = useState<JobUrgency | ''>('');
  const format = useCurrency((s) => s.format);

  const filtered = jobRequests.filter((req) => {
    if (category && req.category !== category) return false;
    if (location && req.location !== location) return false;
    if (urgency && req.urgency !== urgency) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !req.title.toLowerCase().includes(q) &&
        !req.description.toLowerCase().includes(q) &&
        !req.category.toLowerCase().includes(q) &&
        !req.client.name.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const hasFilters = search || category || location || urgency;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setUrgency('');
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" />
        <input
          type="text"
          placeholder="Search job requests by title, category, or client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ServiceCategory | '')}
          className="input-field w-auto text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="">All locations</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as JobUrgency | '')}
          className="input-field w-auto text-sm"
        >
          <option value="">Any urgency</option>
          <option value="URGENT">Urgent</option>
          <option value="WITHIN_WEEK">Within a week</option>
          <option value="FLEXIBLE">Flexible</option>
        </select>
      </div>

      {/* Active filter summary */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-[var(--dash-text-muted)]" />
          <span className="text-xs text-[var(--dash-text-muted)]">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 ml-1"
          >
            <X size={12} />
            Clear all
          </button>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No job requests found"
          description="Adjust your filters or check back later — new client requests are posted regularly."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const urgencyMeta = URGENCY_CONFIG[req.urgency];
            return (
              <div key={req.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Client avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                    {initials(req.client.name)}
                  </div>

                  {/* Main content */}
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
                        <MapPin size={11} />
                        <span>{req.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{timeAgo(req.createdAt)}</span>
                      </div>
                      <span>by {req.client.name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--dash-border)] flex justify-end">
                  <button className="btn-primary text-sm px-5 py-2">
                    Send Proposal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
