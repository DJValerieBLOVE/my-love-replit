import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import ClubDetail from "@/pages/club-detail";
import Learning from "@/pages/learning";
import ExperimentDetail from "@/pages/experiment-detail";
import BigDreams from "@/pages/big-dreams";
import Resources from "@/pages/resources";
import Journal from "@/pages/journal";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Leaderboard from "@/pages/leaderboard";
import Feed from "@/pages/feed";
import AdminOnboarding from "@/pages/admin/onboarding";
import MentorStudio from "@/pages/admin/mentor-studio";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/community" component={Community} />
      <Route path="/community/:id" component={ClubDetail} />
      <Route path="/learning" component={Learning} />
      <Route path="/learning/:id" component={ExperimentDetail} />
      <Route path="/big-dreams" component={BigDreams} />
      <Route path="/resources" component={Resources} />
      <Route path="/journal" component={Journal} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/feed" component={Feed} />
      <Route path="/admin/onboarding" component={AdminOnboarding} />
      <Route path="/admin/mentor" component={MentorStudio} />
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
