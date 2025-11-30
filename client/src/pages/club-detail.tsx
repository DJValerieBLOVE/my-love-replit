import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Zap, 
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Heart,
  Calendar,
  Sparkles
} from "lucide-react";
import { FeedPost } from "@/components/feed-post";
import { CreatePost } from "@/components/create-post";
import { Link, useRoute } from "wouter";
import { CLUBS, FEED_POSTS } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import CommunityCover from "@assets/generated_images/community_cover.png";

export default function ClubDetail() {
  const [, params] = useRoute("/community/:id");
  const clubId = params?.id;
  const club = CLUBS.find(c => c.id === clubId) || CLUBS[0];
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    setIsJoined(!isJoined);
    if (!isJoined) {
      toast.success(`Welcome to the ${club.name}!`);
    }
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img 
          src={CommunityCover} 
          alt={club.name} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-4 left-4 z-20">
          <Link href="/community">
            <Button variant="secondary" size="sm" className="gap-2 bg-background/50 backdrop-blur-md hover:bg-background/80 border-none text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Clubs
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="mb-2">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2 text-shadow-sm">{club.name}</h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-4">{club.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-foreground">1,240</span> Members
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-foreground">Active</span> Daily
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm h-10 px-6">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button 
              className={`gap-2 font-bold h-10 px-6 shadow-lg shadow-primary/20 min-w-[140px] ${isJoined ? "bg-secondary hover:bg-secondary/90" : ""}`}
              onClick={handleJoin}
            >
              {isJoined ? "Joined ✓" : "Join Club"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          {/* Create Post */}
          <CreatePost placeholder={`Share something with the ${club.name}...`} />

          {/* Feed Posts */}
          <div className="space-y-4">
            <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider px-1 mb-4">Pinned</h3>
            
            {/* Pinned Welcome Post - Using FeedPost style but manual for pinned content */}
            <FeedPost post={{
              id: "pinned-1",
              author: {
                name: `${club.name} Admin`,
                handle: "@admin",
                avatar: "" // Will fallback to initial
              },
              content: `Welcome to the ${club.name}! 👋 This is a safe space for us to connect, share, and grow together. \n\nPlease introduce yourself in the comments below and let us know what brings you here!`,
              likes: 142,
              comments: 56,
              zaps: 1000,
              timestamp: "Pinned"
            }} />

            <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider px-1 mt-8 mb-4">Recent Activity</h3>
            
            {FEED_POSTS.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Club Stats/Info */}
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-bold">About this Club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                A dedicated space for {club.name} enthusiasts to share knowledge, resources, and support.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">Oct 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Access</span>
                  <span className="font-medium text-green-500">Public</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Admins</span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <Avatar key={i} className="w-6 h-6 border-2 border-card">
                        <AvatarImage src={`https://i.pravatar.cc/100?img=${i}`} />
                      </Avatar>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-bold text-sm mb-3">Upcoming Events</h4>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-xs font-bold text-primary shrink-0">
                      <span>NOV</span>
                      <span>30</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">Weekly Sync & Vibe</p>
                      <p className="text-xs text-muted-foreground">2:00 PM EST</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
