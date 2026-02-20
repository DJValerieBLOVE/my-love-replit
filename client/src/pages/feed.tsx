import Layout from "@/components/layout";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Zap, Share2, MoreHorizontal, Radio, Calendar, UserPlus, Repeat2, Bookmark, Quote, Users, Image, Film, Smile, X, Link2, Copy, ExternalLink, Loader2, Lock, Globe, ChevronDown, TrendingUp, Flame, Camera, Clock, RefreshCw, ArrowUp } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { isGroupContent, canSharePublicly, getGroupName, type ShareablePost } from "@/lib/sharing-rules";
import { useNDK } from "@/contexts/ndk-context";
import { useNostr } from "@/contexts/nostr-context";
import { LAB_RELAY_URL, PUBLIC_RELAYS } from "@/lib/relays";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Skeleton } from "@/components/ui/skeleton";
import { parseNostrContent, truncateNpub } from "@/lib/nostr-content";
import { fetchPrimalFeed, fetchPrimalUserFeed, type ExploreMode, type PrimalEvent, type PrimalProfile, type PrimalEventStats } from "@/lib/primal-cache";

type FeedPost = {
  id: string;
  eventId?: string;
  author: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    pubkey?: string;
    lud16?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  zaps: number;
  reposts: number;
  satszapped: number;
  source?: "nostr" | "community" | "learning";
  relaySource?: "private" | "public";
  community?: string;
  isOwnPost?: boolean;
};

function formatSats(sats: number): string {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(1)}M`;
  if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}K`;
  return sats.toLocaleString();
}

