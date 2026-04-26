'use client';

import { bookingStatusColor, bookingStatusLabel } from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import type { BookingWithDetails, DashboardMetrics } from '@/src/lib/types';

interface AnalyticsChartsProps {
  metrics: DashboardMetrics;
  bookings: BookingWithDetails[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlyData(bookings: BookingWithDetails[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = MONTHS[d.getMonth()];
    const earned = bookings
      .filter(
        (b) =>
          b.status === 'RELEASED' &&
          new Date(b.createdAt).getFullYear() === d.getFullYear() &&
          new Date(b.createdAt).getMonth() === d.getMonth()
      )
      .reduce((s, b) => s + (b.totalAmount - b.platformFee), 0);
    return { label, earned };
  });
}

function buildStatusBreakdown(bookings: BookingWithDetails[]) {
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    counts[b.status] = (counts[b.status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export default function AnalyticsCharts({ metrics, bookings }: AnalyticsChartsProps) {
  const format = useCurrency((s) => s.format);
  const monthly = buildMonthlyData(bookings);
  const maxEarned = Math.max(...monthly.map((m) => m.earned), 1);
  const statusBreakdown = buildStatusBreakdown(bookings);

  return (
    <div className="space-y-5">
      {/* Earnings bar chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-1">
          Earnings — Last 6 months
        </h3>
        <p className="text-xs text-[var(--dash-text-muted)] mb-5">
          Net after platform fees
        </p>

        <div className="flex items-end gap-3 h-40">
          {monthly.map(({ label, earned }) => {
            const pct = (earned / maxEarned) * 100;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-xs font-medium text-[var(--dash-text-muted)]">
                  {earned > 0 ? format(earned) : ''}
                </span>
                <div className="w-full rounded-t-md bg-[var(--dash-bg)] overflow-hidden" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ height: `${Math.max(pct, earned > 0 ? 4 : 0)}%`, marginTop: 'auto' }}
                  />
                </div>
                <span className="text-xs text-[var(--dash-text-muted)]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking status breakdown */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-4">
          Booking breakdown
        </h3>
        <div className="space-y-3">
          {statusBreakdown.map(({ status, count }) => {
            const pct = Math.round((count / (bookings.length || 1)) * 100);
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${bookingStatusColor(status as never)}`}
                  >
                    {bookingStatusLabel(status as never)}
                  </span>
                  <span className="text-xs text-[var(--dash-text-muted)]">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--dash-bg)]">
                  <div
                    className="h-1.5 rounded-full bg-orange-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating card */}
      {metrics.averageRating && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-3">
            Reputation
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-orange-500">
              {metrics.averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 20 20"
                    className="w-4 h-4"
                    fill={i < Math.round(metrics.averageRating!) ? '#f59e0b' : '#e5e7eb'}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-[var(--dash-text-muted)]">
                {metrics.completionRate}% completion rate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
