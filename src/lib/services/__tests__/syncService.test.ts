import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncService } from '../syncService';
import { NetworkError } from '@/lib/errors';
import { localStorageService } from '@/lib/storage/localStorage';

// Mock localStorage at module level
vi.mock('@/lib/storage/localStorage', () => {
  return {
    localStorageService: {
      loadPendingSync: vi.fn(),
      clearPendingSync: vi.fn(),
      savePendingSync: vi.fn(),
      load: vi.fn().mockReturnValue({ todos: [] }),
    }
  };
});

// Mock fetch globally
global.fetch = vi.fn();

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(() => {
    service = new SyncService();
    vi.clearAllMocks();

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('Network retry with exponential backoff', () => {
    it('should retry on network failure with exponential backoff', async () => {
      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      let attempts = 0;
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(new Response('{}', { status: 200 }));
      });

      const startTime = Date.now();
      await service.syncWithServer(todos, { retryDelay: 100 });
      const duration = Date.now() - startTime;

      expect(attempts).toBe(3);
      // Should have delays: 100ms, 200ms (exponential backoff)
      expect(duration).toBeGreaterThanOrEqual(300);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle rate limiting with retry-after header', async () => {
      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      let attempts = 0;
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
        attempts++;
        if (attempts === 1) {
          return Promise.resolve(
            new Response('Too Many Requests', {
              status: 429,
              headers: new Headers({ 'Retry-After': '1' }),
            })
          );
        }
        return Promise.resolve(new Response('{}', { status: 200 }));
      });

      const startTime = Date.now();
      await service.syncWithServer(todos, { retryDelay: 100 });
      const duration = Date.now() - startTime;

      expect(attempts).toBe(2);
      // Should wait 1 second as specified by Retry-After header
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('should not retry on client errors', async () => {
      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response('Bad Request', { status: 400 })
      );

      await expect(service.syncWithServer(todos, { maxRetries: 3 })).rejects.toThrow(NetworkError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should respect abort signal', async () => {
      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const controller = new AbortController();

      // Mock fetch to reject with abort error when signal is aborted
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
        return new Promise((_, reject) => {
          // Listen for abort signal
          if (controller.signal.aborted) {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          } else {
            controller.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted', 'AbortError'));
            });
          }
        });
      });

      // Start the sync
      const syncPromise = service.syncWithServer(todos, { signal: controller.signal });

      // Abort after a short delay
      setTimeout(() => controller.abort(), 10);

      // Should throw NetworkError with "Sync cancelled" message
      await expect(syncPromise).rejects.toThrow('Sync cancelled');
    });
  });

  describe('Offline queue management', () => {
    it('should queue sync operations when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      // Create new service after setting offline status
      const offlineService = new SyncService();

      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await expect(offlineService.syncWithServer(todos)).rejects.toThrow(
        'Offline. Changes will sync when connection is restored.'
      );

      expect(offlineService.getPendingSyncCount()).toBeGreaterThan(0);
      
      // Clean up
      offlineService.cleanup();
    });

    it('should process sync queue when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      const todos = [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Queue a sync
      try {
        await service.syncWithServer(todos);
      } catch {
        // Expected to fail when offline
      }

      // Come back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response('{}', { status: 200 })
      );

      // Trigger online event manually
      window.dispatchEvent(new Event('online'));

      // Wait for queue processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Network status detection', () => {
    it('should detect online status', () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      expect(service.isNetworkOnline()).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      const newService = new SyncService();
      expect(newService.isNetworkOnline()).toBe(false);
      newService.cleanup();
    });

    it('should update status on network events', () => {
      Object.defineProperty(navigator, 'onLine', { value: true });

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      expect(service.isNetworkOnline()).toBe(false);

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));

      expect(service.isNetworkOnline()).toBe(true);
    });
  });

  describe('Pending sync retry', () => {
    it('should retry pending sync when online', async () => {
      const todos = [
        {
          id: '1',
          text: 'Pending todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Configure mock localStorage to have pending sync
      (localStorageService.loadPendingSync as ReturnType<typeof vi.fn>).mockReturnValue(todos);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response('{}', { status: 200 })
      );

      await service.retryPendingSync();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/todos/backup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error when trying to sync while offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      // Create new service after setting offline status
      const offlineService = new SyncService();

      await expect(offlineService.retryPendingSync()).rejects.toThrow('Cannot sync while offline');
      
      // Clean up
      offlineService.cleanup();
    });
  });
});
