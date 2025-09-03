import { useState, useCallback } from 'react';
import { type ErrorState, StorageError, NetworkError, ValidationError } from '@/lib/errors';
import { localStorageService } from '@/lib/storage/localStorage';

export function useErrorHandling() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof StorageError) {
      setError({
        type: 'storage',
        message: error.message,
        recoverable: error.recoverable,
        retryAction: error.recoverable
          ? async () => {
              setIsRecovering(true);
              try {
                // Attempt to clean up storage
                await cleanupStorage();
                setError(null);
              } finally {
                setIsRecovering(false);
              }
            }
          : undefined,
      });
    } else if (error instanceof NetworkError) {
      setError({
        type: 'network',
        message: error.message,
        recoverable: error.retryable,
        retryAction: error.retryable
          ? async () => {
              setIsRecovering(true);
              try {
                // Retry will be handled by the calling function
                setError(null);
              } finally {
                setIsRecovering(false);
              }
            }
          : undefined,
      });
    } else if (error instanceof ValidationError) {
      setError({
        type: 'validation',
        message: error.message,
        recoverable: false,
      });
    } else if (error instanceof Error) {
      // Check for specific error types
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        setError({
          type: 'storage',
          message: 'Storage is full. Please delete some items or export your data.',
          recoverable: true,
          retryAction: async () => {
            setIsRecovering(true);
            try {
              await cleanupStorage();
              setError(null);
            } finally {
              setIsRecovering(false);
            }
          },
        });
      } else {
        setError({
          type: 'unknown',
          message: error.message || 'An unexpected error occurred',
          recoverable: true,
        });
      }
    } else {
      setError({
        type: 'unknown',
        message: 'An unexpected error occurred',
        recoverable: false,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRecovering,
    handleError,
    clearError,
  };
}

async function cleanupStorage(): Promise<void> {
  try {
    const usage = await localStorageService.getUsage();

    if (usage && usage.used / usage.quota > 0.9) {
      // Storage is over 90% full, trigger cleanup
      const state = localStorageService.load();
      if (state?.todos) {
        // Remove old completed todos
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = state.todos.filter(
          (todo) => !todo.completed || new Date(todo.createdAt).getTime() > cutoff
        );

        localStorageService.save({
          ...state,
          todos: filtered,
        });
      }
    }
  } catch (error) {
    console.error('Failed to cleanup storage:', error);
    throw new StorageError('Failed to cleanup storage', false);
  }
}
