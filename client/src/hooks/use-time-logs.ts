import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type CreateTimeLogInput = z.infer<typeof api.timeLogs.create.input>;

export function useTaskTimeLogs(taskId: number | null) {
  return useQuery({
    queryKey: [api.timeLogs.list.path, taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const url = buildUrl(api.timeLogs.list.path, { taskId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch time logs");
      return api.timeLogs.list.responses[200].parse(await res.json());
    },
    enabled: !!taskId
  });
}

export function useCreateTimeLog(taskId: number | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTimeLogInput) => {
      if (!taskId) throw new Error("No task selected");
      const url = buildUrl(api.timeLogs.create.path, { taskId });
      const res = await fetch(url, {
        method: api.timeLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startTime: typeof data.startTime === 'object' ? data.startTime.toISOString() : data.startTime,
          endTime: typeof data.endTime === 'object' ? data.endTime.toISOString() : data.endTime,
        }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to log time");
      return api.timeLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: [api.timeLogs.list.path, taskId] });
        queryClient.invalidateQueries({ queryKey: [api.tasks.get.path, taskId] });
      }
      toast({ title: "Time logged successfully" });
    },
    onError: (err) => {
      toast({ title: "Error logging time", description: err.message, variant: "destructive" });
    }
  });
}
