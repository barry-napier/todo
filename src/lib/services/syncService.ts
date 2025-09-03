import { type Todo } from '@/types/todo';
import { NetworkError } from '@/lib/errors';
import { localStorageService } from '@/lib/storage/localStorage';

interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  signal?: AbortSignal;
}

export class SyncService {
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.processSyncQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
  };

  async syncWithServer(todos: Todo[], options: SyncOptions = {}): Promise<void> {
    const { maxRetries = 3, retryDelay = 1000, onRetry, signal } = options;

    if (!this.isOnline) {
      // Queue for later sync
      this.queueSync(() => this.performSync(todos, { maxRetries, retryDelay, onRetry, signal }));
      throw new NetworkError('Offline. Changes will sync when connection is restored.', true);
    }

    return this.performSync(todos, { maxRetries, retryDelay, onRetry, signal });
  }

  private async performSync(todos: Todo[], options: SyncOptions): Promise<void> {
    const { maxRetries = 3, retryDelay = 1000, onRetry, signal } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new NetworkError('Sync cancelled', false);
      }

      try {
        const response = await fetch('/api/todos/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todos, timestamp: new Date().toISOString() }),
          signal,
        });

        if (!response.ok) {
          if (response.status >= 500) {
            // Server error, retry
            throw new Error(`Server error: ${response.status}`);
          } else if (response.status === 429) {
            // Rate limited
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter
              ? parseInt(retryAfter) * 1000
              : retryDelay * Math.pow(2, attempt);
            await this.delay(delay);
            continue;
          } else {
            // Client error, don't retry
            throw new NetworkError(`Sync failed: ${response.statusText}`, false);
          }
        }

        // Success - clear pending sync
        localStorageService.clearPendingSync();
        return;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof NetworkError && !error.retryable) {
          throw error;
        }

        if (attempt < maxRetries) {
          onRetry?.(attempt);
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }

    // All retries exhausted - save for later sync
    localStorageService.savePendingSync(todos);
    throw new NetworkError(lastError?.message || 'Unable to sync. Changes saved locally.', true);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private queueSync(syncFn: () => Promise<void>): void {
    this.syncQueue.push(syncFn);

    // Save to pending sync immediately
    const state = localStorageService.load();
    if (state?.todos) {
      localStorageService.savePendingSync(state.todos);
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // Try to sync pending data first
      const pendingTodos = localStorageService.loadPendingSync();
      if (pendingTodos) {
        await this.performSync(pendingTodos, { maxRetries: 3, retryDelay: 1000 });
      }

      // Process queued sync operations
      while (this.syncQueue.length > 0 && this.isOnline) {
        const syncFn = this.syncQueue.shift();
        if (syncFn) {
          try {
            await syncFn();
          } catch (error) {
            console.error('Sync queue error:', error);
            // Re-queue if still offline
            if (!this.isOnline) {
              this.syncQueue.unshift(syncFn);
              break;
            }
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  getPendingSyncCount(): number {
    return this.syncQueue.length + (localStorageService.loadPendingSync() ? 1 : 0);
  }

  async retryPendingSync(): Promise<void> {
    const pendingTodos = localStorageService.loadPendingSync();
    if (!pendingTodos) {
      return;
    }

    if (!this.isOnline) {
      throw new NetworkError('Cannot sync while offline', false);
    }

    return this.performSync(pendingTodos, { maxRetries: 1 });
  }

  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

export const syncService = new SyncService();
