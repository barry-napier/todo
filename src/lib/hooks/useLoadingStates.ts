import { useState, useCallback } from 'react';

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
  }, []);

  const withLoading = useCallback(
    async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        const result = await operation();
        return result;
      } finally {
        setTimeout(() => setLoading(key, false), 150);
      }
    },
    [setLoading]
  );

  const isLoading = useCallback(
    (key: string): boolean => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some((state) => state);
  }, [loadingStates]);

  return { loadingStates, setLoading, withLoading, isLoading, isAnyLoading };
}
