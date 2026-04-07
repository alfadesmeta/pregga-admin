import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<() => void>>();
const CACHE_TTL = 60000; // 60 seconds

function getCacheKey(key: string | string[]): string {
  return Array.isArray(key) ? key.join(':') : key;
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.timestamp > CACHE_TTL;
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    listeners.forEach((listenerSet) => {
      listenerSet.forEach((listener) => listener());
    });
    return;
  }

  const keysToInvalidate: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToInvalidate.push(key);
    }
  });

  keysToInvalidate.forEach((key) => {
    cache.delete(key);
    listeners.get(key)?.forEach((listener) => listener());
  });
}

export async function prefetchQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>
): Promise<void> {
  const cacheKey = getCacheKey(key);
  const existingEntry = cache.get(cacheKey);

  if (existingEntry && !isExpired(existingEntry)) {
    return;
  }

  if (inFlight.has(cacheKey)) {
    await inFlight.get(cacheKey);
    return;
  }

  const promise = fetcher().then((data) => {
    cache.set(cacheKey, { data, timestamp: Date.now() });
    inFlight.delete(cacheKey);
    return data;
  }).catch((error) => {
    inFlight.delete(cacheKey);
    throw error;
  });

  inFlight.set(cacheKey, promise);
  await promise;
}

interface UseSupabaseQueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseSupabaseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> {
  const { enabled = true, initialData, onSuccess, onError } = options;
  const cacheKey = getCacheKey(key);
  
  const [data, setData] = useState<T | undefined>(() => {
    const cached = cache.get(cacheKey);
    if (cached && !isExpired(cached)) {
      return cached.data as T;
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const cached = cache.get(cacheKey);
    if (cached && !isExpired(cached)) {
      setData(cached.data as T);
      setIsLoading(false);
      return;
    }

    if (inFlight.has(cacheKey)) {
      try {
        const result = await inFlight.get(cacheKey);
        setData(result as T);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const promise = fetcherRef.current().then((result) => {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      inFlight.delete(cacheKey);
      setData(result);
      setIsLoading(false);
      onSuccess?.(result);
      return result;
    }).catch((err) => {
      inFlight.delete(cacheKey);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      onError?.(error);
      throw err;
    });

    inFlight.set(cacheKey, promise);
    
    try {
      await promise;
    } catch {
      // Error already handled
    }
  }, [cacheKey, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!listeners.has(cacheKey)) {
      listeners.set(cacheKey, new Set());
    }
    const listenerSet = listeners.get(cacheKey)!;
    listenerSet.add(fetchData);

    return () => {
      listenerSet.delete(fetchData);
      if (listenerSet.size === 0) {
        listeners.delete(cacheKey);
      }
    };
  }, [cacheKey, fetchData]);

  const refetch = useCallback(async () => {
    cache.delete(cacheKey);
    await fetchData();
  }, [cacheKey, fetchData]);

  return { data, isLoading, error, refetch };
}

interface UseSupabasePaginatedQueryOptions<T> extends UseSupabaseQueryOptions<{ data: T[]; count: number }> {
  pageSize?: number;
}

interface UseSupabasePaginatedQueryResult<T> {
  data: T[];
  count: number;
  isLoading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useSupabasePaginatedQuery<T>(
  key: string | string[],
  fetcher: (from: number, to: number) => Promise<{ data: T[]; count: number }>,
  options: UseSupabasePaginatedQueryOptions<T> = {}
): UseSupabasePaginatedQueryResult<T> {
  const { pageSize = 10, enabled = true, onSuccess, onError } = options;
  const [page, setPage] = useState(1);
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const paginatedKey = Array.isArray(key) 
    ? [...key, `page:${page}`, `size:${pageSize}`]
    : [key, `page:${page}`, `size:${pageSize}`];

  const { data, isLoading, error, refetch } = useSupabaseQuery(
    paginatedKey,
    () => fetcher(from, to),
    { enabled, onSuccess, onError }
  );

  return {
    data: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil((data?.count || 0) / pageSize),
    setPage,
    refetch,
  };
}
