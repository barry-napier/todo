import { useState, useEffect } from 'react';
import { syncService } from '@/lib/services/syncService';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Update pending sync count when coming back online
      setPendingSyncCount(syncService.getPendingSyncCount());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial pending sync count
    setPendingSyncCount(syncService.getPendingSyncCount());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending syncs periodically
    const interval = setInterval(() => {
      setPendingSyncCount(syncService.getPendingSyncCount());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const retrySync = async () => {
    try {
      await syncService.retryPendingSync();
      setPendingSyncCount(syncService.getPendingSyncCount());
    } catch (error) {
      console.error('Failed to retry sync:', error);
      throw error;
    }
  };

  return {
    isOnline,
    pendingSyncCount,
    hasPendingSync: pendingSyncCount > 0,
    retrySync,
  };
}
