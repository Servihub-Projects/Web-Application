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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar user={user} notifications={notifications} />

        <main className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
