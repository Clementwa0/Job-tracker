import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJob } from "@/services/jobs.service";

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateJob(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};