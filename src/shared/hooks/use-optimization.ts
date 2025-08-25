import { useMemo, useCallback, useRef, useEffect, DependencyList } from 'react';

/**
 * Custom hook for deep equality comparison in dependencies
 * Useful when you want to memoize based on deep equality rather than referential equality
 *
 * @param value - The value to memoize
 * @param deps - Dependencies that trigger re-memoization
 * @returns Memoized value that only changes when deps deeply change
 *
 * @example
 * ```tsx
 * const config = useDeepMemo(() => ({
 *   filters: { status: 'active', category: 'all' },
 *   sort: { field: 'date', order: 'desc' }
 * }), [status, category, sortField, sortOrder]);
 * ```
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ value: T; deps: DependencyList }>();

  if (!ref.current || !deepEqual(deps, ref.current.deps)) {
    ref.current = { value: factory(), deps };
  }

  return ref.current.value;
}

/**
 * Custom hook for memoizing expensive computations with automatic dependency tracking
 * Tracks which properties are accessed and only recomputes when those change
 *
 * @param computation - The expensive computation function
 * @param dependencies - Object containing all potential dependencies
 * @returns Memoized result
 *
 * @example
 * ```tsx
 * const expensiveResult = useAutoMemo(
 *   () => heavyComputation(data, filters),
 *   { data, filters }
 * );
 * ```
 */
export function useAutoMemo<T, D extends Record<string, unknown>>(
  computation: () => T,
  dependencies: D
): T {
  const trackedKeys = useRef<Set<string>>(new Set());
  const lastDeps = useRef<Partial<D>>({});
  const result = useRef<T>();

  // Create proxy to track property access
  const proxy = useMemo(() => {
    return new Proxy(dependencies, {
      get(target, prop: string) {
        trackedKeys.current.add(prop);
        return target[prop];
      },
    });
  }, [dependencies]);

  // Check if tracked dependencies changed
  const depsChanged = Array.from(trackedKeys.current).some(
    (key) => dependencies[key] !== lastDeps.current[key]
  );

  if (result.current === undefined || depsChanged) {
    trackedKeys.current.clear();
    result.current = computation.call(proxy);
    lastDeps.current = { ...dependencies };
  }

  return result.current;
}

/**
 * Debounced callback hook with proper cleanup
 * Delays execution of callback until after wait milliseconds have elapsed
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies for the callback
 * @returns Debounced callback function
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (term: string) => searchAPI(term),
 *   500,
 *   []
 * );
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );
}

/**
 * Throttled callback hook
 * Ensures callback is called at most once per specified time period
 *
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled callback function
 *
 * @example
 * ```tsx
 * const throttledScroll = useThrottledCallback(
 *   () => handleScroll(),
 *   100
 * );
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        lastRun.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook for memoizing object creation with stable reference
 * Useful for preventing unnecessary re-renders when passing objects as props
 *
 * @param obj - Object to memoize
 * @returns Memoized object with stable reference
 *
 * @example
 * ```tsx
 * const config = useMemoizedObject({
 *   pageSize: 10,
 *   sortOrder: 'asc',
 *   filters: activeFilters
 * });
 * ```
 */
export function useMemoizedObject<T extends Record<string, unknown>>(obj: T): T {
  const ref = useRef<T>();
  const memoized = useMemo(() => {
    if (!ref.current || !shallowEqual(ref.current, obj)) {
      ref.current = obj;
    }
    return ref.current;
  }, [obj]);

  return memoized;
}

/**
 * Hook for creating stable callbacks that don't cause re-renders
 * Similar to useCallback but with stable reference
 *
 * @param callback - The callback function
 * @returns Stable callback reference
 *
 * @example
 * ```tsx
 * const stableHandler = useStableCallback((value: string) => {
 *   console.log(value, currentState);
 * });
 * ```
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Hook for lazy initialization of expensive values
 * Value is only computed once on first render
 *
 * @param factory - Factory function to create the initial value
 * @returns The lazily initialized value
 *
 * @example
 * ```tsx
 * const expensiveData = useLazyInit(() =>
 *   processLargeDataset(initialData)
 * );
 * ```
 */
export function useLazyInit<T>(factory: () => T): T {
  const ref = useRef<{ initialized: boolean; value: T }>();

  if (!ref.current?.initialized) {
    ref.current = {
      initialized: true,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * Hook for comparing previous and current values
 * Useful for debugging unnecessary re-renders
 *
 * @param value - Current value
 * @param name - Optional name for logging
 * @returns Previous value
 *
 * @example
 * ```tsx
 * const prevProps = usePrevious(props, 'MyComponent');
 * if (prevProps && !deepEqual(prevProps, props)) {
 *   console.log('Props changed');
 * }
 * ```
 */
export function usePrevious<T>(value: T, name?: string): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    if (name && process.env.NODE_ENV === 'development') {
      if (ref.current !== undefined && !Object.is(ref.current, value)) {
        console.log(`[usePrevious: ${name}] Value changed from`, ref.current, 'to', value);
      }
    }
    ref.current = value;
  });

  return ref.current;
}

// Utility functions

/**
 * Deep equality comparison
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

/**
 * Shallow equality comparison
 */
function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.is(a[key], b[key])) return false;
  }

  return true;
}
