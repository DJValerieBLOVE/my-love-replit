import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Plus, Lock, Check, Heart, Search, Loader2, Zap, Flame, Trophy, FlaskConical, Award, X } from "lucide-react";
import CommunityCover from "@assets/generated_images/community_cover.png";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCommunities, getMyCommunities, getPrayerRequests, createPrayerRequest, prayForRequest } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPERIMENT_CATEGORIES, EXPERIMENT_TAGS } from "@/lib/mock-data";

const TRIBE_TABS = [
  { id: "my-tribes", label: "My Tribes" },
  { id: "new", label: "New" },
  { id: "all", label: "All" },
  { id: "suggested", label: "Suggested" },
  { id: "prayer-requests", label: "Prayer Requests" },
];

export default function Community() {
  const { isConnected, profile } = useNostr();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [newPrayer, setNewPrayer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
    enabled: isConnected,
  });

  const { data: prayerRequests = [], isLoading: prayersLoading } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: getPrayerRequests,
    enabled: activeTab === "prayer-requests",
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

  const myMembershipIds = new Set(myCommunities.map((m: any) => m.communityId || m.id));

  const filteredCommunities = (() => {
    let filtered = communities;

    if (activeTab === "my-tribes") {
      filtered = filtered.filter((c: any) => myMembershipIds.has(c.id));
    } else if (activeTab === "new") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter((c: any) => new Date(c.createdAt) >= oneWeekAgo);
    } else if (activeTab === "suggested") {
      filtered = filtered.filter((c: any) => !myMembershipIds.has(c.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c: any) => c.category === selectedCategory);
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((c: any) => c.tags && c.tags.includes(selectedTag));
    }

    return filtered;
  })();

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
    <Layout>
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pt-[0px] pb-[0px]" />
        <img 
          src={CommunityCover} 
          alt="Community" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <h1 className="text-3xl font-serif font-normal text-muted-foreground" data-testid="text-page-title">Tribes</h1>
          <p className="text-muted-foreground max-w-md">Intimate spaces to connect and grow together.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Privacy Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-[#F5F5F5] px-3 py-2 rounded-xs">
          <Lock className="w-3 h-3" />
          <span>All Tribe content is private and encrypted — not shared to public Nostr relays.</span>
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap items-center">
            {TRIBE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === tab.id ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
            <Link href="/community/create">
              <Button className="gap-2 ml-2" data-testid="button-create-community">
                <Plus className="w-4 h-4" /> Create Tribe
              </Button>
            </Link>
          </div>

        </div>

        {activeTab !== "prayer-requests" && (
          <div className="flex gap-2 items-stretch mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tribes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white h-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-10" data-testid="select-tribe-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[140px] h-10" data-testid="select-tribe-tag">
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
        )}

        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
        {/* Prayer Requests Tab */}
        {activeTab === "prayer-requests" ? (
          <div className="space-y-6">
            {/* Compose Prayer */}
            <Card className="border-none shadow-sm bg-card rounded-xs">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Share your prayer request with the community..."
                  value={newPrayer}
                  onChange={(e) => setNewPrayer(e.target.value)}
                  rows={3}
                  className="bg-white resize-none"
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

            {/* Prayer List */}
            {prayersLoading ? (
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
                              className="gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-[#EBEBEB]"
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
              <Card className="border-dashed border-2 p-8 text-center bg-[#F5F5F5]">
                <p className="text-3xl mb-3">🙏</p>
                <p className="text-muted-foreground mb-2">No prayer requests yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share a prayer with the community.</p>
              </Card>
            )}
          </div>
        ) : (
          /* Community Cards */
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {activeTab === "my-tribes" ? "You haven't joined any tribes yet." : "No tribes found."}
                </p>
                {isConnected && activeTab === "my-tribes" && (
                  <Button variant="outline" onClick={() => setActiveTab("all")}>Browse All Tribes</Button>
                )}
                {isConnected && activeTab !== "my-tribes" && (
                  <Link href="/community/create">
                    <Button>Create the first tribe</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <CardHeader className="pb-2 pt-4 relative z-10">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xl font-normal text-muted-foreground group-hover:text-primary transition-colors font-serif">
                              {community.name}
                            </CardTitle>
                            {getAccessBadge(community.accessType)}
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1">
                          <p className="text-base text-muted-foreground mb-3 line-clamp-2">
                            {community.description}
                          </p>
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
                              <Button variant="outline" className="px-6 transition-all gap-2" data-testid="button-joined">
                                <Check className="w-4 h-4" /> Joined
                              </Button>
                            ) : (
                              <Button className="px-6 transition-all" data-testid="button-join-community">
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
        )}
          </div>

          {/* Right Sidebar - Gamification Placeholders */}
          <div className="hidden lg:block w-[300px] shrink-0 space-y-4 sticky top-24 self-start">
            {/* Top Zappers */}
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

            {/* Top Streaks */}
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

            {/* Progress & Completions */}
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
      </div>
    </Layout>
  );
}
