import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalStorageService } from '@/lib/storage/localStorage';
import { StorageState } from '@/types/todo';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      length: 0,
      key: vi.fn(),
    };

    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    service = new LocalStorageService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('save', () => {
    it('should save state to localStorage', () => {
      const state: StorageState = {
        todos: [
          {
            id: '1',
            text: 'Test todo',
            completed: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        version: '1.0.0',
      };

      service.save(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'todos',
        expect.stringContaining('"version":"1.0.0"')
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'todos',
        expect.stringContaining('"lastSync"')
      );
    });

    it('should handle quota exceeded error', () => {
      const state: StorageState = {
        todos: [],
        version: '1.0.0',
      };

      // Mock quota exceeded error
      mockLocalStorage.setItem = vi.fn(() => {
        const error = new DOMException('QuotaExceededError');
        Object.defineProperty(error, 'name', { value: 'QuotaExceededError' });
        throw error;
      });

      expect(() => service.save(state)).toThrow('Storage quota exceeded');
    });
  });

  describe('load', () => {
    it('should load state from localStorage', () => {
      const storedData = {
        todos: [
          {
            id: '1',
            text: 'Test todo',
            completed: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        version: '1.0.0',
        lastSync: '2024-01-01T00:00:00.000Z',
      };

      mockLocalStorage.getItem = vi.fn(() => JSON.stringify(storedData));

      const result = service.load();

      expect(result).toBeTruthy();
      expect(result?.todos).toHaveLength(1);
      expect(result?.todos[0].createdAt).toBeInstanceOf(Date);
      expect(result?.todos[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should return null when no data exists', () => {
      mockLocalStorage.getItem = vi.fn(() => null);

      const result = service.load();

      expect(result).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem = vi.fn(() => 'invalid json');

      const result = service.load();

      expect(result).toBeNull();
    });

    it('should call migrate for different version', () => {
      const storedData = {
        todos: [],
        version: '0.9.0',
        lastSync: '2024-01-01T00:00:00.000Z',
      };

      mockLocalStorage.getItem = vi.fn(() => JSON.stringify(storedData));

      const result = service.load();

      expect(result).toBeTruthy();
      expect(result?.version).toBe('1.0.0');
    });
  });

  describe('clear', () => {
    it('should remove todos from localStorage', () => {
      service.clear();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todos');
    });

    it('should handle errors gracefully', () => {
      mockLocalStorage.removeItem = vi.fn(() => {
        throw new Error('Failed to clear');
      });

      // Should not throw
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(service.isAvailable()).toBe(true);
    });

    it('should return false when localStorage is not available', () => {
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('Not available');
      });

      expect(service.isAvailable()).toBe(false);
    });
  });
});
