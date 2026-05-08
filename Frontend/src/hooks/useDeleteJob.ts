import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "@/features/jobs/api/jobs-api";

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteJob(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};