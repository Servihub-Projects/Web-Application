import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getServices } from '@/src/lib/data';
import ProviderGrid from '@/src/components/dashboard/client/provider-grid';

// Price range index → min/max pairs (must match ProviderGrid's PRICE_RANGES)
const PRICE_RANGES = [
  { min: undefined, max: undefined },
  { min: 0, max: 10_000 },
  { min: 10_000, max: 50_000 },
  { min: 50_000, max: 150_000 },
  { min: 150_000, max: undefined },
];

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

  const { page, category, location, priceRange, minRating, search } = await searchParams; // 👈

  const priceIndex = Math.min(Number(priceRange ?? 0), PRICE_RANGES.length - 1);
  const { min, max } = PRICE_RANGES[priceIndex];

  const data = await getServices({
    page: page ? Number(page) : 1,
    pageSize: 12,
    category: category as any,
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
