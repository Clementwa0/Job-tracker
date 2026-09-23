"use client";

import { useCallback, useEffect, useState } from "react";
import { interviewService } from "@/features/jobseeker/interviews/services/interview.client";
import type { Interview } from "@/types/interview";

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await interviewService.getInterviews();
      setInterviews(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return {
    interviews,
    loading,
    refetch: fetchInterviews,
  };
};
