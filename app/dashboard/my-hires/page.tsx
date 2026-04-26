import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getBookings } from '@/src/lib/data';
import MyHires from '@/src/components/dashboard/client/my-hires';

export default async function MyHiresPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'CLIENT') redirect('/dashboard');

  const bookings = await getBookings(user.id, 'CLIENT');

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">My Hires</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
        </p>
      </div>

      <MyHires bookings={bookings} />
    </div>
  );
}
