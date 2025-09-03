import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from '../localStorage';
import { StorageError } from '@/lib/errors';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    mockLocalStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    service = new LocalStorageService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('QuotaExceededError handling', () => {
    it('should handle storage quota exceeded error', () => {
      const mockSetItem = vi.spyOn(mockLocalStorage, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      const state = {
        todos: [
          {
            id: '1',
            text: 'Test todo',
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        version: '1.0.0',
        lastSync: new Date().toISOString(),
      };

      expect(() => service.save(state)).toThrow(StorageError);
      expect(() => service.save(state)).toThrow('Storage quota exceeded');
    });

    it('should attempt cleanup on quota exceeded', () => {
      let callCount = 0;
      const mockSetItem = vi.spyOn(mockLocalStorage, 'setItem');

      mockSetItem.mockImplementation(() => {
        callCount++;
        // First call fails, second call (cleanup) succeeds, third call (retry) succeeds
        if (callCount === 1) {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        }
        // Allow cleanup and retry to succeed
        return;
      });

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      const state = {
        todos: [
          {
            id: '1',
            text: 'Old completed todo',
            completed: true,
            createdAt: oldDate,
            updatedAt: oldDate,
          },
          {
            id: '2',
            text: 'Recent todo',
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        version: '1.0.0',
        lastSync: new Date().toISOString(),
      };

      service.save(state);

      // Should have attempted cleanup
      expect(mockSetItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Data validation and recovery', () => {
    it('should validate storage state structure', () => {
      const invalidData = JSON.stringify({
        todos: 'not-an-array',
        version: '1.0.0',
      });

      mockLocalStorage.getItem = vi.fn(() => invalidData);

      const result = service.load();

      // Should attempt recovery
      expect(result).toBeDefined();
      expect(result?.todos).toEqual([]);
    });

    it('should recover valid todos from corrupted data', () => {
      const partiallyCorruptedData = JSON.stringify({
        todos: [
          {
            id: '1',
            text: 'Valid todo',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            // Missing required fields
            text: 'Invalid todo',
          },
          {
            id: '3',
            text: 'Another valid todo',
            completed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        version: '1.0.0',
      });

      mockLocalStorage.getItem = vi.fn(() => partiallyCorruptedData);

      const result = service.load();

      expect(result).toBeDefined();
      expect(result?.todos).toHaveLength(2); // Only valid todos
      expect(result?.todos[0].id).toBe('1');
      expect(result?.todos[1].id).toBe('3');
    });

    it('should handle completely corrupted JSON', () => {
      mockLocalStorage.getItem = vi.fn(() => 'not-valid-json{');

      const result = service.load();

      // Should return null for corrupted data
      expect(result).toBeNull();
    });
  });

  describe('Data migration', () => {
    it('should migrate from version 0.x to 1.0.0', () => {
      const oldFormatData = JSON.stringify({
        items: [
          {
            _id: 'old-1',
            title: 'Old format todo',
            done: true,
            createdAt: new Date().toISOString(),
          },
        ],
        version: '0.9.0',
      });

      mockLocalStorage.getItem = vi.fn(() => oldFormatData);

      const result = service.load();

      expect(result).toBeDefined();
      expect(result?.version).toBe('1.0.0');
      expect(result?.todos).toHaveLength(1);
      expect(result?.todos[0].id).toBe('old-1');
      expect(result?.todos[0].text).toBe('Old format todo');
      expect(result?.todos[0].completed).toBe(true);
    });
  });

  describe('Pending sync operations', () => {
    it('should save and load pending sync data', () => {
      const now = new Date();
      const todos = [
        {
          id: '1',
          text: 'Pending sync todo',
          completed: false,
          createdAt: now,
          updatedAt: now,
        },
      ];

      service.savePendingSync(todos);

      const loaded = service.loadPendingSync();

      expect(loaded).toHaveLength(1);
      expect(loaded![0].id).toBe('1');
      expect(loaded![0].text).toBe('Pending sync todo');
      expect(loaded![0].completed).toBe(false);
      // Dates get serialized to strings and back
      expect(loaded![0].createdAt).toEqual(now.toISOString());
      expect(loaded![0].updatedAt).toEqual(now.toISOString());
    });

    it('should clear pending sync data', () => {
      const todos = [
        {
          id: '1',
          text: 'Test',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.savePendingSync(todos);
      service.clearPendingSync();

      const loaded = service.loadPendingSync();

      expect(loaded).toBeNull();
    });
  });

  describe('Storage availability check', () => {
    it('should detect when localStorage is available', () => {
      expect(service.isAvailable()).toBe(true);
    });

    it('should detect when localStorage is not available', () => {
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('Storage usage monitoring', () => {
    it('should return storage usage when API is available', async () => {
      const mockEstimate = vi.fn().mockResolvedValue({
        usage: 1024 * 1024, // 1MB
        quota: 10 * 1024 * 1024, // 10MB
      });

      Object.defineProperty(navigator, 'storage', {
        value: { estimate: mockEstimate },
        writable: true,
      });

      const usage = await service.getUsage();

      expect(usage).toEqual({
        used: 1024 * 1024,
        quota: 10 * 1024 * 1024,
      });
    });

    it('should return null when storage API is not available', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        writable: true,
      });

      const usage = await service.getUsage();

      expect(usage).toBeNull();
    });
  });
});
