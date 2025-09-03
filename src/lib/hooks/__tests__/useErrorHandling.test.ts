import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useErrorHandling } from '../useErrorHandling';
import { StorageError, NetworkError, ValidationError } from '@/lib/errors';

// Mock localStorage service
vi.mock('@/lib/storage/localStorage', () => ({
  localStorageService: {
    getUsage: vi.fn().mockResolvedValue({ used: 5000, quota: 10000 }),
    load: vi.fn().mockReturnValue({ todos: [] }),
    save: vi.fn(),
  },
}));

describe('useErrorHandling', () => {
  it('should handle StorageError correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new StorageError('Storage full', true), 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'storage',
      message: 'Storage full',
      recoverable: true,
    });
    expect(result.current.error?.retryAction).toBeDefined();
  });

  it('should handle NetworkError correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new NetworkError('Connection failed', true), 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'network',
      message: 'Connection failed',
      recoverable: true,
    });
  });

  it('should handle ValidationError correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new ValidationError('Invalid input', 'email'), 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'validation',
      message: 'Invalid input',
      recoverable: false,
    });
  });

  it('should detect QuotaExceededError from generic Error', () => {
    const { result } = renderHook(() => useErrorHandling());

    const quotaError = new Error('QuotaExceededError: Storage quota exceeded');
    quotaError.name = 'QuotaExceededError';

    act(() => {
      result.current.handleError(quotaError, 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'storage',
      recoverable: true,
    });
    expect(result.current.error?.message).toContain('Storage is full');
  });

  it('should handle unknown errors', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new Error('Something went wrong'), 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'unknown',
      message: 'Something went wrong',
      recoverable: true,
    });
  });

  it('should handle non-Error objects', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError('string error', 'test context');
    });

    expect(result.current.error).toMatchObject({
      type: 'unknown',
      message: 'An unexpected error occurred',
      recoverable: false,
    });
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new Error('Test error'), 'test context');
    });

    expect(result.current.error).toBeDefined();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should set isRecovering when retry action is called', async () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.handleError(new StorageError('Storage full', true), 'test context');
    });

    expect(result.current.isRecovering).toBe(false);
    expect(result.current.error?.retryAction).toBeDefined();

    // Call retry action - just check that it completes without error
    await act(async () => {
      if (result.current.error?.retryAction) {
        await result.current.error.retryAction();
      }
    });

    // After recovery
    expect(result.current.isRecovering).toBe(false);
    // Error should be cleared after successful retry
    expect(result.current.error).toBeNull();
  });
});