function formatTimestamp(date: number | string | Date) {
  const d = typeof date === "number" ? new Date(date * 1000) : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

type FeedTab = "following" | "tribe" | "buddies" | "explore";

function primalEventToFeedPost(
  event: PrimalEvent,
  profiles: Map<string, PrimalProfile>,
  currentPubkey?: string,
  relaySource: "private" | "public" = "public",
  stats?: Map<string, PrimalEventStats>
): FeedPost {
  const profileData = profiles.get(event.pubkey);
  const eventStats = stats?.get(event.id);
  return {
    id: event.id,
    eventId: event.id,
    author: {
      pubkey: event.pubkey,
      name: profileData?.display_name || profileData?.name || event.pubkey.slice(0, 8) + "...",
      handle: `@${profileData?.nip05 || profileData?.name || event.pubkey.slice(0, 8)}`,
      avatar: profileData?.picture || "",
      lud16: profileData?.lud16,
    },
    content: event.content,
    timestamp: formatTimestamp(event.created_at),
    likes: eventStats?.likes || 0,
    comments: eventStats?.replies || 0,
    zaps: eventStats?.zaps || 0,
    reposts: eventStats?.reposts || 0,
    satszapped: eventStats?.zapAmount || 0,
    source: "nostr",
    relaySource,
    isOwnPost: event.pubkey === currentPubkey,
  };
}

function useNostrFeed(tab: FeedTab, exploreMode: ExploreMode) {
  const { fetchEvents, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [pendingPosts, setPendingPosts] = useState<FeedPost[]>([]);
  const latestPostIdRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, { name: string; handle: string; avatar: string; lud16?: string }>>(new Map());

  const fetchProfileForPubkey = useCallback(async (pubkey: string) => {
    if (profileCacheRef.current.has(pubkey)) {
      return profileCacheRef.current.get(pubkey)!;
    }

    try {
      const profileEvents = await fetchEvents({ kinds: [0], authors: [pubkey], limit: 1 });
      if (profileEvents.length > 0) {
        const meta = JSON.parse(profileEvents[0].content);
        const profileData = {
          name: meta.display_name || meta.name || pubkey.slice(0, 8),
          handle: `@${meta.nip05 || meta.name || pubkey.slice(0, 8)}`,
          avatar: meta.picture || "",
          lud16: meta.lud16,
        };
        profileCacheRef.current.set(pubkey, profileData);
        return profileData;
      }
    } catch {
    }

    const fallback = {
      name: pubkey.slice(0, 8) + "...",
      handle: `@${pubkey.slice(0, 8)}`,
      avatar: "",
    };
    profileCacheRef.current.set(pubkey, fallback);
    return fallback;
  }, [fetchEvents]);

  const fetchFeed = useCallback(async () => {
    console.log("[Feed] fetchFeed called, tab:", tab, "exploreMode:", exploreMode, "ndkConnected:", ndkConnected);
    setIsLoading(true);

    try {
      if (tab === "following") {
        if (!profile?.pubkey) {
          setPosts([]);
          setIsLoading(false);
          return;
        }
        try {
          const result = await fetchPrimalUserFeed(profile.pubkey, { limit: 50 });
          if (result.events.length > 0) {
            const feedPosts = result.events.map(e =>
              primalEventToFeedPost(e, result.profiles, profile?.pubkey, "public", result.stats)
            );
            setPosts(feedPosts);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("[Feed] Primal cache error for following, falling back to NDK:", err);
        }

        if (!ndkConnected) {
          setPosts([]);
          setIsLoading(false);
          return;
        }
        const contactEvents = await fetchEvents({ kinds: [3], authors: [profile.pubkey], limit: 1 });
        if (contactEvents.length > 0) {
          const contacts = contactEvents[0].tags
            .filter(t => t[0] === "p")
            .map(t => t[1]);
          if (contacts.length === 0) {
            setPosts([]);
            setIsLoading(false);
            return;
          }
          const authorFilter = contacts.slice(0, 100);
          const events = await fetchEvents({ kinds: [1], authors: authorFilter, limit: 50 });
          const sortedEvents = events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
          await Promise.all(Array.from(new Set(sortedEvents.map(e => e.pubkey))).map(pk => fetchProfileForPubkey(pk)));

          const feedPosts: FeedPost[] = sortedEvents.map(event => {
            const pd = profileCacheRef.current.get(event.pubkey) || {
              name: event.pubkey.slice(0, 8) + "...",
              handle: `@${event.pubkey.slice(0, 8)}`,
              avatar: "",
            };
            return {
              id: event.id,
              eventId: event.id,
              author: { pubkey: event.pubkey, name: pd.name, handle: pd.handle, avatar: pd.avatar, lud16: pd.lud16 },
              content: event.content,
              timestamp: formatTimestamp(event.created_at || 0),
              likes: 0, comments: 0, zaps: 0, reposts: 0, satszapped: 0,
              source: "nostr" as const,
              relaySource: "public" as const,
              isOwnPost: event.pubkey === profile?.pubkey,
            };
          });
          setPosts(feedPosts);
        } else {
          setPosts([]);
        }
      } else if (tab === "tribe" || tab === "buddies") {
        if (!ndkConnected) {
          setPosts([]);
          setIsLoading(false);
          return;
        }
        const relayUrls = [LAB_RELAY_URL];
        const filter: any = { kinds: [1], limit: 50 };

        if (tab === "buddies") {
          filter["#t"] = ["buddy-post"];
        }

        const events = await fetchEvents(filter, relayUrls);
        const sortedEvents = events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

        const uniquePubkeys = Array.from(new Set(sortedEvents.map(e => e.pubkey)));
        await Promise.all(uniquePubkeys.map(pk => fetchProfileForPubkey(pk)));

        const feedPosts: FeedPost[] = sortedEvents.map(event => {
          const pd = profileCacheRef.current.get(event.pubkey) || {
            name: event.pubkey.slice(0, 8) + "...",
            handle: `@${event.pubkey.slice(0, 8)}`,
            avatar: "",
          };
          return {
            id: event.id,
            eventId: event.id,
            author: { pubkey: event.pubkey, name: pd.name, handle: pd.handle, avatar: pd.avatar, lud16: pd.lud16 },
            content: event.content,
            timestamp: formatTimestamp(event.created_at || 0),
            likes: 0, comments: 0, zaps: 0, reposts: 0, satszapped: 0,
            source: "nostr" as const,
            relaySource: "private" as const,
            isOwnPost: event.pubkey === profile?.pubkey,
          };
        });
        setPosts(feedPosts);
      } else if (tab === "explore") {
        try {
          const result = await fetchPrimalFeed(exploreMode, { limit: 50 });
          const feedPosts = result.events.map(e =>
            primalEventToFeedPost(e, result.profiles, profile?.pubkey, "public", result.stats)
          );
          setPosts(feedPosts);
        } catch (err) {
          console.error("[Feed] Primal cache error for explore:", err);
          setPosts([]);
        }
      }
    } catch (err) {
      console.error("[useNostrFeed] Error fetching feed:", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [ndkConnected, tab, exploreMode, fetchEvents, fetchProfileForPubkey, profile?.pubkey]);

  useEffect(() => {
    fetchFeed();
    setNewPostCount(0);
    setPendingPosts([]);
  }, [fetchFeed]);

  useEffect(() => {
    if (posts.length > 0) {
      latestPostIdRef.current = posts[0].id;
    }
  }, [posts]);

  const checkForNewPosts = useCallback(async () => {
    if (!latestPostIdRef.current) return;
    try {
      if ((tab === "explore" || tab === "following") && (tab === "explore" || profile?.pubkey)) {
        let result;
        if (tab === "explore") {
          result = await fetchPrimalFeed(exploreMode, { limit: 20 });
        } else if (profile?.pubkey) {
          result = await fetchPrimalUserFeed(profile.pubkey, { limit: 20 });
        }
        if (result && result.events.length > 0) {
          const currentIds = new Set(posts.map(p => p.id));
          const pendingIds = new Set(pendingPosts.map(p => p.id));
          const newEvents = result.events.filter(e => !currentIds.has(e.id) && !pendingIds.has(e.id));
          if (newEvents.length > 0) {
            const newFeedPosts = newEvents.map(e =>
              primalEventToFeedPost(e, result!.profiles, profile?.pubkey, "public", result!.stats)
            );
            setPendingPosts(prev => [...newFeedPosts, ...prev]);
            setNewPostCount(prev => prev + newEvents.length);
          }
        }
      }
    } catch {}
  }, [tab, exploreMode, profile?.pubkey, posts, pendingPosts]);

  useEffect(() => {
    if (tab !== "explore" && tab !== "following") return;
    const interval = setInterval(checkForNewPosts, 30000);
    return () => clearInterval(interval);
  }, [checkForNewPosts, tab]);

  const showNewPosts = useCallback(() => {
    if (pendingPosts.length > 0) {
      setPosts(prev => [...pendingPosts, ...prev]);
      setPendingPosts([]);
      setNewPostCount(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pendingPosts]);

  const manualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setNewPostCount(0);
    setPendingPosts([]);
    await fetchFeed();
  }, [fetchFeed]);

  return { posts, isLoading, isRefreshing, refetch: manualRefresh, ndkConnected, newPostCount, showNewPosts };
}

type MediaItem = {
  type: "image" | "gif" | "video";
  url: string;
  file?: File;
};

function PostComposer({ onPostPublished }: { onPostPublished?: () => void }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const { publishSmart, ndk, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();

  const handleFileSelect = (type: "image" | "video") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "video/*";
    input.multiple = type === "image";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file) => {
          const url = URL.createObjectURL(file);
          setMedia((prev) => [...prev, { type, url, file }]);
        });
      }
    };
    input.click();
  };

  const handleGifSelect = () => {
    toast("GIF picker coming soon!");
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const newMedia = [...prev];
      if (newMedia[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(newMedia[index].url);
      }
      newMedia.splice(index, 1);
      return newMedia;
    });
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return;

    if (!ndkConnected || !ndk) {
      toast.error("NDK not connected", { description: "Please wait for relay connection" });
      return;
    }

    setIsPosting(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = content.trim();
      event.created_at = Math.floor(Date.now() / 1000);

      if (profile?.pubkey) {
        event.pubkey = profile.pubkey;
      }

      await publishSmart(event, true);

      toast.success("Posted to Nostr!");
      setContent("");
      setMedia([]);
      onPostPublished?.();
    } catch (err: any) {
      console.error("[PostComposer] Publish error:", err);
      toast.error("Failed to post", { description: err.message || "Please try again" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          {profile?.picture ? (
            <AvatarImage src={profile.picture} />
          ) : null}
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] border rounded-lg resize-none focus-visible:ring-1 px-3 py-2 text-sm"
            data-testid="textarea-post-content"
          />
          
          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {media.map((item, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-muted">
                  {item.type === "video" ? (
                    <video src={item.url} className="w-full h-32 object-cover" controls />
                  ) : (
                    <img src={item.url} alt="" className="w-full h-32 object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    data-testid={`button-remove-media-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileSelect("image")}
                className="text-muted-foreground hover:bg-[#F0E6FF]"
                data-testid="button-add-image"
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGifSelect}
                className="text-muted-foreground hover:bg-[#F0E6FF]"
                data-testid="button-add-gif"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileSelect("video")}
                className="text-muted-foreground hover:bg-[#F0E6FF]"
                data-testid="button-add-video"
              >
                <Film className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={handlePost}
              disabled={isPosting || (!content.trim() && media.length === 0)}
              className="px-6"
              data-testid="button-post"
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FeedLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-4 mt-3 pt-2 border-t">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [quoteRepostOpen, setQuoteRepostOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");

  const isGroupPost = isGroupContent(post);
  const canRepostPublic = canSharePublicly(post);
  const groupName = getGroupName(post);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRepostPublic = () => {
    if (!canRepostPublic) {
      toast("Cannot share publicly", { 
        description: "Group posts can only be shared within the group" 
      });
      return;
    }
    toast("Reposted to Nostr!", { 
      description: `You reposted ${post.author.name}'s post publicly` 
    });
    setIsReposted(true);
  };

  const handleRepostGroup = () => {
    if (!isGroupPost) return;
    toast("Reposted within group!", { 
      description: `Shared within ${groupName}` 
    });
    setIsReposted(true);
  };

  const handleQuoteRepost = () => {
    if (!canRepostPublic) {
      toast("Quote shared within group!", { 
        description: `Your quote was shared within ${groupName}` 
      });
    } else {
      toast("Quote Posted to Nostr!", { 
        description: "Your quote repost was shared publicly" 
      });
    }
    setIsReposted(true);
    setQuoteRepostOpen(false);
    setQuoteText("");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? "Removed from bookmarks" : "Bookmarked!");
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow" data-testid={`post-${post.id}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate max-w-[140px]">{post.author.name}</span>
            <span className="text-muted-foreground text-sm truncate max-w-[120px]">{truncateNpub(post.author.handle)}</span>
            <span className="text-muted-foreground text-xs flex items-center gap-1 shrink-0">
              · {post.timestamp}
              {post.relaySource === "private" && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
              {post.relaySource === "public" && (
                <Globe className="w-3 h-3 text-muted-foreground" />
              )}
            </span>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 hover:bg-[#F0E6FF] shrink-0" data-testid={`button-more-${post.id}`}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          {(() => {
            const parsed = parseNostrContent(post.content);
            return (
              <>
                <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap">{parsed.text}</p>
                {parsed.images.length > 0 && (
                  <div className={`mt-3 gap-2 ${parsed.images.length === 1 ? '' : 'grid grid-cols-2'}`}>
                    {parsed.images.map((img, i) => (
                      <div key={i} className="rounded-xs overflow-hidden border border-border">
                        <img
                          src={img}
                          alt="Post media"
                          className="w-full h-auto object-cover max-h-[400px]"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          data-testid={`img-post-media-${post.id}-${i}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {parsed.videos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {parsed.videos.map((vid, i) => (
                      <video key={i} src={vid} controls autoPlay muted loop playsInline className="w-full rounded-xs max-h-[400px]" data-testid={`video-post-media-${post.id}-${i}`} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-reply-${post.id}`}>
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments > 0 ? post.comments : ""}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isReposted ? 'text-[#6600ff]' : 'text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF]'}`} data-testid={`button-repost-${post.id}`}>
                  <Repeat2 className="w-4 h-4" />
                  <span>{post.reposts > 0 ? post.reposts : ""}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {canRepostPublic ? (
                  <DropdownMenuItem onClick={handleRepostPublic} data-testid={`menu-repost-${post.id}`}>
                    <Repeat2 className="w-4 h-4 mr-2" />
                    <div>
                      <p>Repost to Nostr</p>
                      <p className="text-xs text-muted-foreground">Share publicly</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed" data-testid={`menu-repost-disabled-${post.id}`}>
                    <Repeat2 className="w-4 h-4 mr-2" />
                    <div>
                      <p>Repost to Nostr</p>
                      <p className="text-xs text-muted-foreground">Only your own content can go public</p>
                    </div>
                  </DropdownMenuItem>
                )}
                {isGroupPost && (
                  <DropdownMenuItem onClick={handleRepostGroup} data-testid={`menu-repost-group-${post.id}`}>
                    <Users className="w-4 h-4 mr-2" />
                    <div>
                      <p>Repost within Group</p>
                      <p className="text-xs text-muted-foreground">{groupName}</p>
                    </div>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setQuoteRepostOpen(true)} data-testid={`menu-quote-repost-${post.id}`}>
                  <Quote className="w-4 h-4 mr-2" />
                  <div>
                    <p>Quote Repost</p>
                    <p className="text-xs text-muted-foreground">
                      {canRepostPublic ? "Add your thoughts" : "Within group only"}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={quoteRepostOpen} onOpenChange={setQuoteRepostOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Quote Repost</DialogTitle>
                  <DialogDescription>
                    {isGroupPost && !post.isOwnPost
                      ? `Add your thoughts - will be shared within ${groupName} only`
                      : "Add your thoughts to share publicly"
                    }
                  </DialogDescription>
                </DialogHeader>
                {isGroupPost && !post.isOwnPost && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      This post is from a private group. Your quote will only be visible within that group.
                    </p>
                  </div>
                )}
                <div className="space-y-4 py-4">
                  <Textarea 
                    placeholder="What are your thoughts?"
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="min-h-[100px]"
                    data-testid={`textarea-quote-${post.id}`}
                  />
                  <Card className="p-3 bg-muted/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                    <p className="text-sm mt-2 line-clamp-2">{post.content}</p>
                  </Card>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleQuoteRepost}
                    className="bg-gradient-to-r from-[#6600ff] to-[#cc00ff] text-white"
                    data-testid={`button-submit-quote-${post.id}`}
                  >
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-zap-${post.id}`}>
              <Zap className="w-4 h-4" />
              <span data-testid={`count-zaps-${post.id}`}>{post.satszapped > 0 ? formatSats(post.satszapped) : ""}</span>
            </button>

            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isLiked ? 'text-[#6600ff]' : 'text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF]'}`} 
              data-testid={`button-like-${post.id}`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
              <span data-testid={`count-likes-${post.id}`}>{likes > 0 ? likes : ""}</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isBookmarked ? 'text-[#6600ff]' : 'text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF]'}`} 
              data-testid={`button-bookmark-${post.id}`}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-md px-2 py-1 transition-colors text-sm ml-auto" 
                  data-testid={`button-share-${post.id}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    toast.success("Link copied!");
                  }}
                  className="cursor-pointer"
                  data-testid={`button-copy-link-${post.id}`}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                {canRepostPublic && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        const text = encodeURIComponent(post.content);
                        const url = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                      }}
                      className="cursor-pointer"
                      data-testid={`button-share-x-${post.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Share to X
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const url = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
                      }}
                      className="cursor-pointer"
                      data-testid={`button-share-facebook-${post.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Share to Facebook
                    </DropdownMenuItem>
                  </>
                )}
                {!canRepostPublic && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Group content - sharing limited
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}

const EXPLORE_OPTIONS: { value: ExploreMode; label: string; icon: typeof TrendingUp }[] = [
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "most_zapped", label: "Most Zapped", icon: Zap },
  { value: "media", label: "Media", icon: Camera },
  { value: "latest", label: "Latest", icon: Clock },
];

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("following");
  const [exploreMode, setExploreMode] = useState<ExploreMode>("trending");
  const { posts, isLoading, isRefreshing, refetch, ndkConnected, newPostCount, showNewPosts } = useNostrFeed(activeTab, exploreMode);

  const currentExploreOption = EXPLORE_OPTIONS.find(o => o.value === exploreMode) || EXPLORE_OPTIONS[0];

  const trendingTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    posts.forEach(post => {
      const hashtags = post.content.match(/#(\w+)/g);
      if (hashtags) {
        hashtags.forEach(tag => {
          const normalized = tag.toLowerCase();
          tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
        });
      }
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag.replace("#", ""));
  }, [posts]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif" data-testid="text-feed-title">Your Feed</h1>
          <button
            onClick={refetch}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] transition-colors disabled:opacity-50"
            data-testid="button-refresh-feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Personalized updates from your courses, communities, and connections</p>
        
        <PostComposer onPostPublished={refetch} />
        
        <div className="flex items-center gap-2 mb-6">
          <div className="flex bg-muted rounded-lg p-1 flex-1">
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "following" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="tab-following"
            >
              Following
            </button>
            <button
              onClick={() => setActiveTab("tribe")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "tribe" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="tab-tribe"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Tribes
              </span>
            </button>
            <button
              onClick={() => setActiveTab("buddies")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "buddies" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="tab-buddies"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Buddies
              </span>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "explore" ? "bg-[#6600ff] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-explore"
              >
                <currentExploreOption.icon className="w-4 h-4" />
                {currentExploreOption.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {EXPLORE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setExploreMode(option.value);
                    setActiveTab("explore");
                  }}
                  className={`cursor-pointer ${exploreMode === option.value && activeTab === "explore" ? "bg-[#F0E6FF]" : ""}`}
                  data-testid={`explore-option-${option.value}`}
                >
                  <option.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(activeTab === "tribe" || activeTab === "buddies") && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-[#F0E6FF] rounded-lg text-sm">
            <Lock className="w-4 h-4 text-[#6600ff] shrink-0" />
            <span className="text-[#6600ff]">
              {activeTab === "tribe" 
                ? "Tribe posts are private to the LaB community and never shared publicly."
                : "Buddy conversations are private and only visible to your buddies."}
            </span>
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1 space-y-4 min-w-0">
            {newPostCount > 0 && (
              <button
                onClick={showNewPosts}
                className="w-full py-2.5 px-4 bg-[#6600ff] text-white rounded-lg text-sm font-medium hover:bg-[#5500dd] transition-colors flex items-center justify-center gap-2 shadow-md"
                data-testid="button-show-new-posts"
              >
                <ArrowUp className="w-4 h-4" />
                Show {newPostCount} new {newPostCount === 1 ? "post" : "posts"}
              </button>
            )}
            {isLoading ? (
              <FeedLoadingSkeleton />
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No posts yet</p>
                <p className="text-sm mt-2">
                  {activeTab === "following" 
                    ? "Follow some people to see their posts here!" 
                    : activeTab === "tribe"
                    ? "No posts from your Tribe yet. Be the first to share!"
                    : activeTab === "buddies"
                    ? "No buddy posts yet. Connect with a buddy to get started!"
                    : "No posts found. Try a different explore category!"}
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block w-72 shrink-0 space-y-4">
            <Link href="/daily-practice">
              <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer border-none bg-gradient-to-br from-[#6600ff]/5 to-[#9900ff]/5" data-testid="card-daily-practice-cta">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6600ff]/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[#6600ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-serif">Daily LOVE Practice</p>
                    <p className="text-xs text-muted-foreground font-serif">Start your morning ritual</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card className="p-4 border-none" data-testid="card-trending-topics">
              <h3 className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Trending on Nostr
              </h3>
              <div className="space-y-3">
                {trendingTags.length > 0 ? (
                  trendingTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2 text-sm" data-testid={`trending-tag-${tag}`}>
                      <span className="text-[#6600ff] font-serif">#{tag}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground font-serif italic">Loading trending topics...</p>
                )}
              </div>
            </Card>

            <Card className="p-4 border-none" data-testid="card-community-info">
              <h3 className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                11x LOVE LaB
              </h3>
              <p className="text-xs text-muted-foreground font-serif leading-relaxed">
                A community dedicated to personal growth through the Daily LOVE Practice framework. 
                Elevate your vibe, set your vision, and celebrate your victories.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
