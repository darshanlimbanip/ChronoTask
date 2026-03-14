import { useRef } from "react";
import { useLocation } from "wouter";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { CheckSquare, AlertCircle, Calendar, Clock } from "lucide-react";
import { isToday, isPast, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useTasks();
  const [, setLocation] = useLocation();
  const timeChartRef = useRef<HTMLDivElement | null>(null);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  }

  // Calculate stats
  const totalActive = tasks.filter(t => t.status !== "Completed").length;
  
  const todaysTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return isToday(new Date(t.dueDate)) && t.status !== "Completed";
  }).length;

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    // Overdue if due date is before today (not including today)
    const dueDate = new Date(t.dueDate);
    return isPast(dueDate) && !isToday(dueDate) && t.status !== "Completed";
  }).length;

  const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.totalMinutesSpent || 0), 0);
  const hours = Math.floor(totalTimeSpent / 60);
  const minutes = totalTimeSpent % 60;

  // Chart data: Top 5 tasks by time spent
  const chartData = [...tasks]
    .filter(t => t.totalMinutesSpent > 0)
    .sort((a, b) => b.totalMinutesSpent - a.totalMinutesSpent)
    .slice(0, 7)
    .map(t => ({
      name: t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title,
      hours: +(t.totalMinutesSpent / 60).toFixed(1)
    }));

  const statsCards = [
    { id: "active" as const, title: "Active Tasks", value: totalActive, icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "today" as const, title: "Due Today", value: todaysTasks, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "overdue" as const, title: "Overdue", value: overdueTasks, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "time" as const, title: "Total Time", value: `${hours}h ${minutes}m`, icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const handleStatClick = (id: "active" | "today" | "overdue" | "time") => {
    if (id === "time") {
      timeChartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const viewParam =
      id === "active" ? "active" :
      id === "today" ? "today" :
      "overdue";

    setLocation(`/tasks?view=${viewParam}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here's your productivity overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 border-none shadow-xl shadow-black/5 bg-white rounded-2xl flex items-center gap-5 hover-elevate">
              <button
                type="button"
                onClick={() => handleStatClick(stat.id)}
                className="flex items-center gap-5 w-full text-left"
              >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-display font-bold text-foreground">{stat.value}</h3>
              </div>
              </button>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <Card
          ref={timeChartRef}
          className="lg:col-span-2 p-8 border-none shadow-xl shadow-black/5 bg-white rounded-3xl"
        >
          <h3 className="text-xl font-display font-bold mb-6">Time Allocation (Top Tasks)</h3>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="hours" name="Hours Spent" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No time logged yet. Start a timer to see data!
            </div>
          )}
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-black/5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-3xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold mb-3">Ready to focus?</h3>
            <p className="text-blue-100 mb-8 leading-relaxed">
              Tracking time directly against tasks improves estimate accuracy by up to 40%.
            </p>
            <a 
              href="/timesheet"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white text-indigo-600 font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Stopwatch
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
