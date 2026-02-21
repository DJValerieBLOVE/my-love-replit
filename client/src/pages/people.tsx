import Layout from "@/components/layout";
import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart, MessageCircle, Zap, Users, Search, Loader2, Lock, Globe,
  ChevronDown, TrendingUp, Flame, Camera, Clock, RefreshCw, ArrowUp,
  Plus, ArrowRight, Check, Trophy, FlaskConical, Award, X, Star,
  Handshake, Sparkles, UserPlus, Filter, FileText
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
import { getAllCommunities, getMyCommunities, getPrayerRequests, createPrayerRequest, prayForRequest, getGratitudePosts, createGratitudePost, getVictoryPosts, createVictoryPost } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { toast } from "sonner";
import { EXPERIMENT_CATEGORIES, EXPERIMENT_TAGS } from "@/lib/mock-data";
import CommunityCover from "@assets/generated_images/community_cover.png";
import {
  CompactPostBar,
  PostCard,
  ArticleCard,
  FeedLoadingSkeleton,
  useNostrFeed,
  EXPLORE_OPTIONS,
  type FeedTab,
} from "@/pages/feed";
import type { ExploreMode } from "@/lib/primal-cache";

type PeopleTab = "feed" | "tribes" | "buddies" | "victories" | "gratitude" | "prayers" | "discover";

type FeedSubOption = "following" | "trending" | "most_zapped" | "latest" | "media" | "articles";
type DiscoverSubOption = "discover_buddies" | "discover_tribes" | "discover_people";
type BuddySubOption = "find" | "messages";

const FEED_SUB_OPTIONS: { id: string; label: string; icon: typeof Globe }[] = [
  { id: "following", label: "Following", icon: Users },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "most_zapped", label: "Most Zapped", icon: Zap },
  { id: "latest", label: "Latest", icon: Clock },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "__discover__", label: "Discover", icon: Search },
];

const DISCOVER_SUB_OPTIONS: { id: DiscoverSubOption; label: string; icon: typeof Search }[] = [
  { id: "discover_buddies", label: "Discover Buddies", icon: Handshake },
  { id: "discover_tribes", label: "Discover Tribes", icon: Users },
  { id: "discover_people", label: "Discover People to Follow", icon: UserPlus },
];

const BUDDY_SUB_OPTIONS: { id: string; label: string; icon: typeof Handshake }[] = [
  { id: "my_buddies", label: "My Buddies", icon: Handshake },
  { id: "find", label: "Find a Buddy", icon: UserPlus },
];

