"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useResource } from "@/lib/client/useResource";

import type { ProfileResponse } from "@/types/profile";
import { profileService, ProfileUpdate } from "../services/profile.client";

/**
 * The signed-in job seeker's profile, preferences and server-computed
 * completeness. Shared across every component that calls it (one fetch).
 */
export function useProfile() {
  const { user } = useAuth();
  const key = user?.role === "user" ? `profile:${user._id}` : null;

  const { data, isLoading, refresh, mutate } = useResource<ProfileResponse>(
    key,
    () => profileService.get(),
  );

  /** Saves changes and updates every subscriber with the recomputed profile. */
  const save = useCallback(
    async (patch: ProfileUpdate) => {
      const next = await profileService.update(patch);
      mutate(next);
      return next;
    },
    [mutate],
  );

  return { profile: data, isLoading, refresh, save };
}
