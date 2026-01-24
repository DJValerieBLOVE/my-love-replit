import Layout from "@/components/layout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Zap, Share2, MoreHorizontal } from "lucide-react";

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

export default function Feed() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-serif font-bold mb-6">Feed</h1>
        
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
    </Layout>
  );
}
