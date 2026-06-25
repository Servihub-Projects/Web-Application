export function MetricCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-700 mb-3" />
      <div className="h-7 w-20 rounded bg-gray-100 dark:bg-gray-700 mb-1.5" />
      <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-700" />
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-700" />
    </div>
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-700" />
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="mt-4 h-9 rounded-lg bg-gray-100 dark:bg-gray-700" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 rounded bg-gray-100 dark:bg-gray-700" style={{ width: `${60 + (i * 13) % 30}%` }} />
        </td>
      ))}
    </tr>
  );
}
