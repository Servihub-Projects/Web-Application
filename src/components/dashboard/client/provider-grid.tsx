'use client';

import { useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProviderCard from './provider-card';
import EmptyState from '../shared/empty-state';
import { ProviderCardSkeleton } from '../shared/skeletons';
import { useCurrency } from '@/src/hooks/useCurrency';
import { NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import type { ServiceCategory, ServiceWithProvider } from '@/src/lib/types';

interface ProviderGridProps {
  services: ServiceWithProvider[];
}

const CATEGORIES: ServiceCategory[] = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Painting',
  'Masonry',
  'Interior Design',
  'Landscaping',
  'Cleaning',
  'Security',
  'HVAC',
  'Roofing',
  'Tiling',
];

// Price ranges in NGN (base currency)
const PRICE_RANGES = [
  { labelKey: 'any',    min: undefined,  max: undefined  },
  { labelKey: 'u10k',   min: 0,          max: 10_000     },
  { labelKey: 'u50k',   min: 10_000,     max: 50_000     },
  { labelKey: 'u150k',  min: 50_000,     max: 150_000    },
  { labelKey: 'over',   min: 150_000,    max: undefined  },
];

export default function ProviderGrid({ services }: ProviderGridProps) {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState<ServiceCategory | ''>('');
  const [location, setLocation]   = useState('');
  const [priceRange, setPriceRange] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [isPending] = useTransition();

  const format = useCurrency((s) => s.format);

  const priceLabels = [
    'Any price',
    `Under ${format(10_000)}`,
    `${format(10_000)} – ${format(50_000)}`,
    `${format(50_000)} – ${format(150_000)}`,
    `Over ${format(150_000)}`,
  ];

  const { min, max } = PRICE_RANGES[priceRange];

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    if (
      q &&
      !s.title.toLowerCase().includes(q) &&
      !s.description.toLowerCase().includes(q) &&
      !s.tags.some((t) => t.toLowerCase().includes(q)) &&
      !s.provider.name.toLowerCase().includes(q)
    )
      return false;
    if (category && s.category !== category) return false;
    if (location && s.provider.location !== location) return false;
    if (min !== undefined && s.price < min) return false;
    if (max !== undefined && s.price > max) return false;
    if (minRating > 0 && (s.provider.rating ?? 0) < minRating) return false;
    return true;
  });

  const hasFilters = search || category || location || priceRange !== 0 || minRating > 0;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setPriceRange(0);
    setMinRating(0);
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" />
          <input
            type="text"
            placeholder="Search services, trades, providers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-9"
          />
        </div>
      </div>

      {/* Filter row */}
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
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="input-field w-auto text-sm"
        >
          {priceLabels.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="input-field w-auto text-sm"
        >
          <option value={0}>Any rating</option>
          <option value={4}>4+ stars</option>
          <option value={4.5}>4.5+ stars</option>
          <option value={4.8}>4.8+ stars</option>
        </select>
      </div>

      {/* Active filter summary */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-[var(--dash-text-muted)]" />
          <span className="text-xs text-[var(--dash-text-muted)]">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/30">
              {location}
              <button onClick={() => setLocation('')} className="ml-0.5">×</button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 ml-1"
          >
            <X size={12} />
            Clear all
          </button>
        </div>
      )}

      {/* Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No services found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{ label: 'Clear filters', href: '/dashboard/discover' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <ProviderCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
