import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getJobRequests } from '@/src/lib/data';
import ClientDirectory from '@/src/components/dashboard/provider/client-directory';
import type { JobRequestFilters, JobUrgency, ServiceCategory } from '@/src/lib/types';

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
];

const JOB_URGENCIES: JobUrgency[] = ['FLEXIBLE', 'WITHIN_WEEK', 'URGENT'];

function parseCategory(value?: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.includes(value as ServiceCategory)
    ? (value as ServiceCategory)
    : undefined;
}

function parseUrgency(value?: string): JobUrgency | undefined {
  return JOB_URGENCIES.includes(value as JobUrgency)
    ? (value as JobUrgency)
    : undefined;
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    location?: string;
    urgency?: string;
    search?: string;
  }>;
}

export default async function FindClientsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (!user) redirect('/login');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const filters: JobRequestFilters = {
    page: Math.max(Number(params.page) || 1, 1),
    pageSize: 10,
    category: parseCategory(params.category),
    location: params.location,
    urgency: parseUrgency(params.urgency),
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
