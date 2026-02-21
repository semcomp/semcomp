import { useCallback, useRef } from 'react';

interface UseDebounceOptions {
  delay?: number;
  maxWait?: number;
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions = {}
): T {
  const { delay = 1000, maxWait = 5000 } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    lastCallTimeRef.current = now;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Define maxTimeout se ainda não foi setado
    if (!maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        callback(...args);
        maxTimeoutRef.current = undefined;
        timeoutRef.current = undefined;
      }, maxWait);
    }

    // Define regular debounce timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = undefined;
      }
      timeoutRef.current = undefined;
    }, delay);
  }, [callback, delay, maxWait]) as T;

  return debouncedCallback;
} 