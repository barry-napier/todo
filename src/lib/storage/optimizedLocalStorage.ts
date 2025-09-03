import { type StorageState, type Todo } from '@/types/todo';
import { StorageError } from '@/lib/errors';
import { BatchedStorageManager, getBatchedStorage } from './batchedStorage';

export class OptimizedLocalStorageService {
  private readonly storageKey = 'todos';
  private readonly storageVersion = '1.0.0';
  private readonly pendingSyncKey = 'pendingSync';
  private readonly maxRetries = 3;
  private batchedStorage: BatchedStorageManager;

  constructor() {
    this.batchedStorage = getBatchedStorage({
      batchDelay: 100,
      maxBatchSize: 10,
      onError: (error: Error) => {
        console.error('[OptimizedStorage] Batch write error:', error);
      },
    });
  }

  async save(state: StorageState): Promise<void> {
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        const serialized = {
          ...state,
          version: this.storageVersion,
          lastSync: new Date().toISOString(),
        };

        // Use batched storage for better performance
        this.batchedStorage.set(this.storageKey, serialized);

        // For critical saves, force flush immediately
        if (state.todos.length > 100) {
          await this.batchedStorage.forceFlush();
        }

        return; // Success
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          retryCount++;

          if (retryCount < this.maxRetries) {
            // Attempt cleanup and retry
            await this.cleanupOldData(state.todos);
            continue;
          }

          // Final attempt failed
          throw new StorageError(
            'Storage quota exceeded. Some old completed tasks have been removed.',
            true
          );
        }
        throw error;
      }
    }
  }

  private async cleanupOldData(todos: Todo[]): Promise<void> {
    // Remove completed todos older than 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = todos.filter(
      (todo) => !todo.completed || new Date(todo.createdAt).getTime() > cutoff
    );

    if (filtered.length < todos.length) {
      const cleaned: StorageState = {
        todos: filtered,
        version: this.storageVersion,
        lastSync: new Date().toISOString(),
      };

      // Force immediate save of cleaned data
      this.batchedStorage.set(this.storageKey, cleaned);
      await this.batchedStorage.forceFlush();

      console.info(`Cleaned up ${todos.length - filtered.length} old completed todos`);
    } else {
      // No old data to clean, try removing other localStorage items
      this.cleanupOtherData();
    }
  }

  private cleanupOtherData(): void {
    // Remove non-essential localStorage items (keeping only todos and critical data)
    const keysToKeep = [this.storageKey, this.pendingSyncKey, 'theme', 'preferences'];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        try {
          this.batchedStorage.remove(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      }
    });
  }

  savePendingSync(todos: Todo[]): void {
    try {
      this.batchedStorage.set(this.pendingSyncKey, todos);
    } catch (error) {
      console.error('Failed to save pending sync data:', error);
    }
  }

  loadPendingSync(): Todo[] | null {
    try {
      const data = this.batchedStorage.get(this.pendingSyncKey);
      return data as Todo[] | null;
    } catch (error) {
      console.error('Failed to load pending sync data:', error);
      return null;
    }
  }

  clearPendingSync(): void {
    try {
      this.batchedStorage.remove(this.pendingSyncKey);
    } catch (error) {
      console.error('Failed to clear pending sync data:', error);
    }
  }

  load(): StorageState | null {
    try {
      const data = this.batchedStorage.get(this.storageKey);
      if (!data) return null;

      // Handle version migrations first (for old formats)
      const typedData = data as StorageState & { version: string };
      if (typedData.version && typedData.version !== this.storageVersion) {
        return this.migrate(typedData);
      }

      // Validate data structure
      if (!this.validateStorageState(data)) {
        console.warn('Invalid storage state detected, attempting recovery');
        return this.recoverFromCorruptedData(data);
      }

      // Convert date strings back to Date objects
      const typedStorageData = data as StorageState;
      if (typedStorageData.todos) {
        typedStorageData.todos = typedStorageData.todos.map((todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt as string | number | Date),
          updatedAt: new Date(todo.updatedAt as string | number | Date),
        }));
      }

      return typedStorageData;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  private validateStorageState(data: unknown): boolean {
    if (!data || typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    // Check required fields
    if (!Array.isArray(obj.todos)) return false;
    if (!obj.version || typeof obj.version !== 'string') return false;

    // Validate each todo
    for (const todo of obj.todos) {
      if (!this.validateTodo(todo)) return false;
    }

    return true;
  }

  private validateTodo(todo: unknown): boolean {
    if (!todo || typeof todo !== 'object' || todo === null) return false;

    const obj = todo as Record<string, unknown>;

    // Check required fields
    if (!obj.id || typeof obj.id !== 'string') return false;
    if (!obj.text || typeof obj.text !== 'string') return false;
    if (typeof obj.completed !== 'boolean') return false;
    if (!obj.createdAt) return false;
    if (!obj.updatedAt) return false;

    return true;
  }

  private recoverFromCorruptedData(data: unknown): StorageState | null {
    console.warn('Attempting to recover from corrupted data');

    // Try to salvage what we can
    const recovered: StorageState = {
      todos: [],
      version: this.storageVersion,
      lastSync: new Date().toISOString(),
    };

    if (
      data &&
      typeof data === 'object' &&
      'todos' in data &&
      Array.isArray((data as { todos: unknown[] }).todos)
    ) {
      const dataTodos = (data as { todos: unknown[] }).todos;
      recovered.todos = dataTodos
        .filter((todo: unknown) => {
          try {
            return this.validateTodo(todo);
          } catch {
            return false;
          }
        })
        .map((todo: unknown) => {
          const t = todo as Record<string, unknown>;
          return {
            id: typeof t.id === 'string' ? t.id : crypto.randomUUID(),
            text: String(t.text || 'Recovered todo'),
            completed: Boolean(t.completed),
            createdAt: t.createdAt ? new Date(t.createdAt as string | number | Date) : new Date(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt as string | number | Date) : new Date(),
          };
        });
    }

    // Save the recovered data
    if (recovered.todos.length > 0) {
      try {
        this.batchedStorage.set(this.storageKey, recovered);
        console.info(`Recovered ${recovered.todos.length} todos from corrupted data`);
      } catch (error) {
        console.error('Failed to save recovered data:', error);
      }
    }

    return recovered;
  }

  async clear(): Promise<void> {
    try {
      this.batchedStorage.remove(this.storageKey);
      await this.batchedStorage.forceFlush();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  private migrate(data: StorageState & { version: string }): StorageState {
    console.log('Migrating from version', data.version, 'to', this.storageVersion);

    let migrated = { ...data };

    // Version 0.x to 1.0.0 migration
    if ((data as { version: string }).version.startsWith('0.')) {
      migrated = this.migrateV0ToV1(migrated);
    }

    // Update to current version
    migrated.version = this.storageVersion;
    migrated.lastSync = migrated.lastSync || new Date().toISOString();

    // Save migrated data
    try {
      this.save(migrated);
      console.info('Migration completed successfully');
    } catch (error) {
      console.error('Failed to save migrated data:', error);
    }

    return migrated;
  }

  private migrateV0ToV1(data: unknown): StorageState {
    // Example migration from a hypothetical v0 format
    const migrated: StorageState = {
      todos: [],
      version: '1.0.0',
      lastSync: new Date().toISOString(),
    };

    // Handle old todo format
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.items || d.todos)) {
      const oldTodos = (d.items || d.todos) as unknown[];
      migrated.todos = oldTodos.map((item: unknown) => {
        const i = item as Record<string, unknown>;
        return {
          id:
            typeof i.id === 'string'
              ? i.id
              : typeof i._id === 'string'
                ? i._id
                : crypto.randomUUID(),
          text: String(i.text || i.title || i.description || 'Migrated todo'),
          completed: Boolean(i.completed || i.done || i.finished),
          createdAt: i.createdAt ? new Date(i.createdAt as string | number | Date) : new Date(),
          updatedAt:
            i.updatedAt || i.modifiedAt
              ? new Date((i.updatedAt || i.modifiedAt) as string | number | Date)
              : new Date(),
        };
      });
    }

    return migrated;
  }

  isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async getUsage(): Promise<{ used: number; quota: number } | null> {
    return this.batchedStorage
      .getStorageInfo()
      .then((info) => ({
        used: info.used,
        quota: info.quota,
      }))
      .catch(() => null);
  }

  // Force flush pending writes (useful before page unload)
  async flush(): Promise<void> {
    return this.batchedStorage.forceFlush();
  }

  // Get pending write count (for monitoring)
  getPendingWriteCount(): number {
    return this.batchedStorage.getPendingCount();
  }
}

export const optimizedLocalStorageService = new OptimizedLocalStorageService();
