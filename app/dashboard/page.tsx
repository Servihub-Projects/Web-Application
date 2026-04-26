import { redirect } from 'next/navigation';
import { DollarSign, Briefcase, CheckCircle2, Star, TrendingUp, Clock, ShieldCheck, Users } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getDashboardMetrics, getBookings } from '@/src/lib/data';
import MetricCard from '@/src/components/dashboard/shared/metric-card';
import {
  cn,
  formatPrice,
  formatDate,
  bookingStatusLabel,
  bookingStatusColor,
  initials,
} from '@/src/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [metrics, bookings] = await Promise.all([
    getDashboardMetrics(user.id, user.role),
    getBookings(user.id, user.role),
  ]);

  const recentBookings = bookings.slice(0, 5);
  const isClient = user.role === 'CLIENT';

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">
          Good {getGreeting()}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          {isClient
            ? "Here's an overview of your hires and spending."
            : "Here's an overview of your bookings and earnings."}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isClient ? (
            <>
              <MetricCard
                label="Active Hires"
                value={metrics.activeBookings}
                icon={Briefcase}
                accent="orange"
              />
              <MetricCard
                label="Total Spent"
                value={formatPrice(metrics.totalSpent ?? 0, user.preferredCurrency)}
                icon={DollarSign}
                accent="green"
              />
              <MetricCard
                label="Jobs Completed"
                value={metrics.completedJobs ?? 0}
                icon={CheckCircle2}
                accent="blue"
                sub="Finished &amp; released"
              />
              <MetricCard
                label="In Escrow"
                value={formatPrice(metrics.escrowBalance ?? 0, user.preferredCurrency)}
                icon={ShieldCheck}
                accent="purple"
                sub="Funds held securely"
              />
            </>
          ) : (
            <>
              <MetricCard
                label="Active Bookings"
                value={metrics.activeBookings}
                icon={Briefcase}
                accent="orange"
              />
              <MetricCard
                label="Total Earned"
                value={formatPrice(metrics.totalEarned ?? 0, user.preferredCurrency)}
                icon={DollarSign}
                accent="green"
              />
              <MetricCard
                label="Average Rating"
                value={metrics.averageRating?.toFixed(2) ?? '—'}
                icon={Star}
                accent="amber"
              />
              <MetricCard
                label="Completion Rate"
                value={`${metrics.completionRate ?? 0}%`}
                icon={TrendingUp}
                accent="blue"
              />
            </>
          )}
        </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent bookings */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)]">
            <h2 className="text-sm font-semibold text-[var(--dash-text)]">
              {isClient ? 'Recent Hires' : 'Recent Bookings'}
            </h2>
            <Link
              href={isClient ? '/dashboard/my-hires' : '/dashboard/bookings'}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              View all →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[var(--dash-text-muted)]">
                No bookings yet.{' '}
                {isClient && (
                  <Link href="/dashboard/discover" className="text-orange-500">
                    Discover providers
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[var(--dash-border)]">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--dash-bg)] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                      {isClient
                        ? initials(booking.provider?.name ?? 'P')
                        : initials(booking.client?.name ?? 'C')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                        {booking.service.title}
                      </p>
                      <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                        {isClient ? booking.provider?.name : booking.client?.name} · {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={cn(
                          'inline-block text-xs font-medium px-2 py-0.5 rounded-full border',
                          bookingStatusColor(booking.status)
                        )}
                      >
                        {bookingStatusLabel(booking.status)}
                      </span>
                      <p className="text-xs font-semibold text-[var(--dash-text)] mt-1">
                        {formatPrice(booking.totalAmount, user.preferredCurrency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-3">Quick actions</h2>
            <div className="space-y-2">
              {isClient ? (
                <>
                  <Link
                    href="/dashboard/discover"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--dash-text)] hover:bg-[var(--dash-bg)] transition-colors"
                  >
                    <Users size={15} className="text-orange-500" />
                    Find a provider
                  </Link>
                  <Link
                    href="/dashboard/my-hires"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--dash-text)] hover:bg-[var(--dash-bg)] transition-colors"
                  >
                    <Briefcase size={15} className="text-blue-500" />
                    Manage hires
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--dash-text)] hover:bg-[var(--dash-bg)] transition-colors"
                  >
                    <Clock size={15} className="text-orange-500" />
                    Review pending bookings
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--dash-text)] hover:bg-[var(--dash-bg)] transition-colors"
                  >
                    <TrendingUp size={15} className="text-green-500" />
                    View analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Escrow/earnings summary */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-3">
              {isClient ? 'Escrow summary' : 'Payout summary'}
            </h2>
            {isClient ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--dash-text-muted)]">Held in escrow</span>
                  <span className="font-semibold text-[var(--dash-text)]">
                    {formatPrice(metrics.escrowBalance ?? 0, user.preferredCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--dash-text-muted)]">Total spent</span>
                  <span className="font-semibold text-[var(--dash-text)]">
                    {formatPrice(metrics.totalSpent ?? 0, user.preferredCurrency)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--dash-text-muted)]">Pending release</span>
                  <span className="font-semibold text-amber-500">
                    {formatPrice(metrics.pendingPayouts ?? 0, user.preferredCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--dash-text-muted)]">This month</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(metrics.monthlyEarnings ?? 0, user.preferredCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--dash-text-muted)]">All time</span>
                  <span className="font-semibold text-[var(--dash-text)]">
                    {formatPrice(metrics.totalEarned ?? 0, user.preferredCurrency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
