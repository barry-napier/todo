import { Skeleton } from '@/components/ui/skeleton';

export function TodoListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading todos">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <Skeleton className="w-4 h-4 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      ))}
    </div>
  );
}
