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
  
  return (
    <Switch>
      <Route path="/auth">
        {() => (isLoading ? null : user ? <Redirect to="/" /> : <AuthPage />)}
      </Route>
      
      <Route path="/">
        <AppLayout>
          <ProtectedRoute component={Dashboard} />
        </AppLayout>
      </Route>
      
      <Route path="/tasks">
        <AppLayout>
          <ProtectedRoute component={TasksPage} />
        </AppLayout>
      </Route>
      
      <Route path="/timesheet">
        <AppLayout>
          <ProtectedRoute component={TimesheetPage} />
        </AppLayout>
      </Route>

      <Route component={NotFound} />
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
