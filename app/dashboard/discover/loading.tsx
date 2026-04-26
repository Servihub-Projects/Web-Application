import { ProviderCardSkeleton } from '@/src/components/dashboard/shared/skeletons';

export default function DiscoverLoading() {
  return (
    <div className="space-y-5 max-w-7xl animate-pulse">
      <div>
        <div className="h-7 w-48 rounded bg-gray-100 dark:bg-gray-700 mb-2" />
        <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100 dark:bg-gray-700" />
        <div className="h-10 w-36 rounded-lg bg-gray-100 dark:bg-gray-700" />
        <div className="h-10 w-36 rounded-lg bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <ProviderCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
