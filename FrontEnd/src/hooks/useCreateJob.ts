import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/features/jobs/api/jobs-api";

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};