import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "@/services/jobs.service";

export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5,
  });
};