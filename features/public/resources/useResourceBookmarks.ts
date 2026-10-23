"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useResource } from "@/lib/client/useResource";
import { getApiErrorMessage } from "@/lib/apiError";
import { resourcesService } from "./services/resources.client";

/**
 * The signed-in jobseeker's bookmarked resource ids, shared by every card on
 * the page (one fetch, optimistic toggles). `enabled` is false for visitors
 * and for admins/employers, who have no bookmarks.
 */
export function useResourceBookmarks() {
  const { user } = useAuth();
  const enabled = user?.role === "user";
  const key = enabled ? `resource-bookmarks:${user?.id}` : null;

  const { data, isLoading, mutate } = useResource<string[]>(key, () => resourcesService.bookmarkIds(), { staleMs: 30_000 });
  const ids = useMemo(() => new Set(data ?? []), [data]);

  const toggle = useCallback(
    async (resourceId: string) => {
      if (!enabled) return;
      const wasSaved = ids.has(resourceId);
      // Optimistic update; roll back if the request fails.
      mutate((prev) => (wasSaved ? (prev ?? []).filter((id) => id !== resourceId) : [...(prev ?? []), resourceId]));
      try {
        if (wasSaved) await resourcesService.removeBookmark(resourceId);
        else await resourcesService.addBookmark(resourceId);
        toast.success(wasSaved ? "Removed from saved resources" : "Saved to your resources");
      } catch (error) {
        mutate((prev) => (wasSaved ? [...(prev ?? []), resourceId] : (prev ?? []).filter((id) => id !== resourceId)));
        toast.error(getApiErrorMessage(error));
      }
    },
    [enabled, ids, mutate],
  );

  return { enabled, ids, isLoading, toggle };
}
