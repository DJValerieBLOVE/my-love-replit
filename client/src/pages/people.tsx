import Layout from "@/components/layout";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart, MessageCircle, Zap, Users, Search, Loader2, Lock, Globe,
  ChevronDown, TrendingUp, Flame, Camera, Clock, RefreshCw, ArrowUp,
  Plus, ArrowRight, Check, Trophy, FlaskConical, Award, X, Star,
  Handshake, Sparkles, UserPlus, Filter
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCommunities, getMyCommunities, getPrayerRequests, createPrayerRequest, prayForRequest } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { toast } from "sonner";
import { EXPERIMENT_CATEGORIES, EXPERIMENT_TAGS } from "@/lib/mock-data";
import CommunityCover from "@assets/generated_images/community_cover.png";
import {
  PostComposer,
  PostCard,
  FeedLoadingSkeleton,
  useNostrFeed,
  EXPLORE_OPTIONS,
  type FeedTab,
} from "@/pages/feed";
import type { ExploreMode } from "@/lib/primal-cache";

type PeopleTab = "feed" | "tribes" | "buddies" | "victories" | "gratitude" | "prayers" | "discover";

const PEOPLE_TABS: { id: PeopleTab; label: string; icon: typeof Users }[] = [
  { id: "feed", label: "My Feed", icon: Globe },
  { id: "tribes", label: "My Tribes", icon: Users },
  { id: "buddies", label: "Buddies", icon: Handshake },
  { id: "victories", label: "Victories", icon: Trophy },
  { id: "gratitude", label: "Gratitude", icon: Star },
  { id: "prayers", label: "Prayers", icon: Heart },
  { id: "discover", label: "Discover", icon: Search },
];

