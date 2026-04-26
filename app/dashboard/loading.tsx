export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 h-[100px]">
            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-700 mb-3" />
            <div className="h-6 w-16 rounded bg-gray-100 dark:bg-gray-700 mb-1" />
            <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Content blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 h-64">
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-700 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--dash-border)] last:border-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-700" />
                <div className="h-2.5 w-24 rounded bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="card p-5 h-64">
          <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
