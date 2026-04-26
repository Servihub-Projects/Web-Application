import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getBookings } from '@/src/lib/data';
import BookingQueue from '@/src/components/dashboard/provider/booking-queue';

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const bookings = await getBookings(user.id, 'PROVIDER');

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Booking Queue</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          {bookings.filter((b) => b.status === 'PENDING').length} pending · {bookings.length} total
        </p>
      </div>

      <BookingQueue bookings={bookings} />
    </div>
  );
}
