import { type StorageState, type Todo } from '@/types/todo';
import { StorageError } from '@/lib/errors';

export class LocalStorageService {
  private readonly storageKey = 'todos';
  private readonly storageVersion = '1.0.0';
  private readonly pendingSyncKey = 'pendingSync';
  private readonly maxRetries = 3;

  save(state: StorageState): void {
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        const serialized = JSON.stringify({
          ...state,
          version: this.storageVersion,
          lastSync: new Date().toISOString(),
        });
        localStorage.setItem(this.storageKey, serialized);
        return; // Success
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          retryCount++;

          if (retryCount < this.maxRetries) {
            // Attempt cleanup and retry
            this.cleanupOldData(state.todos);
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

  private cleanupOldData(todos: Todo[]): void {
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

      // Try to save the cleaned data
      const serialized = JSON.stringify(cleaned);
      localStorage.setItem(this.storageKey, serialized);

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
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      }
    });
  }

  savePendingSync(todos: Todo[]): void {
    try {
      localStorage.setItem(this.pendingSyncKey, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save pending sync data:', error);
    }
  }

  loadPendingSync(): Todo[] | null {
    try {
      const data = localStorage.getItem(this.pendingSyncKey);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load pending sync data:', error);
      return null;
    }
  }

  clearPendingSync(): void {
    try {
      localStorage.removeItem(this.pendingSyncKey);
    } catch (error) {
      console.error('Failed to clear pending sync data:', error);
    }
  }

  load(): StorageState | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // Handle version migrations first (for old formats)
      if (parsed.version && parsed.version !== this.storageVersion) {
        return this.migrate(parsed);
      }

      // Validate data structure
      if (!this.validateStorageState(parsed)) {
        console.warn('Invalid storage state detected, attempting recovery');
        return this.recoverFromCorruptedData(parsed);
      }

      // Convert date strings back to Date objects
      if (parsed.todos) {
        parsed.todos = parsed.todos.map((todo: unknown) => {
          const t = todo as { createdAt: string; updatedAt: string; [key: string]: unknown };
          return {
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          };
        });
      }

      return parsed;
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
        this.save(recovered);
        console.info(`Recovered ${recovered.todos.length} todos from corrupted data`);
      } catch (error) {
        console.error('Failed to save recovered data:', error);
      }
    }

    return recovered;
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
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

    // Future migrations can be added here
    // if (semverLessThan(migrated.version, '2.0.0')) {
    //   migrated = this.migrateV1ToV2(migrated);
    // }

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
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch {
      return null;
    }
  }
}

export const localStorageService = new LocalStorageService();
