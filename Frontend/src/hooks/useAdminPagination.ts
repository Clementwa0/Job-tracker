import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function useAdminPagination(defaultLimit: PageSize = 20) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rawLimit = Number(searchParams.get("limit"));
  const limit: PageSize = (PAGE_SIZES as readonly number[]).includes(rawLimit)
    ? (rawLimit as PageSize)
    : defaultLimit;

  const setParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === undefined || value === "") {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (p: number) => setParams({ page: p <= 1 ? null : p }),
    [setParams],
  );

  const setLimit = useCallback(
    (l: PageSize) => setParams({ limit: l === defaultLimit ? null : l, page: null }),
    [setParams, defaultLimit],
  );

  const resetPage = useCallback(() => setParams({ page: null }), [setParams]);

  return { page, limit, setPage, setLimit, setParams, resetPage, searchParams };
}

export function pageRangeLabel(page: number, limit: number, total: number): string {
  if (total === 0) return "Showing 0 of 0 records";
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `Showing ${start}–${end} of ${total} records`;
}

export function visiblePageNumbers(current: number, totalPages: number, max = 5): number[] {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
