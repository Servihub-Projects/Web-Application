import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { BadgeCheck, BriefcaseBusiness } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/auth/auth';
import {
  getProviderDetailsDefaults,
  getProviderDetailsOptions,
} from '@/src/lib/data/provider-details';
import AddProviderDetailsForm from '@/src/components/dashboard/provider/add-details-form';

export const metadata: Metadata = {
  title: 'Add Provider Details',
};

export default async function AddProviderDetailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/add-details');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const [defaults, options] = await Promise.all([
    getProviderDetailsDefaults(user),
    getProviderDetailsOptions(),
  ]);
  const isCompleted = user.providerDetailsCompleted === true;

  return (
    <main className="min-h-screen bg-[var(--dash-bg)] px-4 py-5 text-[var(--dash-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="ServiHub"
              width={32}
              height={32}
              className="rounded-md dark:mix-blend-multiply"
            />
            <span className="text-sm font-semibold text-[var(--dash-text)]">ServiHub</span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--dash-border)] bg-[var(--dash-card)] px-3 py-1.5 text-xs font-medium text-[var(--dash-text-muted)] sm:inline-flex">
            <BriefcaseBusiness size={14} className="text-orange-500" />
            Provider setup
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30">
              <BriefcaseBusiness size={14} />
              Add details
            </div>
            <h1 className="text-2xl font-bold text-[var(--dash-text)] sm:text-3xl">
              Complete your professional profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-text-muted)]">
              Select your services, set your work location, and create service listings before entering your dashboard.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-4 lg:w-auto">
            <BadgeCheck size={18} className="flex-shrink-0 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-[var(--dash-text)]">
                {isCompleted ? 'Profile ready' : 'One step left'}
              </p>
              <p className="text-xs text-[var(--dash-text-muted)]">
                {isCompleted ? 'You can update these details anytime.' : 'You will go to your dashboard after saving.'}
              </p>
            </div>
          </div>
        </div>

        <AddProviderDetailsForm
          defaults={defaults}
          options={options}
          currencyCode={user.preferredCurrency}
          isCompleted={isCompleted}
        />
      </div>
    </main>
  );
}