function FeedTabContent() {
  const [exploreMode, setExploreMode] = useState<ExploreMode>("trending");
  const [feedMode, setFeedMode] = useState<"following" | "explore">("following");
  const feedTab: FeedTab = feedMode === "following" ? "following" : "explore";
  const { posts, isLoading, isRefreshing, refetch, newPostCount, showNewPosts, pendingPosts, primalProfiles } = useNostrFeed(feedTab, exploreMode);
  const currentExploreOption = EXPLORE_OPTIONS.find(o => o.value === exploreMode) || EXPLORE_OPTIONS[0];

  return (
    <div>
      <PostComposer onPostPublished={refetch} />

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFeedMode("following")}
          className={`px-3.5 py-1.5 rounded-full text-sm transition-colors border ${feedMode === "following" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
          data-testid="feed-sub-tab-following"
        >
          Following
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`px-3.5 py-1.5 rounded-full text-sm transition-colors border flex items-center gap-1.5 ${feedMode === "explore" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
              data-testid="feed-sub-tab-explore"
            >
              <currentExploreOption.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {currentExploreOption.label}
              <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {EXPLORE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => { setExploreMode(option.value); setFeedMode("explore"); }}
                className={`cursor-pointer ${exploreMode === option.value && feedMode === "explore" ? "bg-gray-50" : ""}`}
              >
                <option.icon className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={refetch}
          disabled={isRefreshing || isLoading}
          className="ml-auto flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors disabled:text-[#C4C4C4]"
          data-testid="button-refresh-feed"
          title="Refresh feed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
        </button>
      </div>

      <div className="space-y-4">
        {newPostCount > 0 && (
          <div className="flex justify-center">
            <button
              onClick={showNewPosts}
              className="flex items-center gap-2.5 px-4 py-2 bg-foreground text-background rounded-full shadow-lg hover:shadow-xl transition-all text-sm"
              data-testid="button-show-new-posts"
            >
              <span className="font-normal">{newPostCount} new {newPostCount === 1 ? "post" : "posts"}</span>
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
        {isLoading ? (
          <FeedLoadingSkeleton />
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} primalProfiles={primalProfiles} />)
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No posts yet</p>
            <p className="text-sm mt-2">
              {feedMode === "following" ? "Follow some people to see their posts here!"
                : "No posts found. Try a different explore category!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TribesTabContent() {
  const { isConnected, profile } = useNostr();
  const [selectedTribe, setSelectedTribe] = useState<string>("all");

  const { data: communities = [] } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
    enabled: isConnected,
  });

  const myMembershipIds = new Set(myCommunities.map((m: any) => m.communityId || m.id));
  const myTribes = communities.filter((c: any) => myMembershipIds.has(c.id));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Select value={selectedTribe} onValueChange={setSelectedTribe}>
          <SelectTrigger className="w-[240px] h-10 bg-white" data-testid="select-my-tribe">
            <SelectValue placeholder="All My Tribes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All My Tribes</SelectItem>
            {myTribes.map((tribe: any) => (
              <SelectItem key={tribe.id} value={tribe.id}>{tribe.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href="/community/create">
          <Button variant="outline" className="gap-2 h-10" data-testid="button-create-tribe">
            <Plus className="w-4 h-4" /> New Tribe
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-[#F5F5F5] px-3 py-2 rounded-lg">
        <Lock className="w-3 h-3" />
        <span>All Tribe content is private and encrypted — not shared to public Nostr relays.</span>
      </div>

      {myTribes.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-muted-foreground mb-2">You haven't joined any tribes yet.</p>
          <p className="text-sm text-muted-foreground mb-4">Discover tribes to connect with like-minded people.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(selectedTribe === "all" ? myTribes : myTribes.filter((t: any) => t.id === selectedTribe)).map((tribe: any) => (
            <Link key={tribe.id} href={`/community/${tribe.id}`}>
              <Card className="hover:shadow-md transition-all border-none bg-card shadow-sm group cursor-pointer overflow-hidden rounded-xs" data-testid={`card-tribe-${tribe.id}`}>
                <div className="h-[2px] w-full bg-primary" />
                {tribe.coverImage && (
                  <div className="h-24 overflow-hidden">
                    <img src={tribe.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="text-lg font-serif text-muted-foreground group-hover:text-primary transition-colors">{tribe.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tribe.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                    <Users className="w-3 h-3" />
                    <span>{tribe.memberCount || 0} members</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BuddiesTabContent() {
  const { isConnected, profile } = useNostr();

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-[#F5F5F5] px-3 py-2 rounded-lg">
        <Lock className="w-3 h-3" />
        <span>Buddy conversations are private and only visible to you and your accountability buddy.</span>
      </div>

      <div className="text-center py-12">
        <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
        <h3 className="text-lg font-serif mb-2">Accountability Buddies</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Connect with someone who shares your goals. Support each other daily, share victories, and grow together.
        </p>
        {isConnected ? (
          <div className="space-y-4 max-w-md mx-auto">
            <Card className="p-4 border border-gray-100 shadow-none text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F0E6FF] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#6600ff]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-normal">Find a Buddy</p>
                  <p className="text-xs text-muted-foreground">Browse members looking for accountability partners</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-gray-100 shadow-none text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F0E6FF] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#6600ff]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-normal">Buddy Messages</p>
                  <p className="text-xs text-muted-foreground">Private check-ins with your buddy</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-gray-100 shadow-none text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F0E6FF] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#6600ff]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-normal">Shared Goals</p>
                  <p className="text-xs text-muted-foreground">Track progress together on shared goals</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sign in to find an accountability buddy.</p>
        )}
      </div>
    </div>
  );
}

function VictoriesTabContent() {
  const { isConnected, profile } = useNostr();
  const [victoryContent, setVictoryContent] = useState("");
  const [victoryPrivacy, setVictoryPrivacy] = useState<"public" | "private" | "buddy" | "secret">("public");

  const handlePostVictory = () => {
    if (!victoryContent.trim()) return;
    toast.success("Victory shared!");
    setVictoryContent("");
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-4">
          Celebrate your daily wins. From the 5V practice, share your victories to inspire others.
        </p>
      </div>

      {isConnected && (
        <Card className="p-4 mb-6 border border-gray-100 shadow-none">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              {profile?.picture && <AvatarImage src={profile.picture} />}
              <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's your victory today?"
                value={victoryContent}
                onChange={(e) => setVictoryContent(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="textarea-victory"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <PrivacySelector value={victoryPrivacy} onChange={setVictoryPrivacy} />
                <Button
                  onClick={handlePostVictory}
                  disabled={!victoryContent.trim()}
                  className="px-5 gap-2"
                  data-testid="button-post-victory"
                >
                  <Trophy className="w-4 h-4" /> Share Victory
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4" strokeWidth={1} />
        <p className="text-lg font-serif mb-2">No victories shared yet</p>
        <p className="text-sm">Be the first to celebrate a win today!</p>
      </div>
    </div>
  );
}

function GratitudeTabContent() {
  const { isConnected, profile } = useNostr();
  const [gratitudeContent, setGratitudeContent] = useState("");
  const [gratitudePrivacy, setGratitudePrivacy] = useState<"public" | "private" | "buddy" | "secret">("public");

  const handlePostGratitude = () => {
    if (!gratitudeContent.trim()) return;
    toast.success("Gratitude shared!");
    setGratitudeContent("");
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-4">
          Express gratitude daily. What are you thankful for today?
        </p>
      </div>

      {isConnected && (
        <Card className="p-4 mb-6 border border-gray-100 shadow-none">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              {profile?.picture && <AvatarImage src={profile.picture} />}
              <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What are you grateful for today?"
                value={gratitudeContent}
                onChange={(e) => setGratitudeContent(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="textarea-gratitude"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <PrivacySelector value={gratitudePrivacy} onChange={setGratitudePrivacy} />
                <Button
                  onClick={handlePostGratitude}
                  disabled={!gratitudeContent.trim()}
                  className="px-5 gap-2"
                  data-testid="button-post-gratitude"
                >
                  <Star className="w-4 h-4" /> Share Gratitude
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center py-8 text-muted-foreground">
        <Star className="w-12 h-12 mx-auto mb-4" strokeWidth={1} />
        <p className="text-lg font-serif mb-2">No gratitude entries yet</p>
        <p className="text-sm">Start your gratitude practice — share what you're thankful for.</p>
      </div>
    </div>
  );
}

function PrayersTabContent() {
  const { isConnected, profile } = useNostr();
  const [newPrayer, setNewPrayer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayerPrivacy, setPrayerPrivacy] = useState<"public" | "private" | "buddy" | "secret">("public");
  const queryClient = useQueryClient();

  const { data: prayerRequests = [], isLoading } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: getPrayerRequests,
  });

  const createPrayerMutation = useMutation({
    mutationFn: createPrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
      setNewPrayer("");
      toast.success("Prayer request shared with the community");
    },
    onError: () => {
      toast.error("Failed to share prayer request");
    },
  });

  const prayMutation = useMutation({
    mutationFn: prayForRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerRequests"] });
    },
  });

  const handleSubmitPrayer = () => {
    if (!newPrayer.trim()) {
      toast.error("Please enter your prayer request");
      return;
    }
    if (!profile?.userId) {
      toast.error("Please sign in to share a prayer request");
      return;
    }
    createPrayerMutation.mutate({
      authorId: profile.userId,
      content: newPrayer.trim(),
      isAnonymous,
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {isConnected && (
        <Card className="border-none shadow-sm bg-card rounded-xs">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Share your prayer request with the community..."
              value={newPrayer}
              onChange={(e) => setNewPrayer(e.target.value)}
              rows={3}
              className="resize-none"
              data-testid="input-prayer"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                    data-testid="checkbox-anonymous"
                  />
                  Post anonymously
                </label>
                <PrivacySelector value={prayerPrivacy} onChange={setPrayerPrivacy} />
              </div>
              <Button
                onClick={handleSubmitPrayer}
                disabled={createPrayerMutation.isPending || !newPrayer.trim()}
                className="gap-2"
                data-testid="button-submit-prayer"
              >
                <Heart className="w-4 h-4" />
                {createPrayerMutation.isPending ? "Sharing..." : "Share Prayer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : prayerRequests.length > 0 ? (
        <div className="space-y-4">
          {prayerRequests.map((prayer: any) => (
            <Card key={prayer.id} className="border-none shadow-sm bg-card rounded-xs" data-testid={`card-prayer-${prayer.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 mt-1">
                    {prayer.isAnonymous ? (
                      <AvatarFallback>🙏</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={prayer.author?.avatar} />
                        <AvatarFallback>{(prayer.author?.name || "?").charAt(0)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-normal text-foreground">
                        {prayer.isAnonymous ? "Anonymous" : prayer.author?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(prayer.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-prayer-content-${prayer.id}`}>{prayer.content}</p>
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-[#F0E6FF]"
                        onClick={() => prayMutation.mutate(prayer.id)}
                        data-testid={`button-pray-${prayer.id}`}
                      >
                        🙏 Pray ({prayer.prayerCount})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-3xl mb-3">🙏</p>
          <p className="text-lg font-serif mb-2">No prayer requests yet</p>
          <p className="text-sm">Be the first to share a prayer with the community.</p>
        </div>
      )}
    </div>
  );
}

function DiscoverTabContent() {
  const { isConnected } = useNostr();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [discoverSubTab, setDiscoverSubTab] = useState<"tribes" | "members">("tribes");

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
    enabled: isConnected,
  });

  const myMembershipIds = new Set(myCommunities.map((m: any) => m.communityId || m.id));

  const filteredCommunities = useMemo(() => {
    let filtered = communities;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c: any) => c.category === selectedCategory);
    }
    if (selectedTag !== "all") {
      filtered = filtered.filter((c: any) => c.tags && c.tags.includes(selectedTag));
    }
    return filtered;
  }, [communities, searchQuery, selectedCategory, selectedTag]);

  const getAccessBadge = (accessType: string) => {
    switch (accessType) {
      case "approval":
        return <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" />Approval</span>;
      case "paid":
        return <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">Paid</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">Public</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setDiscoverSubTab("tribes")}
          className={`px-3.5 py-1.5 rounded-full text-sm transition-colors border ${discoverSubTab === "tribes" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
          data-testid="discover-sub-tab-tribes"
        >
          Tribes
        </button>
        <button
          onClick={() => setDiscoverSubTab("members")}
          className={`px-3.5 py-1.5 rounded-full text-sm transition-colors border ${discoverSubTab === "members" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
          data-testid="discover-sub-tab-members"
        >
          Find Members
        </button>
      </div>

      {discoverSubTab === "tribes" ? (
        <>
          <div className="flex gap-2 items-stretch mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tribes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
                data-testid="input-search-tribes"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-10" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[140px] h-10" data-testid="select-tag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {EXPERIMENT_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{filteredCommunities.length} tribes found</p>
            <Link href="/community/create">
              <Button className="gap-2" data-testid="button-create-tribe-discover">
                <Plus className="w-4 h-4" /> Create Tribe
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tribes found.</p>
              <Link href="/community/create">
                <Button>Create the first tribe</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunities.map((community: any) => {
                const isMember = myMembershipIds.has(community.id);
                return (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Card className="hover:shadow-md transition-all border-none bg-card shadow-sm group cursor-pointer overflow-hidden flex flex-col h-full rounded-xs" data-testid={`card-community-${community.id}`}>
                      <div className="h-[2px] w-full bg-primary" />
                      {community.coverImage && (
                        <div className="aspect-video overflow-hidden">
                          <img src={community.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xl font-normal text-muted-foreground group-hover:text-primary transition-colors font-serif">
                            {community.name}
                          </CardTitle>
                          {getAccessBadge(community.accessType)}
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <p className="text-base text-muted-foreground mb-3 line-clamp-2">{community.description}</p>
                        {(community.category || (community.tags && community.tags.length > 0)) && (
                          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                            {community.category && (
                              <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                                {EXPERIMENT_CATEGORIES.find(c => c.id === community.category)?.label || community.category}
                              </span>
                            )}
                            {community.tags?.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                          <Users className="w-3 h-3" />
                          <span>{community.memberCount || 0} members</span>
                        </div>
                        <div className="flex-1 flex items-end justify-center">
                          {isMember ? (
                            <Button variant="outline" className="px-6 gap-2" data-testid="button-joined">
                              <Check className="w-4 h-4" /> Joined
                            </Button>
                          ) : (
                            <Button className="px-6" data-testid="button-join-community">
                              Join <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <FindMembersContent />
      )}
    </div>
  );
}

function FindMembersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInterest, setFilterInterest] = useState("all");

  const INTEREST_OPTIONS = [
    "Meditation & Mindfulness",
    "Bitcoin & Lightning",
    "Fitness & Health",
    "Journaling & Reflection",
    "Accountability Partner",
    "Content Creation",
    "Financial Freedom",
    "Relationships & Communication",
    "Career & Purpose",
    "Spiritual Growth",
  ];

  return (
    <div>
      <div className="flex gap-2 items-stretch mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
            data-testid="input-search-members"
          />
        </div>
        <Select value={filterInterest} onValueChange={setFilterInterest}>
          <SelectTrigger className="w-[200px] h-10" data-testid="select-interest-filter">
            <SelectValue placeholder="All Interests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interests</SelectItem>
            {INTEREST_OPTIONS.map((interest) => (
              <SelectItem key={interest} value={interest}>{interest}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-serif text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Suggested Compatible Members
        </h3>
        <p className="text-xs text-muted-foreground mb-4">People who share your interests and might be great accountability partners.</p>

        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4" strokeWidth={1} />
          <p className="text-sm">Sign in and complete your profile to see compatible members.</p>
        </div>
      </div>
    </div>
  );
}

function PrivacySelector({ value, onChange }: { value: "public" | "private" | "buddy" | "secret"; onChange: (v: "public" | "private" | "buddy" | "secret") => void }) {
  const options = [
    { id: "public" as const, label: "Public", icon: Globe, description: "Post to Nostr" },
    { id: "private" as const, label: "Tribe Only", icon: Users, description: "Private to tribe" },
    { id: "buddy" as const, label: "Buddy", icon: Handshake, description: "Accountability buddy" },
    { id: "secret" as const, label: "Secret", icon: Lock, description: "Vault only" },
  ];

  const current = options.find(o => o.id === value) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-muted-foreground hover:border-gray-400 transition-colors"
          data-testid="button-privacy-selector"
        >
          <current.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          {current.label}
          <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`cursor-pointer ${value === option.id ? "bg-gray-50" : ""}`}
            data-testid={`privacy-option-${option.id}`}
          >
            <option.icon className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-sm">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RightSidebar() {
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-card rounded-xs">
        <CardContent className="p-4">
          <h3 className="font-normal text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> Top Zappers
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Individuals</p>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground" data-testid="text-zappers-coming-soon">Coming soon</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tribes</p>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card rounded-xs">
        <CardContent className="p-4">
          <h3 className="font-normal text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> Top Streaks
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Individuals</p>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tribes</p>
              <div className="p-3 bg-[#F5F5F5] rounded-xs text-center">
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
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
  );
}

export default function People() {
  const [activeTab, setActiveTab] = useState<PeopleTab>("feed");

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-2">
            <h1 className="text-2xl font-serif" data-testid="text-people-title">People</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-4">Your tribes, feed, victories, and connections — all in one place.</p>

          <div className="sticky top-14 md:top-20 z-[30] -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[#FAFAFA] border-b border-gray-200">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-[1200px] mx-auto">
              {PEOPLE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors border whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <div className="flex-1 min-w-0">
              {activeTab === "feed" && <FeedTabContent />}
              {activeTab === "tribes" && <TribesTabContent />}
              {activeTab === "buddies" && <BuddiesTabContent />}
              {activeTab === "victories" && <VictoriesTabContent />}
              {activeTab === "gratitude" && <GratitudeTabContent />}
              {activeTab === "prayers" && <PrayersTabContent />}
              {activeTab === "discover" && <DiscoverTabContent />}
            </div>

            <div className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-36">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
