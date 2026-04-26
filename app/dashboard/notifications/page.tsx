import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getNotifications } from '@/src/lib/data';
import NotificationsView from '@/src/components/dashboard/notifications/notifications-view';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const notifications = await getNotifications(user.id);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Notifications</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
            : 'All caught up!'}
        </p>
      </div>

      <NotificationsView notifications={notifications} />
    </div>
  );
}
