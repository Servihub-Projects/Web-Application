import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getServices } from '@/src/lib/data';
import ProviderGrid from '@/src/components/dashboard/client/provider-grid';

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'CLIENT') redirect('/dashboard');

  const services = await getServices();

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Discover Providers</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Browse {services.length} services from verified professionals.
        </p>
      </div>

      <ProviderGrid services={services} />
    </div>
  );
}