function FeedTabContent({ subOption, autoCompose }: { subOption: FeedSubOption; autoCompose?: boolean }) {
  const exploreMap: Record<FeedSubOption, ExploreMode> = {
    following: "trending",
    trending: "trending",
    most_zapped: "most_zapped",
    latest: "latest",
    media: "media",
    articles: "trending",
  };
  const feedTab: FeedTab = subOption === "following" ? "following" : "explore";
  const exploreMode = exploreMap[subOption];
  const { posts, articles, isLoading, isRefreshing, refetch, newPostCount, showNewPosts, pendingPosts, primalProfiles } = useNostrFeed(feedTab, exploreMode);

  if (subOption === "articles") {
    return (
      <div>
        <div className="space-y-4">
          {isLoading ? (
            <FeedLoadingSkeleton />
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                profile={primalProfiles.get(article.pubkey)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No articles yet</p>
              <p className="text-sm mt-2">Long-form articles from the network will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <CompactPostBar onPostPublished={refetch} autoOpen={autoCompose} />

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
          posts.map((post, index) => (
            <div key={post.id}>
              <PostCard post={post} primalProfiles={primalProfiles} />
              {articles.length > 0 && (index + 1) % 5 === 0 && articles[Math.floor(index / 5)] && (
                <div className="mt-4">
                  <ArticleCard
                    article={articles[Math.floor(index / 5)]}
                    profile={primalProfiles.get(articles[Math.floor(index / 5)].pubkey)}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No posts yet</p>
            <p className="text-sm mt-2">
              {subOption === "following" ? "Follow some people to see their posts here!"
                : "No posts found. Try a different explore category!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TribesTabContent({ selectedTribeId }: { selectedTribeId: string }) {
  const { isConnected } = useNostr();

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
  const showAllTribes = selectedTribeId === "all_tribes";
  const displayTribes = showAllTribes ? communities : selectedTribeId === "all" ? myTribes : myTribes.filter((t: any) => t.id === selectedTribeId);

  return (
    <div>
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
          {displayTribes.map((tribe: any) => (
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

function BuddiesTabContent({ subOption }: { subOption: BuddySubOption }) {
  const { isConnected, profile } = useNostr();

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-[#F5F5F5] px-3 py-2 rounded-lg">
        <Lock className="w-3 h-3" />
        <span>Buddy conversations are private and only visible to you and your accountability buddy.</span>
      </div>

      {subOption === "find" ? (
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <h3 className="text-lg font-serif mb-2">Find a Buddy</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Browse members looking for accountability partners. Support each other daily, share victories, and grow together.
          </p>
          {isConnected ? (
            <p className="text-sm text-muted-foreground">No members looking for buddies yet. Check back soon!</p>
          ) : (
            <p className="text-sm text-muted-foreground">Sign in to find an accountability buddy.</p>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <h3 className="text-lg font-serif mb-2">My Buddies</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Your accountability partners and private check-ins appear here.
          </p>
          {isConnected ? (
            <p className="text-sm text-muted-foreground">You don't have any buddies yet. Find one to get started!</p>
          ) : (
            <p className="text-sm text-muted-foreground">Sign in to see your buddies.</p>
          )}
        </div>
      )}
    </div>
  );
}

function VictoriesTabContent() {
  const { isConnected, profile } = useNostr();
  const [victoryContent, setVictoryContent] = useState("");
  const queryClient = useQueryClient();

  const { data: victoryPostsList = [], isLoading } = useQuery({
    queryKey: ["victoryPosts"],
    queryFn: getVictoryPosts,
  });

  const createVictoryMutation = useMutation({
    mutationFn: createVictoryPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["victoryPosts"] });
      setVictoryContent("");
      toast.success("Victory shared!");
    },
    onError: () => {
      toast.error("Failed to share victory");
    },
  });

  const handlePostVictory = (privacy: string) => {
    if (!victoryContent.trim() || !profile?.userId) return;
    createVictoryMutation.mutate({
      authorId: profile.userId,
      content: victoryContent.trim(),
      privacy,
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
              <div className="flex items-center justify-end mt-3 pt-3 border-t">
                <PrivacySubmitButton
                  label={createVictoryMutation.isPending ? "Sharing..." : "Share Victory"}
                  icon={Trophy}
                  disabled={createVictoryMutation.isPending || !victoryContent.trim()}
                  onSubmit={handlePostVictory}
                  testId="button-post-victory"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : victoryPostsList.length > 0 ? (
        <div className="space-y-4">
          {victoryPostsList.map((victory: any) => (
            <Card key={victory.id} className="border-none shadow-sm bg-card rounded-xs" data-testid={`card-victory-${victory.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 mt-1">
                    {victory.author?.picture && <AvatarImage src={victory.author.picture} />}
                    <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">
                      {(victory.author?.displayName || victory.author?.username || "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-normal">{victory.author?.displayName || victory.author?.username || "Anonymous"}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(victory.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{victory.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4" strokeWidth={1} />
          <p className="text-lg font-serif mb-2">No victories shared yet</p>
          <p className="text-sm">Be the first to celebrate a win today!</p>
        </div>
      )}
    </div>
  );
}

function GratitudeTabContent() {
  const { isConnected, profile } = useNostr();
  const [gratitudeContent, setGratitudeContent] = useState("");
  const queryClient = useQueryClient();

  const { data: gratitudePostsList = [], isLoading } = useQuery({
    queryKey: ["gratitudePosts"],
    queryFn: getGratitudePosts,
  });

  const createGratitudeMutation = useMutation({
    mutationFn: createGratitudePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gratitudePosts"] });
      setGratitudeContent("");
      toast.success("Gratitude shared!");
    },
    onError: () => {
      toast.error("Failed to share gratitude");
    },
  });

  const handlePostGratitude = (privacy: string) => {
    if (!gratitudeContent.trim() || !profile?.userId) return;
    createGratitudeMutation.mutate({
      authorId: profile.userId,
      content: gratitudeContent.trim(),
      privacy,
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
              <div className="flex items-center justify-end mt-3 pt-3 border-t">
                <PrivacySubmitButton
                  label={createGratitudeMutation.isPending ? "Sharing..." : "Share Gratitude"}
                  icon={Star}
                  disabled={createGratitudeMutation.isPending || !gratitudeContent.trim()}
                  onSubmit={handlePostGratitude}
                  testId="button-post-gratitude"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : gratitudePostsList.length > 0 ? (
        <div className="space-y-4">
          {gratitudePostsList.map((gratitude: any) => (
            <Card key={gratitude.id} className="border-none shadow-sm bg-card rounded-xs" data-testid={`card-gratitude-${gratitude.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 mt-1">
                    {gratitude.author?.picture && <AvatarImage src={gratitude.author.picture} />}
                    <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">
                      {(gratitude.author?.displayName || gratitude.author?.username || "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-normal">{gratitude.author?.displayName || gratitude.author?.username || "Anonymous"}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(gratitude.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{gratitude.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-4" strokeWidth={1} />
          <p className="text-lg font-serif mb-2">No gratitude entries yet</p>
          <p className="text-sm">Start your gratitude practice — share what you're thankful for.</p>
        </div>
      )}
    </div>
  );
}

function PrayersTabContent() {
  const { isConnected, profile } = useNostr();
  const [newPrayer, setNewPrayer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
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
              <PrivacySubmitButton
                label={createPrayerMutation.isPending ? "Sharing..." : "Share Prayer"}
                icon={Heart}
                disabled={createPrayerMutation.isPending || !newPrayer.trim()}
                onSubmit={(privacy) => handleSubmitPrayer()}
                testId="button-submit-prayer"
              />
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
                        className="gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted"
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

function DiscoverTabContent({ subOption }: { subOption: DiscoverSubOption }) {
  const { isConnected } = useNostr();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

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
      {subOption === "discover_tribes" ? (
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

function PrivacySubmitButton({ label, icon: Icon, disabled, onSubmit, testId }: {
  label: string;
  icon: typeof Globe;
  disabled?: boolean;
  onSubmit: (privacy: string) => void;
  testId: string;
}) {
  const privacyOptions = [
    { id: "public", label: "Public (Nostr)", icon: Globe, description: "Share to public Nostr relays" },
    { id: "private", label: "Tribe Only", icon: Users, description: "Private to your tribe" },
    { id: "buddy", label: "Buddy Only", icon: Handshake, description: "Share with accountability buddy" },
    { id: "secret", label: "Secret (Vault)", icon: Lock, description: "Save to your private vault" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          className="gap-2"
          data-testid={testId}
        >
          <Icon className="w-4 h-4" strokeWidth={1.5} />
          {label}
          <ChevronDown className="w-3.5 h-3.5 ml-1" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {privacyOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onSubmit(option.id)}
            className="cursor-pointer"
            data-testid={`${testId}-${option.id}`}
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

function TabDropdownBubble({ 
  label, 
  icon: Icon, 
  isActive, 
  items, 
  activeItemId,
  onSelect,
  testId,
}: {
  label: string;
  icon: typeof Globe;
  isActive: boolean;
  items: { id: string; label: string; icon: typeof Globe }[];
  activeItemId?: string;
  onSelect: (id: string) => void;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (items.length > 0) setOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  if (items.length === 0) {
    return (
      <button
        onClick={() => onSelect("")}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors border whitespace-nowrap flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ${
          isActive
            ? "bg-foreground text-background border-foreground"
            : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"
        }`}
        data-testid={testId}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
        {label}
      </button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors border whitespace-nowrap flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ${
            isActive
              ? "bg-foreground text-background border-foreground"
              : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"
          }`}
          data-testid={testId}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          {label}
          <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => { onSelect(item.id); setOpen(false); }}
            className={`cursor-pointer gap-2 ${activeItemId === item.id ? "bg-[#F5F5F5]" : ""}`}
            data-testid={`${testId}-option-${item.id}`}
          >
            <item.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useMyTribesForDropdown() {
  const { isConnected } = useNostr();
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
  return myTribes;
}

export default function People() {
  const [activeTab, setActiveTab] = useState<PeopleTab>("feed");
  const [feedSub, setFeedSub] = useState<FeedSubOption>("following");
  const [discoverSub, setDiscoverSub] = useState<DiscoverSubOption>("discover_people");
  const [buddySub, setBuddySub] = useState<BuddySubOption>("find");
  const [selectedTribeId, setSelectedTribeId] = useState<string>("all");
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const searchParams = new URLSearchParams(window.location.search);
  const [autoCompose, setAutoCompose] = useState(searchParams.get("compose") === "true");
  
  useEffect(() => {
    if (autoCompose) {
      setActiveTab("feed");
      setFeedSub("following");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const myTribes = useMyTribesForDropdown();

  const tribeDropdownItems: { id: string; label: string; icon: typeof Users }[] = [
    { id: "my_tribes", label: "My Tribes", icon: Users },
    { id: "all_tribes", label: "All Tribes", icon: Globe },
    { id: "__create__", label: "+ Create Tribe", icon: Plus },
  ];

  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="flex gap-4 max-w-[940px] mx-auto">
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h1 className="text-2xl font-serif" data-testid="text-people-title">People</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Your tribes, feed, victories, and connections — all in one place.</p>
          </div>
          <div className="hidden lg:block w-[280px] shrink-0" />
        </div>

        <div className="sticky top-14 md:top-20 z-[30] -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[#FAFAFA] border-b border-gray-200">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-[940px] mx-auto">
            <TabDropdownBubble
              label="Feed"
              icon={Globe}
              isActive={activeTab === "feed"}
              items={FEED_SUB_OPTIONS}
              activeItemId={feedSub}
              onSelect={(id) => {
                if (id === "__discover__") {
                  setActiveTab("discover");
                  setDiscoverSub("discover_people");
                } else {
                  setActiveTab("feed");
                  setFeedSub(id as FeedSubOption);
                }
              }}
              testId="tab-feed"
            />
            <TabDropdownBubble
              label="Tribes"
              icon={Users}
              isActive={activeTab === "tribes"}
              items={tribeDropdownItems}
              activeItemId={selectedTribeId === "all" ? "my_tribes" : selectedTribeId}
              onSelect={(id) => {
                if (id === "__create__") {
                  setLocation("/community/create");
                } else {
                  setActiveTab("tribes");
                  setSelectedTribeId(id === "my_tribes" ? "all" : id);
                }
              }}
              testId="tab-tribes"
            />
            <TabDropdownBubble
              label="Buddies"
              icon={Handshake}
              isActive={activeTab === "buddies"}
              items={BUDDY_SUB_OPTIONS}
              activeItemId={buddySub === "find" ? "find" : "my_buddies"}
              onSelect={(id) => { setActiveTab("buddies"); setBuddySub(id === "my_buddies" ? "messages" as BuddySubOption : "find"); }}
              testId="tab-buddies"
            />
            <TabDropdownBubble
              label="Victories"
              icon={Trophy}
              isActive={activeTab === "victories"}
              items={[]}
              onSelect={() => setActiveTab("victories")}
              testId="tab-victories"
            />
            <TabDropdownBubble
              label="Gratitude"
              icon={Star}
              isActive={activeTab === "gratitude"}
              items={[]}
              onSelect={() => setActiveTab("gratitude")}
              testId="tab-gratitude"
            />
            <TabDropdownBubble
              label="Prayers"
              icon={Heart}
              isActive={activeTab === "prayers"}
              items={[]}
              onSelect={() => setActiveTab("prayers")}
              testId="tab-prayers"
            />
            <TabDropdownBubble
              label="Discover"
              icon={Search}
              isActive={activeTab === "discover"}
              items={DISCOVER_SUB_OPTIONS}
              activeItemId={discoverSub}
              onSelect={(id) => { setActiveTab("discover"); setDiscoverSub(id as DiscoverSubOption); }}
              testId="tab-discover"
            />

            {activeTab === "feed" && (
              <button
                onClick={() => setFeedRefreshKey(k => k + 1)}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors shrink-0"
                data-testid="button-refresh-feed"
                title="Refresh feed"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4 max-w-[940px] mx-auto">
          <div className="flex-1 min-w-0">
            {activeTab === "feed" && <FeedTabContent key={feedRefreshKey} subOption={feedSub} autoCompose={autoCompose} />}
            {activeTab === "tribes" && <TribesTabContent selectedTribeId={selectedTribeId} />}
            {activeTab === "buddies" && <BuddiesTabContent subOption={buddySub} />}
            {activeTab === "victories" && <VictoriesTabContent />}
            {activeTab === "gratitude" && <GratitudeTabContent />}
            {activeTab === "prayers" && <PrayersTabContent />}
            {activeTab === "discover" && <DiscoverTabContent subOption={discoverSub} />}
          </div>

          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-36">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
