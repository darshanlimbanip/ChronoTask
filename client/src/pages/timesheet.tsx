import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { ManualEntryForm } from "@/components/timer/ManualEntryForm";

export default function TimesheetPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">Time Tracker</h1>
        <p className="text-muted-foreground text-lg">
          Log effort against specific tasks to build accurate productivity insights.
        </p>
      </div>

      <Tabs defaultValue="stopwatch" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-white/50 backdrop-blur border border-border/50 p-1.5 rounded-2xl shadow-sm h-auto">
            <TabsTrigger 
              value="stopwatch" 
              className="px-8 py-3 rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"
            >
              Active Timer
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="px-8 py-3 rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"
            >
              Manual Entry
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="stopwatch" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <ActiveTimer />
        </TabsContent>
        
        <TabsContent value="manual" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <ManualEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
