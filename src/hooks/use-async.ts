import { useState, useCallback } from 'react';
import { useErrorHandler } from '@/providers/app-provider';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

type AsyncFn<T, Args extends any[]> = (...args: Args) => Promise<T>;

/**
 * Hook do obsługi operacji asynchronicznych z jednolitą obsługą błędów i stanu ładowania
 */
export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: AsyncFn<T, Args>,
  immediate = false,
  initialArgs?: Args
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const { handleError } = useErrorHandler();

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setState(prevState => ({ ...prevState, isLoading: true, error: null }));
        const data = await asyncFunction(...args);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, isLoading: false, error: errorObj });
        handleError(errorObj);
        throw errorObj;
      }
    },
    [asyncFunction, handleError]
  );

  // Automatyczne wykonanie przy pierwszym renderowaniu, jeśli immediate = true
  useState(() => {
    if (immediate && initialArgs) {
      execute(...initialArgs);
    }
  });

  return {
    ...state,
    execute,
    // Pomocnicze metody
    reset: useCallback(() => {
      setState({ data: null, isLoading: false, error: null });
    }, []),
    setData: useCallback((data: T) => {
      setState(prevState => ({ ...prevState, data }));
    }, []),
  };
}

/**
 * Hook do wywołania operacji asynchronicznej z automatyczną obsługą stanu
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  return useAsync<T>(
    useCallback(
      async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json() as Promise<T>;
      },
      [url, options]
    )
  );
}

/**
 * Hook do bezpiecznej mutacji danych z obsługą stanu i błędów
 */
export function useMutation<T, Args extends any[]>(
  mutationFn: AsyncFn<T, Args>
) {
  const { execute, isLoading, error, reset } = useAsync<T, Args>(mutationFn);

  return {
    mutate: execute,
    isLoading,
    error,
    reset
  };
}
