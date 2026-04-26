import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getJobRequests } from '@/src/lib/data';
import ClientDirectory from '@/src/components/dashboard/provider/client-directory';

export default async function FindClientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const jobRequests = await getJobRequests();

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Find Clients</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Browse {jobRequests.length} open job requests from clients looking for your skills.
        </p>
      </div>

      <ClientDirectory jobRequests={jobRequests} />
    </div>
  );
}
