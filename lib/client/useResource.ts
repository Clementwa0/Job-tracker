"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

/**
 * A tiny shared, keyed data cache for server-backed UI state.
 *
 * Every component that asks for the same `key` shares one cached value and
 * one in-flight request, so e.g. two dashboard cards showing the profile
 * cause a single fetch and always agree. Cached data is shown immediately
 * while a fresh copy is fetched (stale-while-revalidate), and refetched when
 * the tab regains focus (and optionally on an interval) - which is what
 * keeps the same account in sync across devices.
 *
 * Keys should include the user's id so nothing leaks between accounts.
 */

interface Entry {
  data: unknown;
  hasData: boolean;
  error: unknown;
  fetchedAt: number;
  inflight: Promise<void> | undefined;
  listeners: Set<() => void>;
}

const cache = new Map<string, Entry>();

function entryFor(key: string): Entry {
  let entry = cache.get(key);
  if (!entry) {
    entry = {
      data: undefined,
      hasData: false,
      error: undefined,
      fetchedAt: 0,
      inflight: undefined,
      listeners: new Set(),
    };
    cache.set(key, entry);
  }
  return entry;
}

function notify(entry: Entry) {
  entry.listeners.forEach((listener) => listener());
}

function load<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
  const entry = entryFor(key);
  if (entry.inflight) return entry.inflight;

  entry.inflight = (async () => {
    try {
      entry.data = await fetcher();
      entry.hasData = true;
      entry.error = undefined;
      entry.fetchedAt = Date.now();
    } catch (error) {
      entry.error = error;
    } finally {
      entry.inflight = undefined;
      notify(entry);
    }
  })();

  notify(entry);
  return entry.inflight;
}

/** Overwrites a cached value (e.g. for optimistic updates) and re-renders subscribers. */
export function setResourceData<T>(key: string, next: T | ((prev: T | undefined) => T)) {
  const entry = entryFor(key);
  const value =
    typeof next === "function"
      ? (next as (prev: T | undefined) => T)(entry.hasData ? (entry.data as T) : undefined)
      : next;
  entry.data = value;
  entry.hasData = true;
  entry.error = undefined;
  entry.fetchedAt = Date.now();
  notify(entry);
}

/** Drops cached data for keys starting with `prefix` (e.g. on sign-out). */
export function clearResources(prefix = "") {
  for (const [key, entry] of cache) {
    if (!key.startsWith(prefix)) continue;
    entry.data = undefined;
    entry.hasData = false;
    entry.error = undefined;
    entry.fetchedAt = 0;
    notify(entry);
  }
}

interface Options {
  /** Data younger than this isn't refetched on mount. Default 2s (just dedupes siblings). */
  staleMs?: number;
  /** Also refetch on this interval while the tab is visible. */
  pollMs?: number;
}

export function useResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  { staleMs = 2000, pollMs }: Options = {},
) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!key) return;
    const entry = entryFor(key);
    entry.listeners.add(rerender);

    const revalidate = () => {
      if (document.visibilityState === "hidden") return;
      void load(key, () => fetcherRef.current());
    };

    if (Date.now() - entry.fetchedAt >= staleMs) {
      void load(key, () => fetcherRef.current());
    }

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    const timer = pollMs ? window.setInterval(revalidate, pollMs) : undefined;

    return () => {
      entry.listeners.delete(rerender);
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [key, staleMs, pollMs]);

  const refresh = useCallback(async () => {
    if (!key) return;
    await load(key, () => fetcherRef.current());
    if (entryFor(key).error !== undefined) {
      throw entryFor(key).error;
    }
  }, [key]);

  const mutate = useCallback(
    (next: T | ((prev: T | undefined) => T)) => {
      if (key) setResourceData<T>(key, next);
    },
    [key],
  );

  const entry = key ? cache.get(key) : undefined;
  return {
    data: entry?.hasData ? (entry.data as T) : undefined,
    error: entry?.error,
    /** True until the first response (or error) for this key has arrived. */
    isLoading: !!key && !entry?.hasData && entry?.error === undefined,
    refresh,
    mutate,
  };
}
