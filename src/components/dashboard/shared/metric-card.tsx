import type { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Accent = 'orange' | 'green' | 'blue' | 'purple' | 'amber';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  accent?: Accent;
  sub?: string;
}

const accentMap: Record<Accent, { wrap: string; icon: string }> = {
  orange: { wrap: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-500' },
  green:  { wrap: 'bg-green-50 dark:bg-green-950/30',   icon: 'text-green-600' },
  blue:   { wrap: 'bg-blue-50 dark:bg-blue-950/30',     icon: 'text-blue-500' },
  purple: { wrap: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-500' },
  amber:  { wrap: 'bg-amber-50 dark:bg-amber-950/30',   icon: 'text-amber-500' },
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'orange',
  sub,
}: MetricCardProps) {
  const { wrap, icon } = accentMap[accent];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', wrap)}>
          <Icon size={17} className={icon} />
        </div>

        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.isPositive
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30'
            )}
          >
            {trend.isPositive ? '+' : '−'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold text-[var(--dash-text)] tracking-tight">{value}</p>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[var(--dash-text-muted)] mt-1 opacity-75">{sub}</p>}
      </div>
    </div>
  );
}
