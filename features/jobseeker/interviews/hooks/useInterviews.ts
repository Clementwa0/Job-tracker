"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { interviewService } from "@/features/jobseeker/interviews/services/interview.client";
import { useResource } from "@/lib/client/useResource";
import { interviewsKey } from "@/lib/client/dataKeys";
import type { Interview } from "@/types/interview";

const NO_INTERVIEWS: Interview[] = [];

/**
 * The user's interviews. Every component calling this shares one cached copy
 * (previously each had its own state, so scheduling an interview on one page
 * left the dashboard, calendar and analytics stale). Creating, editing or
 * deleting an interview through `interviewService` refreshes all of them.
 */
export const useInterviews = () => {
  const { user } = useAuth();
  const key = user?.role === "user" ? interviewsKey(user._id) : null;

  const { data, error, isLoading, refresh } = useResource<Interview[]>(
    key,
    () => interviewService.getInterviews(),
  );

  const refetch = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // `error` carries it; callers that need to react read that.
    }
  }, [refresh]);

  return {
    interviews: data ?? NO_INTERVIEWS,
    loading: isLoading,
    error,
    refetch,
  };
};
