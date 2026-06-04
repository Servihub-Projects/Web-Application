import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getNotifications } from '@/src/lib/data';
import Sidebar from '@/src/components/dashboard/sidebar';
import DashboardNavbar from '@/src/components/dashboard/navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // NOTE: The provider-onboarding gate (redirecting incomplete providers to
  // /dashboard/add-details) is handled exclusively in middleware (proxy.ts).
  // It must NOT be duplicated here: the add-details page is a child of this
  // layout, so redirecting from the layout would re-trigger the layout on the
  // target route and loop forever. Middleware can see the pathname and exempt
  // the setup page; this layout cannot.

  const notifications = await getNotifications(user.id);

  return (
    <div className="flex h-screen bg-[var(--dash-bg)] overflow-hidden">
      <Sidebar user={user} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar user={user} notifications={notifications} />

        <main className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
