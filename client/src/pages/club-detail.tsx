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
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-background shadow-xl flex items-center justify-center p-4 ${club.color} border-4 border-background shrink-0`}>
              <club.icon className="w-full h-full" strokeWidth={1.5} />
            </div>
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
            <Button variant="outline" size="lg" className="gap-2 bg-background/50 backdrop-blur-sm">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button 
              size="lg" 
              className={`gap-2 font-bold text-lg shadow-lg shadow-primary/20 min-w-[140px] ${isJoined ? "bg-secondary hover:bg-secondary/90" : ""}`}
              onClick={handleJoin}
            >
              {isJoined ? "Joined ✓" : "Join Club"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Post Input */}
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder={`Share something with the ${club.name}...`}
                  className="w-full bg-muted/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button size="sm" className="rounded-full px-6">Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed Posts */}
          <div className="space-y-4">
            <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider px-1">Pinned</h3>
            
            {/* Pinned Welcome Post */}
            <Card className="border-l-4 border-l-primary shadow-sm border-y-0 border-r-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${club.color} bg-opacity-10 flex items-center justify-center`}>
                      <club.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{club.name} Admin</p>
                      <p className="text-xs text-muted-foreground">Pinned • 2 days ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Welcome to the {club.name}! 👋 This is a safe space for us to connect, share, and grow together. 
                  Please introduce yourself in the comments below and let us know what brings you here!
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-pink-500 gap-2">
                    <Heart className="w-4 h-4" /> 142
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 gap-2">
                    <MessageSquare className="w-4 h-4" /> 56
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider px-1 mt-8">Recent Activity</h3>
            
            {FEED_POSTS.map((post) => (
              <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-all bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">{post.author.handle} • {post.timestamp}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                  
                  <p className="text-foreground/90 leading-relaxed mb-4">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-xl overflow-hidden mb-4">
                      <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-pink-500 gap-2">
                        <Heart className="w-4 h-4" /> {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 gap-2">
                        <MessageSquare className="w-4 h-4" /> {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-500 gap-2">
                        <Zap className="w-4 h-4" /> {post.zaps}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
