import { redirect } from 'next/navigation';
import { DollarSign, TrendingUp, Star, Clock } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getDashboardMetrics, getBookings } from '@/src/lib/data';
import MetricCard from '@/src/components/dashboard/shared/metric-card';
import AnalyticsCharts from '@/src/components/dashboard/provider/analytics-charts';
import { formatPrice } from '@/src/lib/utils';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'PROVIDER') redirect('/dashboard');

  const [metrics, bookings] = await Promise.all([
    getDashboardMetrics(user.id, 'PROVIDER'),
    getBookings(user.id, 'PROVIDER'),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Analytics</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Your earnings, ratings, and performance at a glance.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Earned"
          value={formatPrice(metrics.totalEarned ?? 0, user.preferredCurrency)}
          icon={DollarSign}
          accent="green"
        />
        <MetricCard
          label="This Month"
          value={formatPrice(metrics.monthlyEarnings ?? 0, user.preferredCurrency)}
          icon={TrendingUp}
          accent="orange"
        />
        <MetricCard
          label="Average Rating"
          value={metrics.averageRating?.toFixed(2) ?? '—'}
          icon={Star}
          accent="amber"
        />
        <MetricCard
          label="Pending Payout"
          value={formatPrice(metrics.pendingPayouts ?? 0, user.preferredCurrency)}
          icon={Clock}
          accent="purple"
          sub="Awaiting client release"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts metrics={metrics} bookings={bookings} />
    </div>
  );
}
