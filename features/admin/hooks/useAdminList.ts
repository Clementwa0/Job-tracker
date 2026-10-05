"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminPagination } from "@/features/admin/hooks/useAdminPagination";
import { getApiErrorMessage } from "@/lib/apiError";
import type { PaginatedMeta } from "@/types/admin";

export interface AdminListPage<T, S> {
  items: T[];
  meta: PaginatedMeta;
  summary: S;
}

export interface AdminListQuery {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 1 };

/**
 * Server-paginated list state for the admin tables: debounced search, a status
 * filter, URL-backed page/limit, race-safe fetching and a `reload` for after a
 * moderation action. `fetchPage` should be a stable reference (module-level or
 * useCallback) - it's part of the effect's dependencies.
 */
export function useAdminList<T, S>(
  fetchPage: (query: AdminListQuery) => Promise<AdminListPage<T, S>>,
  emptySummary: S,
) {
  const { page, limit, setPage, setLimit, resetPage } = useAdminPagination();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedQ = useDebounce(q.trim(), 300);

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [summary, setSummary] = useState<S>(emptySummary);
  const [attempt, setAttempt] = useState(0);
  // The request key of the last response (or failure) that came back. `loading` is derived
  // from it: whenever the current key differs, a request is in flight.
  const [settled, setSettled] = useState<{ key: string; error: string | null } | null>(null);

  // Changing a filter returns to page 1.
  const prevFilters = useRef({ q: debouncedQ, status: statusFilter });
  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.q !== debouncedQ || prev.status !== statusFilter) {
      prevFilters.current = { q: debouncedQ, status: statusFilter };
      resetPage();
    }
  }, [debouncedQ, statusFilter, resetPage]);

  const status = statusFilter === "all" ? undefined : statusFilter;
  const requestKey = `${page}|${limit}|${debouncedQ}|${statusFilter}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    fetchPage({
      page,
      limit,
      q: debouncedQ || undefined,
      status,
    })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
        setSummary(result.summary);
        setSettled({ key: requestKey, error: null });
        // The last row of the last page was just removed from the filter: step back.
        if (result.items.length === 0 && result.meta.total > 0 && page > result.meta.totalPages) {
          setPage(result.meta.totalPages);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setSettled({ key: requestKey, error: getApiErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, page, limit, debouncedQ, status, requestKey, setPage]);

  const loading = settled?.key !== requestKey;
  const error = loading ? null : (settled?.error ?? null);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    items,
    meta,
    summary,
    loading,
    error,
    reload,
    q,
    setQ,
    statusFilter,
    setStatusFilter,
    page,
    limit,
    setPage,
    setLimit,
  };
}
