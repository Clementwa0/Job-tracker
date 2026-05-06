import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1m: avoids refetch on quick navigations
        gcTime: 10 * 60_000, // 10m: keep cache around for a while
        retry: (failureCount, error) => {
          // Don't endlessly retry auth/permission errors.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const status = (error as any)?.status ?? (error as any)?.response?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

