import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NostrProvider } from "@/contexts/nostr-context";
import { NDKProvider } from "@/contexts/ndk-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import CommunityCreate from "@/pages/community-create";
import CommunityAdmin from "@/pages/community-admin";
import ClubDetail from "@/pages/club-detail";
import Experiments from "@/pages/experiments";
import ExperimentDetail from "@/pages/experiment-detail";
import CourseBuilder from "@/pages/course-builder";
import ExperimentBuilder from "@/pages/experiment-builder";
import CreatorDashboard from "@/pages/creator-dashboard";
import CourseDetail from "@/pages/course-detail";
import BigDreams from "@/pages/big-dreams";
import Vault from "@/pages/vault";
import Journal from "@/pages/journal";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Leaderboard from "@/pages/leaderboard";
import Feed from "@/pages/feed";
import DailyPracticePage from "@/pages/daily-practice";
import AdminOnboarding from "@/pages/admin/onboarding";
import MentorStudio from "@/pages/admin/mentor-studio";
import HowToUse from "@/pages/how-to-use";
import SettingsPage from "@/pages/settings";
import RelaysPage from "@/pages/relays";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/community" component={Community} />
      <Route path="/community/create" component={CommunityCreate} />
      <Route path="/community/:id/admin" component={CommunityAdmin} />
      <Route path="/community/:id" component={ClubDetail} />
      <Route path="/experiments" component={Experiments} />
      <Route path="/experiments/create" component={ExperimentBuilder} />
      <Route path="/experiments/course/create" component={CourseBuilder} />
      <Route path="/experiments/course/:id" component={CourseDetail} />
      <Route path="/experiments/:id" component={ExperimentDetail} />
      <Route path="/big-dreams" component={BigDreams} />
      <Route path="/vault" component={Vault} />
      <Route path="/journal" component={Journal} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/creator" component={CreatorDashboard} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/feed" component={Feed} />
      <Route path="/daily-practice" component={DailyPracticePage} />
      <Route path="/how-to-use" component={HowToUse} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/relays" component={RelaysPage} />
      <Route path="/admin/onboarding" component={AdminOnboarding} />
      <Route path="/admin/mentor" component={MentorStudio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NostrProvider>
        <NDKProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </NDKProvider>
      </NostrProvider>
    </QueryClientProvider>
  );
}

export default App;
