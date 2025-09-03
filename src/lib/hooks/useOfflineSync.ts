import { useState, useEffect, useCallback } from 'react';
import { requestSync } from '../pwa';

export interface SyncableData {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingSyncCount: number;
  syncPendingData: () => Promise<void>;
  queueForSync: (data: SyncableData) => void;
  clearSyncQueue: () => void;
}

/**
 * Hook for managing offline sync functionality
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Update pending sync count from localStorage
  const updatePendingSyncCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const pendingData = localStorage.getItem('pendingSync');
      if (pendingData) {
        try {
          const parsed = JSON.parse(pendingData) as SyncableData[];
          setPendingSyncCount(parsed.length);
        } catch {
          setPendingSyncCount(0);
        }
      } else {
        setPendingSyncCount(0);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      console.log('App went online');
      setIsOnline(true);

      // Auto-sync when coming back online
      try {
        const pendingDataStr = localStorage.getItem('pendingSync');
        if (pendingDataStr) {
          // We'll handle sync in a separate effect to avoid dependency issues
          setTimeout(() => {
            syncPendingData().catch(console.error);
          }, 0);
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    const handleOffline = () => {
      console.log('App went offline');
      setIsOnline(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    updatePendingSyncCount();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingSync') {
        updatePendingSyncCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePendingSyncCount]);

  /**
   * Queue data for sync when offline
   */
  const queueForSync = useCallback(
    (data: SyncableData) => {
      if (typeof window === 'undefined') return;

      try {
        const existing = localStorage.getItem('pendingSync');
        const pendingData: SyncableData[] = existing ? JSON.parse(existing) : [];

        // Remove any existing item with the same id and action to avoid duplicates
        const filteredData = pendingData.filter(
          (item) => !(item.id === data.id && item.action === data.action)
        );

        // Add new item
        filteredData.push({
          ...data,
          timestamp: Date.now(),
        });

        localStorage.setItem('pendingSync', JSON.stringify(filteredData));
        updatePendingSyncCount();

        console.log('Data queued for sync:', data);

        // Request background sync if available
        if (isOnline) {
          requestSync('todo-sync').catch(console.error);
        }
      } catch (error) {
        console.error('Failed to queue data for sync:', error);
      }
    },
    [isOnline, updatePendingSyncCount]
  );

  /**
   * Sync pending data to server
   */
  const syncPendingData = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    const pendingDataStr = localStorage.getItem('pendingSync');
    if (!pendingDataStr) return;

    try {
      const pendingData: SyncableData[] = JSON.parse(pendingDataStr);
      if (pendingData.length === 0) return;

      console.log(`Syncing ${pendingData.length} pending items...`);

      // Group data by action for batch processing
      const grouped = pendingData.reduce(
        (acc, item) => {
          if (!acc[item.action]) {
            acc[item.action] = [];
          }
          acc[item.action].push(item);
          return acc;
        },
        {} as Record<string, SyncableData[]>
      );

      // Sync each group
      for (const [action, items] of Object.entries(grouped)) {
        try {
          await syncItemsByAction(action, items);
        } catch (error) {
          console.error(`Failed to sync ${action} items:`, error);
          // Continue with other actions even if one fails
        }
      }

      // Clear sync queue on successful sync
      localStorage.removeItem('pendingSync');
      updatePendingSyncCount();

      console.log('Sync completed successfully');

      // Show success notification (would integrate with toast system)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Todo App', {
            body: `Synced ${pendingData.length} changes`,
            icon: '/icons/icon-192x192.png',
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [updatePendingSyncCount]);

  /**
   * Clear the sync queue (for manual cleanup)
   */
  const clearSyncQueue = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingSync');
      updatePendingSyncCount();
      console.log('Sync queue cleared');
    }
  }, [updatePendingSyncCount]);

  return {
    isOnline,
    pendingSyncCount,
    syncPendingData,
    queueForSync,
    clearSyncQueue,
  };
}

/**
 * Sync items by action type
 */
async function syncItemsByAction(action: string, items: SyncableData[]): Promise<void> {
  const endpoint = '/api/todos';

  switch (action) {
    case 'create':
      await syncCreateItems(endpoint, items);
      break;
    case 'update':
      await syncUpdateItems(endpoint, items);
      break;
    case 'delete':
      await syncDeleteItems(endpoint, items);
      break;
    default:
      console.warn(`Unknown sync action: ${action}`);
  }
}

async function syncCreateItems(endpoint: string, items: SyncableData[]): Promise<void> {
  for (const item of items) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to create item:', item.id, error);
      throw error;
    }
  }
}

async function syncUpdateItems(endpoint: string, items: SyncableData[]): Promise<void> {
  for (const item of items) {
    try {
      const response = await fetch(`${endpoint}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to update item:', item.id, error);
      throw error;
    }
  }
}

async function syncDeleteItems(endpoint: string, items: SyncableData[]): Promise<void> {
  for (const item of items) {
    try {
      const response = await fetch(`${endpoint}/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete item:', item.id, error);
      throw error;
    }
  }
}
