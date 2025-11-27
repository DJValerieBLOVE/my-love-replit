import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import Courses from "@/pages/courses";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import AdminOnboarding from "@/pages/admin/onboarding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/community" component={Community} />
      <Route path="/courses" component={Courses} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
      <Route path="/admin/onboarding" component={AdminOnboarding} />
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
