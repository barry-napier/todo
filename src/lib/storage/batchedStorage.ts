/**
 * Batched localStorage operations for better performance
 * Reduces the number of writes to localStorage by batching them
 */

interface PendingWrite {
  key: string;
  value: unknown;
  timestamp: number;
}

export class BatchedStorageManager {
  private pendingWrites = new Map<string, PendingWrite>();
  private writeTimer: NodeJS.Timeout | null = null;
  private readonly batchDelay: number;
  private readonly maxBatchSize: number;
  private errorCallback?: (error: Error) => void;

  constructor(options?: {
    batchDelay?: number;
    maxBatchSize?: number;
    onError?: (error: Error) => void;
  }) {
    this.batchDelay = options?.batchDelay ?? 100; // Default 100ms batch window
    this.maxBatchSize = options?.maxBatchSize ?? 10; // Max 10 items per batch
    this.errorCallback = options?.onError;
  }

  /**
   * Queue a write operation to be batched
   */
  set(key: string, value: unknown): void {
    this.pendingWrites.set(key, {
      key,
      value,
      timestamp: Date.now(),
    });

    // If we've reached max batch size, flush immediately
    if (this.pendingWrites.size >= this.maxBatchSize) {
      this.flush();
      return;
    }

    // Otherwise, schedule a batch write
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  /**
   * Get a value from localStorage (bypasses batching)
   */
  get(key: string): unknown {
    // Check pending writes first
    const pending = this.pendingWrites.get(key);
    if (pending) {
      return pending.value;
    }

    // Otherwise read from localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      this.handleError(new Error(`Failed to read ${key} from localStorage: ${error}`));
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   */
  remove(key: string): void {
    // Remove from pending writes if exists
    this.pendingWrites.delete(key);

    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.handleError(new Error(`Failed to remove ${key} from localStorage: ${error}`));
    }
  }

  /**
   * Flush all pending writes to localStorage
   */
  flush(): void {
    if (this.pendingWrites.size === 0) {
      return;
    }

    const writes = Array.from(this.pendingWrites.values());

    // Clear pending writes before flushing to prevent duplicates
    this.pendingWrites.clear();

    // Clear the timer
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }

    // Batch write to localStorage
    writes.forEach(({ key, value }) => {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (error) {
        this.handleError(new Error(`Failed to write ${key} to localStorage: ${error}`));
      }
    });
  }

  /**
   * Force flush and clear all pending operations
   */
  forceFlush(): Promise<void> {
    return new Promise((resolve) => {
      this.flush();
      resolve();
    });
  }

  /**
   * Get storage size info
   */
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    quota: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          quota: estimate.quota || 0,
        };
      } catch (error) {
        this.handleError(new Error(`Failed to estimate storage: ${error}`));
      }
    }

    // Fallback: Calculate approximate size from localStorage
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }

    return {
      used: totalSize,
      available: 5 * 1024 * 1024 - totalSize, // Assume 5MB quota
      quota: 5 * 1024 * 1024,
    };
  }

  /**
   * Clear all localStorage data
   */
  clear(): void {
    this.pendingWrites.clear();

    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }

    try {
      localStorage.clear();
    } catch (error) {
      this.handleError(new Error(`Failed to clear localStorage: ${error}`));
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('[BatchedStorage]', error);
    if (this.errorCallback) {
      this.errorCallback(error);
    }
  }

  /**
   * Get pending write count (for debugging/monitoring)
   */
  getPendingCount(): number {
    return this.pendingWrites.size;
  }

  /**
   * Check if there are pending writes
   */
  hasPendingWrites(): boolean {
    return this.pendingWrites.size > 0;
  }
}

// Singleton instance for the app
let instance: BatchedStorageManager | null = null;

export function getBatchedStorage(
  options?: ConstructorParameters<typeof BatchedStorageManager>[0]
): BatchedStorageManager {
  if (!instance) {
    instance = new BatchedStorageManager(options);
  }
  return instance;
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    instance?.flush();
  });

  // Also flush on visibility change (mobile background)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && instance?.hasPendingWrites()) {
      instance.flush();
    }
  });
}
