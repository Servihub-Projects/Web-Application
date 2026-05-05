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

  const notifications = await getNotifications(user.id);

  return (
    <div className="flex h-screen bg-[var(--dash-bg)] overflow-hidden">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar user={user} notifications={notifications} />

        <main className="flex-1 overflow-y-auto p-6 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
