import { useState } from "react";
import { format } from "date-fns";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit2, Trash2, Clock, CalendarIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const [filter, setFilter] = useState("All");
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const filteredTasks = tasks.filter(t => {
    if (filter === "All") return true;
    return t.status === filter;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your workload.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px] h-11 bg-white border-none shadow-sm rounded-xl">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="All">All Tasks</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <TaskDialog
            trigger={
              <Button className="h-11 rounded-xl px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-border shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No tasks found</h3>
              <p className="text-muted-foreground">Create a new task to get started.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className="group p-5 sm:p-6 border-none shadow-sm shadow-black/5 bg-white rounded-2xl hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} px-2.5 py-0.5 rounded-lg border text-xs font-semibold`}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={`${getStatusColor(task.status)} px-2.5 py-0.5 rounded-lg border text-xs font-semibold`}>
                          {task.status}
                        </Badge>
                      </div>
                      <h3 className={`text-lg font-bold text-foreground truncate ${task.status === 'Completed' ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </h3>
                      {task.details && (
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                          {task.details}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex flex-col gap-2">
                        {task.dueDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 opacity-70" />
                            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 opacity-70" />
                          <span>
                            {Math.floor(task.totalMinutesSpent / 60)}h {task.totalMinutesSpent % 60}m logged
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                          {task.status !== 'Completed' && (
                            <DropdownMenuItem 
                              className="rounded-lg cursor-pointer font-medium"
                              onClick={() => updateTask.mutate({ id: task.id, status: 'Completed' })}
                            >
                              <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" />
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                          <TaskDialog 
                            task={task} 
                            trigger={
                              <DropdownMenuItem className="rounded-lg cursor-pointer font-medium" onSelect={(e) => e.preventDefault()}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Task
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator className="bg-border/50" />
                          <DropdownMenuItem 
                            className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
                            onClick={() => deleteTask.mutate(task.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
