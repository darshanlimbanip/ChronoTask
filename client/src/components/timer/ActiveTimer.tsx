import { useState, useEffect } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/use-tasks";
import { useCreateTimeLog } from "@/hooks/use-time-logs";
import { motion, AnimatePresence } from "framer-motion";

export function ActiveTimer() {
  const { data: tasks = [] } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const pendingTasks = tasks.filter(t => t.status !== "Completed");
  const createLogMutation = useCreateTimeLog(selectedTaskId ? parseInt(selectedTaskId) : null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = () => {
    if (!selectedTaskId) return;
    setStartTime(new Date());
    setIsActive(true);
    setElapsedSeconds(0);
  };

  const handleStop = async () => {
    if (!startTime || !selectedTaskId) return;
    
    const endTime = new Date();
    // Calculate duration in minutes, minimum 1 minute if it ran at all
    const durationMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    
    setIsActive(false);
    
    try {
      await createLogMutation.mutateAsync({
        startTime,
        endTime,
        durationMinutes,
        isManual: false
      });
      setElapsedSeconds(0);
      setStartTime(null);
    } catch (e) {
      // Keep state active if it fails so they can retry? 
      // Actually we'll just let the hook toast the error.
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-8 md:p-12 flex flex-col items-center justify-center border-none shadow-xl bg-white rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
      
      <div className="w-full max-w-sm mb-10">
        <label className="block text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">
          Working On
        </label>
        <Select 
          value={selectedTaskId} 
          onValueChange={setSelectedTaskId}
          disabled={isActive}
        >
          <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/60 text-lg shadow-sm">
            <SelectValue placeholder="Select a task..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            {pendingTasks.map((task) => (
              <SelectItem key={task.id} value={task.id.toString()} className="py-3">
                {task.title}
              </SelectItem>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No active tasks available.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="text-[5rem] md:text-[7rem] font-display font-bold tracking-tighter text-foreground tabular-nums leading-none mb-12">
        {formatTime(elapsedSeconds)}
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleStart}
              disabled={!selectedTaskId}
              className="h-20 w-48 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            >
              <Play className="w-7 h-7 mr-3 fill-current" />
              START
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="stop"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleStop}
              disabled={createLogMutation.isPending}
              className="h-20 w-48 rounded-full text-xl font-bold bg-destructive hover:bg-destructive/90 shadow-xl shadow-destructive/30 hover:shadow-2xl hover:shadow-destructive/40 hover:-translate-y-1 transition-all"
            >
              {createLogMutation.isPending ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  <Square className="w-6 h-6 mr-3 fill-current" />
                  STOP
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
