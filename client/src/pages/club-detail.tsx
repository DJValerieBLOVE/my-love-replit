import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Zap, 
  ArrowLeft,
  Share2,
  Lock,
  Settings,
  UserPlus,
  Loader2,
  Flame,
  Trophy,
  FlaskConical,
  Award
} from "lucide-react";
import { FeedPost } from "@/components/feed-post";
import { CreatePost } from "@/components/create-post";
import { Link, useRoute, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CommunityCover from "@assets/generated_images/community_cover.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunity, getCommunityPosts, getCommunityMembership, joinCommunity, leaveCommunity, createCommunityPost } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";

export default function ClubDetail() {
  const [, params] = useRoute("/community/:id");
  const [, setLocation] = useLocation();
  const communityId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useNostr();

  const { data: community, isLoading: loadingCommunity } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => getCommunity(communityId!),
    enabled: !!communityId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: () => getCommunityPosts(communityId!),
    enabled: !!communityId,
  });

  const { data: membership } = useQuery({
    queryKey: ["communityMembership", communityId],
    queryFn: () => getCommunityMembership(communityId!),
    enabled: !!communityId && isConnected,
  });

  const joinMutation = useMutation({
    mutationFn: () => joinCommunity(communityId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communityMembership", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      if (data.status === "pending") {
        toast({ title: "Request Sent", description: "Your join request is pending approval." });
      } else {
        toast({ title: "Joined!", description: `Welcome to ${community?.name}!` });
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to join", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveCommunity(communityId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityMembership", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      toast({ title: "Left Community", description: "You have left this community." });
    },
  });

  const postMutation = useMutation({
    mutationFn: ({ content, image }: { content: string; image?: string }) => createCommunityPost(communityId!, content, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts", communityId] });
    },
  });

  const isMember = membership?.status === "approved" || membership?.role === "admin";
  const isPending = membership?.status === "pending";
  const isAdmin = membership?.role === "admin" || (membership?.userId && membership.userId === community?.creatorId);

  if (loadingCommunity) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-normal mb-4">Community Not Found</h1>
          <Link href="/community">
            <Button>Back to Communities</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleJoin = () => {
    if (!isConnected) {
      toast({ title: "Please Login", description: "You need to login to join communities." });
      return;
    }
    if (community.accessType === "paid") {
      toast({ title: "Paid Community", description: "Lightning payments coming soon!" });
      return;
    }
    joinMutation.mutate();
  };

  const getAccessBadge = () => {
    switch (community.accessType) {
      case "approval":
        return <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" />Approval Required</Badge>;
      case "paid":
        return <Badge variant="secondary" className="gap-1 text-muted-foreground"><Zap className="w-3 h-3" />{community.price || 0} sats</Badge>;
      default:
        return <Badge variant="outline">Public</Badge>;
    }
  };

  return (
    <Layout>
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img 
          src={community.coverImage || CommunityCover} 
          alt={community.name} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-4 left-4 z-20">
          <Link href="/community">
            <Button variant="secondary" className="gap-2 bg-white hover:bg-muted border-none text-foreground" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-serif font-normal text-foreground">{community.name}</h1>
                {getAccessBadge()}
              </div>
              <p className="text-lg text-muted-foreground max-w-xl mb-4">{community.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="font-normal text-foreground">{community.memberCount || 0}</span> Members
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            {isAdmin && (
              <Link href={`/community/${communityId}/admin`}>
                <Button variant="outline" className="gap-2 bg-white px-4" data-testid="button-admin">
                  <Settings className="w-4 h-4" /> Admin
                </Button>
              </Link>
            )}
            <Button variant="outline" className="gap-2 bg-white px-6" data-testid="button-share">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            {isMember ? (
              <Button 
                variant="outline"
                className="gap-2 px-6 min-w-[140px]"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                data-testid="button-leave"
              >
                {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Leave"}
              </Button>
            ) : isPending ? (
              <Button disabled className="gap-2 px-6 min-w-[140px]" data-testid="button-pending">
                Pending Approval
              </Button>
            ) : (
              <Button 
                className="gap-2 font-normal px-6 min-w-[140px]"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                data-testid="button-join"
              >
                {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {community.accessType === "approval" ? "Request to Join" : "Join"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isMember && (
            <CreatePost 
              placeholder={`Share something with ${community.name}...`} 
              onPost={(content, image) => postMutation.mutate({ content, image })}
            />
          )}

          <div className="space-y-4 mt-6">
            <h3 className="font-normal text-muted-foreground uppercase text-xs tracking-wider px-1 mb-4">Recent Activity</h3>
            
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No posts yet. {isMember && "Be the first to share something!"}</p>
              </Card>
            ) : (
              posts.map((post: any) => (
                <FeedPost key={post.id} post={{
                  id: post.id,
                  author: {
                    name: post.author?.displayName || post.author?.username || "Member",
                    handle: `@${post.author?.username || "member"}`,
                    avatar: post.author?.avatar || ""
                  },
                  content: post.content,
                  image: post.image,
                  likes: post.likes || 0,
                  comments: post.commentCount || 0,
                  zaps: post.zaps || 0,
                  timestamp: new Date(post.createdAt).toLocaleDateString()
                }} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-card sticky top-24 rounded-xs">
            <CardHeader>
              <CardTitle className="text-lg font-normal">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {community.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-normal">
                    {community.createdAt ? new Date(community.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Access</span>
                  <span className="font-normal capitalize">{community.accessType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-normal">{community.memberCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tribe-Specific Gamification */}
          <Card className="border-none shadow-sm bg-card rounded-xs">
            <CardContent className="p-4">
              <h3 className="font-normal text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> Top Zappers
              </h3>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground" data-testid="text-tribe-zappers">Coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-xs">
            <CardContent className="p-4">
              <h3 className="font-normal text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> Top Streaks
              </h3>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground" data-testid="text-tribe-streaks">Coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-xs">
            <CardContent className="p-4">
              <h3 className="font-normal text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> Progress & Completions
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" /> Experiments
                  </p>
                  <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3" /> 11x LOVE Code
                  </p>
                  <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                    <p className="text-xs text-muted-foreground">Coming soon</p>
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
