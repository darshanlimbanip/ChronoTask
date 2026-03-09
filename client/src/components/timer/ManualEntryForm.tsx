import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useTasks } from "@/hooks/use-tasks";
import { useCreateTimeLog } from "@/hooks/use-time-logs";

const formSchema = z.object({
  taskId: z.string().min(1, "Task is required"),
  date: z.string().min(1, "Date is required"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
});
type FormValues = z.infer<typeof formSchema>;

export function ManualEntryForm() {
  const { data: tasks = [] } = useTasks();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: "",
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 60,
    },
  });

  const selectedTaskId = form.watch("taskId");
  const createLogMutation = useCreateTimeLog(selectedTaskId ? parseInt(selectedTaskId) : null);

  const onSubmit = async (values: FormValues) => {
    // Generate synthetic start/end times based on the date and duration
    const start = new Date(values.date);
    start.setHours(9, 0, 0, 0); // Default to 9 AM for manual entries if just picking date
    
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + values.durationMinutes);

    await createLogMutation.mutateAsync({
      startTime: start,
      endTime: end,
      durationMinutes: values.durationMinutes,
      isManual: true,
    });
    
    form.reset({ ...values, durationMinutes: 60 });
  };

  return (
    <Card className="p-8 border-none shadow-xl bg-white rounded-3xl">
      <div className="mb-8">
        <h3 className="text-2xl font-display font-bold text-foreground">Log Time Manually</h3>
        <p className="text-muted-foreground mt-2">Add retro-active time for tasks you forgot to track.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="taskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Task</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20">
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="h-12 rounded-xl bg-muted/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Duration (min)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      className="h-12 rounded-xl bg-muted/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={createLogMutation.isPending}
            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-4"
          >
            {createLogMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Save Time Entry
          </Button>
        </form>
      </Form>
    </Card>
  );
}
