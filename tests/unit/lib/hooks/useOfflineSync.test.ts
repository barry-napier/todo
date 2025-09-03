import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

// Mock navigator
const mockNavigator = {
  onLine: true,
};

// Mock window
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  Notification: vi.fn(),
};

describe('useOfflineSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: {
        ...mockWindow,
        Notification: {
          permission: 'granted',
        },
      },
      configurable: true,
    });

    Object.defineProperty(global, 'Notification', {
      value: vi.fn(),
      configurable: true,
    });

    global.console.log = vi.fn();
    global.console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with online state', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.pendingSyncCount).toBe(0);
  });

  it('should initialize with offline state when navigator is offline', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(false);
  });

  it('should queue data for sync', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useOfflineSync());

    const testData = {
      id: 'test-1',
      action: 'create' as const,
      data: { text: 'Test todo' },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.queueForSync(testData);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'pendingSync',
      expect.stringContaining('test-1')
    );
  });

  it('should handle existing pending data when queuing', () => {
    const existingData = JSON.stringify([
      {
        id: 'existing-1',
        action: 'update',
        data: { text: 'Existing todo' },
        timestamp: Date.now() - 1000,
      },
    ]);

    mockLocalStorage.getItem.mockReturnValue(existingData);

    const { result } = renderHook(() => useOfflineSync());

    const newData = {
      id: 'test-2',
      action: 'create' as const,
      data: { text: 'New todo' },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.queueForSync(newData);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'pendingSync',
      expect.stringContaining('test-2')
    );
  });

  it('should remove duplicates when queuing same id and action', () => {
    const existingData = JSON.stringify([
      {
        id: 'test-1',
        action: 'update',
        data: { text: 'Old version' },
        timestamp: Date.now() - 1000,
      },
    ]);

    mockLocalStorage.getItem.mockReturnValue(existingData);

    const { result } = renderHook(() => useOfflineSync());

    const updatedData = {
      id: 'test-1',
      action: 'update' as const,
      data: { text: 'New version' },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.queueForSync(updatedData);
    });

    // Should only have one entry for test-1 with update action
    const setItemCall = mockLocalStorage.setItem.mock.calls[0];
    const storedData = JSON.parse(setItemCall[1]);

    expect(storedData).toHaveLength(1);
    expect(storedData[0].data.text).toBe('New version');
  });

  it('should sync pending data successfully', async () => {
    const pendingData = JSON.stringify([
      {
        id: 'test-1',
        action: 'create',
        data: { text: 'Test todo 1' },
        timestamp: Date.now(),
      },
      {
        id: 'test-2',
        action: 'update',
        data: { text: 'Test todo 2' },
        timestamp: Date.now(),
      },
    ]);

    mockLocalStorage.getItem.mockReturnValue(pendingData);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.syncPendingData();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pendingSync');
  });

  it('should handle sync failure gracefully', async () => {
    const pendingData = JSON.stringify([
      {
        id: 'test-1',
        action: 'create',
        data: { text: 'Test todo' },
        timestamp: Date.now(),
      },
    ]);

    mockLocalStorage.getItem.mockReturnValue(pendingData);
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      try {
        await result.current.syncPendingData();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    expect(global.console.error).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should clear sync queue', () => {
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.clearSyncQueue();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pendingSync');
  });

  it('should update pending sync count from localStorage', () => {
    const pendingData = JSON.stringify([
      { id: '1', action: 'create', data: {}, timestamp: Date.now() },
      { id: '2', action: 'update', data: {}, timestamp: Date.now() },
    ]);

    mockLocalStorage.getItem.mockReturnValue(pendingData);

    const { result } = renderHook(() => useOfflineSync());

    // The count should be updated during initialization
    expect(result.current.pendingSyncCount).toBeGreaterThan(0);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.pendingSyncCount).toBe(0);
    expect(() => {
      result.current.queueForSync({
        id: 'test',
        action: 'create',
        data: {},
        timestamp: Date.now(),
      });
    }).not.toThrow();
  });
});
