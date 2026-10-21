"use client";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useResource } from "@/lib/client/useResource";
import type { RecommendationsResponse } from "@/types/profile";
import { recommendationService } from "../services/profile.client";

export function useRecommendations(limit = 50) {
  const { user } = useAuth();
  const key = user?.role === "user" ? `recommendations:${user._id}:${limit}` : null;

  const { data, isLoading, refresh } = useResource<RecommendationsResponse>(
    key,
    () => recommendationService.list(limit),
    { pollMs: 5 * 60_000 },
  );

  return { data, isLoading, refresh };
}
