import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getServices } from '@/src/lib/data';
import ProviderGrid from '@/src/components/dashboard/client/provider-grid';
import type { ServiceCategory } from '@/src/lib/types';

// Price range index → min/max pairs (must match ProviderGrid's PRICE_RANGES)
const PRICE_RANGES = [
  { min: undefined, max: undefined },
  { min: 0, max: 10_000 },
  { min: 10_000, max: 50_000 },
  { min: 50_000, max: 150_000 },
  { min: 150_000, max: undefined },
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
];

function parseCategory(value?: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.includes(value as ServiceCategory)
    ? (value as ServiceCategory)
    : undefined;
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    location?: string;
    priceRange?: string;
    minRating?: string;
    search?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'CLIENT') redirect('/dashboard');

  const { page, category, location, priceRange, minRating, search } = await searchParams;

  const rawPriceIndex = Number(priceRange ?? 0);
  const priceIndex = Number.isInteger(rawPriceIndex)
    ? Math.min(Math.max(rawPriceIndex, 0), PRICE_RANGES.length - 1)
    : 0;
  const { min, max } = PRICE_RANGES[priceIndex];
  const pageNumber = Math.max(Number(page) || 1, 1);

  const data = await getServices({
    page: pageNumber,
    pageSize: 12,
    category: parseCategory(category),
    location,
    minPrice: min,
    maxPrice: max,
    minRating: minRating ? Number(minRating) : undefined,
    search,
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Discover Providers</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Browse {data.total} services from verified professionals.
        </p>
      </div>
      <ProviderGrid initialData={data} />
    </div>
  );
}
