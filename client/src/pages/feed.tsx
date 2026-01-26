import Layout from "@/components/layout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Zap, Share2, MoreHorizontal, Radio, Calendar, UserPlus } from "lucide-react";
import { Link } from "wouter";

const MOCK_POSTS = [
  {
    id: "1",
    author: {
      name: "Alex Luna",
      handle: "@alexluna",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    content: "Just completed my 30-day morning routine experiment! The compound effect is real. Sharing my learnings with the community later today.",
    timestamp: "2h ago",
    likes: 24,
    comments: 5,
    zaps: 1200,
    source: "nostr",
  },
  {
    id: "2",
    author: {
      name: "Jordan Rivera",
      handle: "@jordanr",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    content: "Big breakthrough in my Money area today. Finally automated my savings and it feels like a weight lifted off my shoulders. Small wins add up!",
    timestamp: "4h ago",
    likes: 42,
    comments: 8,
    zaps: 2100,
    source: "nostr",
  },
  {
    id: "3",
    author: {
      name: "11x LOVE LaB",
      handle: "@11xlovelab",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop",
    },
    content: "New module dropping tomorrow: 'The Art of Intentional Rest'. Get ready to level up your Time dimension!",
    timestamp: "6h ago",
    likes: 89,
    comments: 23,
    zaps: 5500,
    source: "community",
    community: "11x LOVE LaB",
  },
];

const COMMUNITY_POSTS = MOCK_POSTS.filter(p => p.source === "community");
const LEARNING_POSTS = [
  {
    id: "4",
    author: {
      name: "11x LOVE Foundations",
      handle: "@course",
      avatar: "",
    },
    content: "Discussion: What's your biggest takeaway from Module 3? Share your discoveries below.",
    timestamp: "1d ago",
    likes: 15,
    comments: 32,
    zaps: 800,
    source: "learning",
    course: "11x LOVE Foundations",
  },
];

const LIVE_NOW = [
  {
    id: "1",
    title: "Bitcoin Lightning Workshop",
    host: "Lightning Labs",
    type: "Workshop",
    avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    title: "Nostr Development AMA",
    host: "Nostr Dev",
    type: "Q&A",
    avatar: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=100&h=100&fit=crop",
  },
];

const UPCOMING_EVENTS = [
  { id: "1", title: "Bitcoin Lightning Workshop", date: "Tomorrow, 2:00 PM" },
  { id: "2", title: "Nostr Hackathon Kickoff", date: "Jan 15, 10:00 AM" },
  { id: "3", title: "Office Hours", date: "Today, 5:00 PM" },
];

const WHO_TO_FOLLOW = [
  {
    id: "1",
    name: "Satoshi Nakamoto",
    handle: "@satoshi",
    bio: "Bitcoin creator",
    followers: "12,500",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Lightning Dev",
    handle: "@lightningdev",
    bio: "Building the future",
    followers: "3,421",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
  },
];

function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow" data-testid={`post-${post.id}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{post.author.name}</span>
            <span className="text-muted-foreground text-sm">{post.author.handle}</span>
            <span className="text-muted-foreground text-xs">· {post.timestamp}</span>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 hover:bg-[#F0E6FF]" data-testid={`button-more-${post.id}`}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <p className="text-sm mt-1 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-6 mt-3">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-like-${post.id}`}>
              <Heart className="w-4 h-4" />
              <span data-testid={`count-likes-${post.id}`}>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-comment-${post.id}`}>
              <MessageCircle className="w-4 h-4" />
              <span data-testid={`count-comments-${post.id}`}>{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-zap-${post.id}`}>
              <Zap className="w-4 h-4" />
              <span data-testid={`count-zaps-${post.id}`}>{post.zaps.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm ml-auto" data-testid={`button-share-${post.id}`}>
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FeedSidebar() {
  return (
    <div className="space-y-6">
      {/* Live Now */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-sm">Live Now</span>
        </div>
        <div className="space-y-3">
          {LIVE_NOW.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2 rounded-xs hover:bg-[#F0E6FF] transition-colors cursor-pointer" data-testid={`live-event-${event.id}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={event.avatar} />
                <AvatarFallback>{event.host.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{event.host}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Upcoming Events</span>
        </div>
        <div className="space-y-2">
          {UPCOMING_EVENTS.map((event) => (
            <div key={event.id} className="p-2 rounded-xs hover:bg-[#F0E6FF] transition-colors cursor-pointer" data-testid={`upcoming-event-${event.id}`}>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.date}</p>
            </div>
          ))}
        </div>
        <Link href="/events">
          <Button variant="outline" className="w-full mt-4 hover:bg-[#F0E6FF]" data-testid="button-view-all-events">
            View All Events
          </Button>
        </Link>
      </Card>

      {/* Who to Follow */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Who to Follow</span>
        </div>
        <div className="space-y-3">
          {WHO_TO_FOLLOW.map((user) => (
            <div key={user.id} className="flex items-center gap-3" data-testid={`follow-suggestion-${user.id}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.bio}</p>
                <p className="text-xs text-muted-foreground">{user.followers} followers</p>
              </div>
              <Button size="sm" variant="outline" className="hover:bg-[#F0E6FF]" data-testid={`button-follow-${user.id}`}>
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-serif font-bold mb-2">Your Feed</h1>
        <p className="text-muted-foreground text-sm mb-6">Personalized updates from your courses, communities, and connections</p>
        
        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-3">
                <TabsTrigger value="all" data-testid="tab-all-nostr">All Nostr</TabsTrigger>
                <TabsTrigger value="communities" data-testid="tab-communities">Communities</TabsTrigger>
                <TabsTrigger value="learning" data-testid="tab-learning">Learning</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {MOCK_POSTS.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="communities" className="space-y-4">
                {COMMUNITY_POSTS.length > 0 ? (
                  COMMUNITY_POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No community posts yet.</p>
                    <p className="text-sm mt-2">Join a community to see their feed here.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="learning" className="space-y-4">
                {LEARNING_POSTS.length > 0 ? (
                  LEARNING_POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No learning discussions yet.</p>
                    <p className="text-sm mt-2">Enroll in a course to see discussions here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28">
              <FeedSidebar />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
