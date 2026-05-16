import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getJobRequests } from '@/src/lib/data';
import ClientDirectory from '@/src/components/dashboard/provider/client-directory';
import type { JobRequestFilters } from '@/src/lib/types';

interface PageProps {
  searchParams: {
    page?: string;
    category?: string;
    location?: string;
    urgency?: string;
    search?: string;
  };
}

export default async function FindClientsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams
  if (!user) redirect('/login');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const filters: JobRequestFilters = {
    page: params.page ? Number(params.page) : 1,
    pageSize: 10,
    category: params.category as any,
    location: params.location,
    urgency: params.urgency as any,
    search: params.search,
  };

  const data = await getJobRequests(filters);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Find Clients</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Browse {data.total} open job requests from clients looking for your skills.
        </p>
      </div>
      <ClientDirectory initialData={data} />
    </div>
  );
}
