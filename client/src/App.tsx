import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import TimesheetPage from "@/pages/timesheet";

function ProtectedRoute({ component: Component }: { component: React.ElementType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null; // Handled by AppLayout wrapper visually
  if (!user) return <Redirect to="/auth" />;
  
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/auth">
        {() => (user ? <Redirect to="/" /> : <AuthPage />)}
      </Route>
      
      <Route path="/">
        {() => (user ? <AppLayout><ProtectedRoute component={Dashboard} /></AppLayout> : <Redirect to="/auth" />)}
      </Route>
      
      <Route path="/tasks">
        {() => (user ? <AppLayout><ProtectedRoute component={TasksPage} /></AppLayout> : <Redirect to="/auth" />)}
      </Route>
      
      <Route path="/timesheet">
        {() => (user ? <AppLayout><ProtectedRoute component={TimesheetPage} /></AppLayout> : <Redirect to="/auth" />)}
      </Route>

      <Route>{() => <Redirect to={user ? "/" : "/auth"} />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
