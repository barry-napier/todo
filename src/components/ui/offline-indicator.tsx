'use client';

import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';

export function OfflineIndicator() {
  const { isOnline, pendingSyncCount, hasPendingSync, retrySync } = useNetworkStatus();

  if (isOnline && !hasPendingSync) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className={`${isOnline ? 'bg-yellow-500' : 'bg-gray-800'} text-white px-4 py-2`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isOnline && (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>
                <span className="text-sm font-medium">
                  You&apos;re offline - changes will sync when reconnected
                </span>
              </>
            )}

            {isOnline && hasPendingSync && (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Syncing {pendingSyncCount} pending {pendingSyncCount === 1 ? 'change' : 'changes'}
                  ...
                </span>
              </>
            )}
          </div>

          {isOnline && hasPendingSync && (
            <Button size="sm" variant="secondary" onClick={retrySync} className="text-xs">
              Retry Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkStatusBadge() {
  const { isOnline, pendingSyncCount } = useNetworkStatus();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {pendingSyncCount > 0 && (
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
          {pendingSyncCount} pending
        </div>
      )}
    </div>
  );
}
