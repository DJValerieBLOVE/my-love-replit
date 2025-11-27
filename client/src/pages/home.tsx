import Layout from "@/components/layout";
import { FeedPost } from "@/components/feed-post";
import { StreakWidget } from "@/components/streak-widget";
import { FEED_POSTS, STREAK_DATA, CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
          <Button size="sm" className="hidden md:flex bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>

        {/* Mobile Streak Widget */}
        <StreakWidget streak={CURRENT_USER.streak} data={STREAK_DATA} />

        {/* Daily Goal */}
        <Card className="bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <CardContent className="p-5 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold">Daily Goal: Connect</h3>
              </div>
              <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">2/3</span>
            </div>
            <p className="text-sm opacity-90 mb-4">Reply to 2 community members to complete today's goal and earn 50 XP.</p>
            <Progress value={66} className="h-2 bg-black/20 [&>div]:bg-yellow-300" />
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
