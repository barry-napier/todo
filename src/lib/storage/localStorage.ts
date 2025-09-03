import { type StorageState } from '@/types/todo';

export class LocalStorageService {
  private readonly storageKey = 'todos';
  private readonly storageVersion = '1.0.0';

  save(state: StorageState): void {
    try {
      const serialized = JSON.stringify({
        ...state,
        version: this.storageVersion,
        lastSync: new Date().toISOString(),
      });
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some data and try again.');
      }
      throw error;
    }
  }

  load(): StorageState | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;

      const parsed = JSON.parse(data);

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

      // Handle version migrations in the future
      if (parsed.version !== this.storageVersion) {
        return this.migrate(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  private migrate(data: StorageState & { version: string }): StorageState {
    // Placeholder for future migrations
    console.log('Migrating from version', data.version, 'to', this.storageVersion);

    // For now, just return the data as-is
    // In the future, implement migration logic here
    return {
      todos: data.todos || [],
      version: this.storageVersion,
      lastSync: data.lastSync,
    };
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
