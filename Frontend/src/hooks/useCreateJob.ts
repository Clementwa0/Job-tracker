import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/services/jobs.service";

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};