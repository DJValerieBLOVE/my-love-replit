import Layout from "@/components/layout";
import { FeedPost } from "@/components/feed-post";
import { StreakWidget } from "@/components/streak-widget";
import { FEED_POSTS, STREAK_DATA, CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ONBOARDING_STEPS } from "@/lib/mock-data";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Good Morning, Sarah! ☀️
            </h1>
            <p className="text-muted-foreground">You're on a 12-day streak. Keep it up!</p>
          </div>
          <Button size="lg" className="hidden md:flex bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity text-base font-semibold" style={{ fontSize: "18px" }}>
            <Plus className="w-5 h-5 mr-2" /> New Post
          </Button>
        </div>

        {/* Onboarding Checklist (Collapsible if needed) */}
        <OnboardingChecklist data={ONBOARDING_STEPS} />

        {/* Mobile Streak Widget */}
        <div className="lg:hidden">
          <StreakWidget streak={CURRENT_USER.streak} data={STREAK_DATA} />
        </div>

        {/* Daily Goal */}
        <Card className="bg-gradient-to-r from-purple-900 to-pink-900 text-white border-none shadow-lg relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full -ml-10 -mb-10 blur-xl" />
          
          <CardContent className="p-5 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h3 className="font-bold font-serif">Daily Goal: Connect</h3>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full border border-white/10">2/3</span>
            </div>
            <p className="text-sm opacity-90 mb-4 font-medium text-purple-100">Reply to 2 community members to complete today's goal and earn <span className="text-yellow-300 font-bold">50 Sats</span>.</p>
            <Progress value={66} className="h-2 bg-black/30 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-orange-500" />
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg px-1">Community Highlights</h2>
          {FEED_POSTS.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
