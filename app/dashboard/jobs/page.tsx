import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getClientJobs } from '@/src/lib/data';
import JobsList from '@/src/components/dashboard/client/jobs-list';

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'CLIENT') redirect('/dashboard');

  const jobs = await getClientJobs(user.id);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">My Jobs</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          {jobs.filter((j) => j.status === 'OPEN').length} open ·{' '}
          {jobs.length} total listing{jobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <JobsList jobs={jobs} />
    </div>
  );
}
