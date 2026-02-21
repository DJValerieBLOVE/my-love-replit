import Layout from "@/components/layout";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Zap, Share2, MoreHorizontal, Radio, Calendar, UserPlus, Repeat2, Bookmark, Quote, Users, Image as ImageIcon, Film, Smile, X, Link2, Copy, ExternalLink, Loader2, Lock, Globe, ChevronDown, TrendingUp, Flame, Camera, Clock, RefreshCw, ArrowUp, Plus, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
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
import { parseNostrContent, truncateNpub, resolveContentMentions, type NostrEntity, type ParsedContent } from "@/lib/nostr-content";
import { nip19 as nip19Utils } from "nostr-tools";
import { fetchPrimalFeed, fetchPrimalUserFeed, fetchPrimalEvent, type ExploreMode, type PrimalEvent, type PrimalProfile, type PrimalEventStats, type PrimalArticle, type ZapReceipt } from "@/lib/primal-cache";
import { GifPicker } from "@/components/gif-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zapPost } from "@/lib/api";
import { loadNWCConnection, zapViaLightning } from "@/lib/nwc";

export type FeedPost = {
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
  zapReceipts?: { pubkey: string; amount: number; name?: string; avatar?: string }[];
  source?: "nostr" | "community" | "learning";
  relaySource?: "private" | "public";
  community?: string;
  isOwnPost?: boolean;
};

export function formatSats(sats: number): string {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(1)}M`;
  if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}K`;
  return sats.toLocaleString();
}

export function formatTimestamp(date: number | string | Date) {
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

export type FeedTab = "following" | "tribe" | "buddies" | "explore";

export function primalEventToFeedPost(
  event: PrimalEvent,
  profiles: Map<string, PrimalProfile>,
  currentPubkey?: string,
  relaySource: "private" | "public" = "public",
  stats?: Map<string, PrimalEventStats>,
  zapReceipts?: Map<string, ZapReceipt[]>
): FeedPost {
  const profileData = profiles.get(event.pubkey);
  const eventStats = stats?.get(event.id);
  const rawZaps = zapReceipts?.get(event.id) || [];
  const resolvedZaps = rawZaps.map(zr => {
    const zapperProfile = profiles.get(zr.zapperPubkey);
    return {
      pubkey: zr.zapperPubkey,
      amount: zr.amount,
      name: zapperProfile?.display_name || zapperProfile?.name || zr.zapperPubkey.slice(0, 8),
      avatar: zapperProfile?.picture || "",
    };
  });
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
    zapReceipts: resolvedZaps.length > 0 ? resolvedZaps : undefined,
    source: "nostr",
    relaySource,
    isOwnPost: event.pubkey === currentPubkey,
  };
}

export function useNostrFeed(tab: FeedTab, exploreMode: ExploreMode) {
  const { fetchEvents, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [articles, setArticles] = useState<PrimalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [pendingPosts, setPendingPosts] = useState<FeedPost[]>([]);
  const latestPostIdRef = useRef<string | null>(null);
  const profileCacheRef = useRef<Map<string, { name: string; handle: string; avatar: string; lud16?: string }>>(new Map());
  const primalProfilesRef = useRef<Map<string, PrimalProfile>>(new Map());

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
            result.profiles.forEach((v, k) => primalProfilesRef.current.set(k, v));
            const feedPosts = result.events.map(e =>
              primalEventToFeedPost(e, result.profiles, profile?.pubkey, "public", result.stats, result.zapReceipts)
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
          result.profiles.forEach((v, k) => primalProfilesRef.current.set(k, v));
          const feedPosts = result.events.map(e =>
            primalEventToFeedPost(e, result.profiles, profile?.pubkey, "public", result.stats, result.zapReceipts)
          );
          setPosts(feedPosts);
          setArticles(result.articles || []);
        } catch (err) {
          console.error("[Feed] Primal cache error for explore:", err);
          setPosts([]);
          setArticles([]);
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
              primalEventToFeedPost(e, result!.profiles, profile?.pubkey, "public", result!.stats, result!.zapReceipts)
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
    }
  }, [pendingPosts]);

  const manualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setNewPostCount(0);
    setPendingPosts([]);
    await fetchFeed();
  }, [fetchFeed]);

  return { posts, articles, isLoading, isRefreshing, refetch: manualRefresh, ndkConnected, newPostCount, showNewPosts, pendingPosts, primalProfiles: primalProfilesRef.current };
}

type MediaItem = {
  type: "image" | "gif" | "video";
  url: string;
  file?: File;
};

export function PostComposer({ onPostPublished }: { onPostPublished?: () => void }) {
  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<{ type: "image" | "gif"; url: string; file?: File }[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const composerFileRef = useRef<HTMLInputElement>(null);
  const { publishSmart, ndk, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();

  const handleImageSelect = () => {
    composerFileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (response.ok) {
          const data = await response.json();
          setMediaItems(prev => [...prev, { type: "image", url: data.url, file }]);
        } else {
          toast.error("Failed to upload image");
        }
      } catch {
        const localUrl = URL.createObjectURL(file);
        setMediaItems(prev => [...prev, { type: "image", url: localUrl, file }]);
      }
    }
    if (composerFileRef.current) composerFileRef.current.value = "";
  };

  const handleGifSelect = (gifUrl: string) => {
    setMediaItems(prev => [...prev, { type: "gif", url: gifUrl }]);
    setShowGifPicker(false);
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => {
      const newItems = [...prev];
      if (newItems[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(newItems[index].url);
      }
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handlePost = async () => {
    if (!content.trim() && mediaItems.length === 0) return;

    if (!ndkConnected || !ndk) {
      toast.error("NDK not connected", { description: "Please wait for relay connection" });
      return;
    }

    setIsPosting(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      let postContent = content.trim();
      mediaItems.forEach(item => {
        if (item.url) {
          postContent += (postContent ? "\n" : "") + item.url;
        }
      });
      event.content = postContent;
      event.created_at = Math.floor(Date.now() / 1000);

      if (profile?.pubkey) {
        event.pubkey = profile.pubkey;
      }

      await publishSmart(event, true);

      toast.success("Posted to Nostr!");
      setContent("");
      setMediaItems([]);
      setShowGifPicker(false);
      onPostPublished?.();
    } catch (err: any) {
      console.error("[PostComposer] Publish error:", err);
      toast.error("Failed to post", { description: err.message || "Please try again" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="p-4 mb-6 border border-gray-100 shadow-none">
      <input
        ref={composerFileRef}
        type="file"
        accept="image/*,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          {profile?.picture ? (
            <AvatarImage src={profile.picture} />
          ) : null}
          <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] border rounded-lg resize-none focus-visible:ring-1 px-3 py-2 text-sm"
            data-testid="textarea-post-content"
          />
          
          {mediaItems.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mediaItems.map((item, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-muted">
                  <img src={item.url} alt="" className="w-full h-28 object-cover" />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-1.5 right-1.5 p-0.5 bg-foreground/70 rounded-full text-background hover:bg-foreground"
                    data-testid={`button-remove-media-${index}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showGifPicker && (
            <div className="mt-3">
              <GifPicker
                onSelect={handleGifSelect}
                onClose={() => setShowGifPicker(false)}
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <button
                onClick={handleImageSelect}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0E6FF] hover:text-foreground transition-colors"
                data-testid="button-add-image"
              >
                <ImageIcon className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setShowGifPicker(!showGifPicker)}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${showGifPicker ? 'text-[#6600ff] bg-[#F0E6FF]' : 'text-muted-foreground hover:bg-[#F0E6FF] hover:text-foreground'}`}
                data-testid="button-add-gif"
              >
                <Smile className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>
            </div>
            <Button
              onClick={handlePost}
              disabled={isPosting || (!content.trim() && mediaItems.length === 0)}
              className="px-6 bg-foreground text-background hover:bg-foreground/90"
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

type PostPrivacy = "public" | "private" | "buddy" | "secret";

const PRIVACY_OPTIONS: { id: PostPrivacy; label: string; icon: typeof Globe; description: string }[] = [
  { id: "public", label: "Public", icon: Globe, description: "Post to Nostr" },
  { id: "private", label: "Tribe Only", icon: Users, description: "Private to tribe" },
  { id: "buddy", label: "Buddy", icon: Lock, description: "Accountability buddy" },
  { id: "secret", label: "Secret", icon: Lock, description: "Vault only" },
];

export function CompactPostBar({ onPostPublished, autoOpen }: { onPostPublished?: () => void; autoOpen?: boolean }) {
  const [modalOpen, setModalOpen] = useState(autoOpen || false);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-compose", handler);
    return () => window.removeEventListener("open-compose", handler);
  }, []);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ type: "image" | "gif"; url: string; file?: File }[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { publishSmart, ndk, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (response.ok) {
          const data = await response.json();
          setMediaItems(prev => [...prev, { type: "image", url: data.url, file }]);
        } else {
          toast.error("Failed to upload image");
        }
      } catch {
        const localUrl = URL.createObjectURL(file);
        setMediaItems(prev => [...prev, { type: "image", url: localUrl, file }]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGifSelect = (gifUrl: string) => {
    setMediaItems(prev => [...prev, { type: "gif", url: gifUrl }]);
    setShowGifPicker(false);
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => {
      const newItems = [...prev];
      if (newItems[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(newItems[index].url);
      }
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handlePost = async () => {
    if (!content.trim() && mediaItems.length === 0) return;
    if (!ndkConnected || !ndk) {
      toast.error("NDK not connected", { description: "Please wait for relay connection" });
      return;
    }
    setIsPosting(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      let postContent = content.trim();
      mediaItems.forEach(item => {
        if (item.url) {
          postContent += (postContent ? "\n" : "") + item.url;
        }
      });
      event.content = postContent;
      event.created_at = Math.floor(Date.now() / 1000);
      if (profile?.pubkey) {
        event.pubkey = profile.pubkey;
      }
      await publishSmart(event, true);
      toast.success("Posted to Nostr!");
      setContent("");
      setMediaItems([]);
      setShowGifPicker(false);
      setModalOpen(false);
      onPostPublished?.();
    } catch (err: any) {
      console.error("[CompactPostBar] Publish error:", err);
      toast.error("Failed to post", { description: err.message || "Please try again" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className="flex items-center gap-3 mb-4 px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
        onClick={() => setModalOpen(true)}
        data-testid="compact-post-bar"
      >
        <Avatar className="w-8 h-8">
          {profile?.picture ? <AvatarImage src={profile.picture} /> : null}
          <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground flex-1">Start a post...</span>
        <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) setShowGifPicker(false);
      }}>
        <DialogContent className="sm:max-w-[560px] p-0">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-lg">Create post</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                {profile?.picture ? <AvatarImage src={profile.picture} /> : null}
                <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-normal mb-2">{profile?.name || "Anonymous"}</p>
                <Textarea
                  placeholder="Write something..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] border rounded-lg resize-none focus-visible:ring-1 px-3 py-2 text-sm"
                  autoFocus
                  data-testid="textarea-modal-post-content"
                />
                {mediaItems.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {mediaItems.map((item, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-muted">
                        <img src={item.url} alt="" className="w-full h-28 object-cover" />
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-1.5 right-1.5 p-0.5 bg-foreground/70 rounded-full text-background hover:bg-foreground"
                          data-testid={`button-remove-media-${index}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showGifPicker && (
                  <div className="mt-3">
                    <GifPicker
                      onSelect={handleGifSelect}
                      onClose={() => setShowGifPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <div className="flex items-center gap-1">
              <button
                onClick={handleImageSelect}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0E6FF] hover:text-foreground transition-colors"
                data-testid="button-modal-add-image"
                title="Add image"
              >
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setShowGifPicker(!showGifPicker)}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${showGifPicker ? 'text-[#6600ff] bg-[#F0E6FF]' : 'text-muted-foreground hover:bg-[#F0E6FF] hover:text-foreground'}`}
                data-testid="button-modal-add-gif"
                title="Add GIF"
              >
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="ghost" className="hover:bg-[#F0E6FF]">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handlePost}
                disabled={isPosting || (!content.trim() && mediaItems.length === 0)}
                className="px-6 bg-foreground text-background hover:bg-foreground/90"
                data-testid="button-modal-publish"
              >
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FeedLoadingSkeleton() {
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

type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

function LinkPreviewCard({ url }: { url: string }) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled && (data.title || data.description || data.image)) {
          setPreview(data);
        } else if (!cancelled) {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPreview();
    return () => { cancelled = true; };
  }, [url]);

  if (error || (!loading && !preview)) return null;
  if (loading) return (
    <div className="mt-2 rounded-xs border border-border p-3 animate-pulse">
      <div className="h-3 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block rounded-sm border border-border overflow-hidden hover:border-foreground/20 transition-colors group bg-muted"
      data-testid="link-preview-card"
    >
      <div className="flex items-stretch">
        {preview?.image && (
          <div className="w-[120px] min-w-[120px] overflow-hidden shrink-0">
            <img
              src={preview.image}
              alt={preview.title || ""}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
          {preview?.title && (
            <p className="text-sm font-normal line-clamp-2 leading-snug">{preview.title}</p>
          )}
          {preview?.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{preview.description}</p>
          )}
          {preview?.siteName && (
            <p className="text-[10px] text-muted-foreground mt-1">{preview.siteName}</p>
          )}
        </div>
      </div>
    </a>
  );
}

function EmbeddedNoteCard({ eventId, bech32 }: { eventId: string; bech32: string }) {
  const [note, setNote] = useState<{ content: string; author: string; avatar: string; handle: string; timestamp: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    let cancelled = false;
    const fetchNote = async () => {
      try {
        const { event, profile } = await fetchPrimalEvent(eventId);
        if (!cancelled && event) {
          setNote({
            content: event.content,
            author: profile?.display_name || profile?.name || event.pubkey.slice(0, 8) + "...",
            avatar: profile?.picture || "",
            handle: `@${profile?.nip05 || profile?.name || event.pubkey.slice(0, 8)}`,
            timestamp: event.created_at,
          });
        }
      } catch {}
      if (!cancelled) setLoading(false);
    };
    fetchNote();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) {
    return (
      <div className="my-2 rounded-sm border border-gray-200 p-3 animate-pulse" data-testid="nostr-event-link">
        <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (!note) {
    return (
      <a
        href={`https://njump.me/${bech32}`}
        target="_blank"
        rel="noopener noreferrer"
        className="my-2 block rounded-sm border border-gray-200 p-3 text-xs text-muted-foreground hover:border-[#6600ff] transition-colors"
        data-testid="nostr-event-link"
      >
        View note on Nostr
      </a>
    );
  }

  const truncatedContent = note.content.length > 280 ? note.content.slice(0, 280) + "..." : note.content;
  const cleanContent = truncatedContent.replace(/https?:\/\/\S+/g, '').replace(/nostr:\S+/g, '').trim();

  return (
    <a
      href={`https://njump.me/${bech32}`}
      target="_blank"
      rel="noopener noreferrer"
      className="my-2 block rounded-sm border border-gray-200 p-3 hover:border-[#6600ff] transition-colors group"
      data-testid="nostr-event-link"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Avatar className="w-5 h-5">
          {note.avatar && <AvatarImage src={note.avatar} />}
          <AvatarFallback className="text-[8px]">{note.author.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-normal">{note.author}</span>
        <span className="text-[10px] text-muted-foreground">{truncateNpub(note.handle)}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{formatTimestamp(note.timestamp)}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{cleanContent}</p>
    </a>
  );
}

const SHORT_NOTE_CHARS = 1400;
const SHORT_NOTE_WORDS = 200;

function shouldTruncateContent(text: string): boolean {
  if (text.length > SHORT_NOTE_CHARS) return true;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  return wordCount > SHORT_NOTE_WORDS;
}

function truncateText(text: string): string {
  let cutoff: number;
  if (text.length > SHORT_NOTE_CHARS) {
    const nextBreak = text.slice(SHORT_NOTE_CHARS).search(/\s|\n|\r/);
    cutoff = nextBreak >= 0 ? SHORT_NOTE_CHARS + nextBreak : SHORT_NOTE_CHARS;
  } else {
    const words = text.split(/(\s+)/);
    let wordCount = 0;
    let charIndex = 0;
    for (const part of words) {
      if (part.trim().length > 0) wordCount++;
      charIndex += part.length;
      if (wordCount >= SHORT_NOTE_WORDS) break;
    }
    cutoff = charIndex;
  }
  const TOKEN_PATTERN = /(?:https?:\/\/\S+|nostr:[a-z0-9]+)/gi;
  let m;
  while ((m = TOKEN_PATTERN.exec(text)) !== null) {
    const tokenEnd = m.index + m[0].length;
    if (m.index < cutoff && tokenEnd > cutoff) {
      cutoff = m.index;
      break;
    }
  }
  return text.slice(0, cutoff);
}

export type RichTextContentProps = {
  text: string;
  entities: NostrEntity[];
  links: string[];
  primalProfiles?: Map<string, PrimalProfile>;
  shorten?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
};

export function RichTextContent({ text, entities, links, primalProfiles, shorten = true, onToggleExpand, isExpanded }: RichTextContentProps) {
  const needsTruncation = shorten && !isExpanded && shouldTruncateContent(text);
  const displayText = needsTruncation ? truncateText(text) : text;
  const URL_PATTERN = /https?:\/\/\S+/g;
  const NOSTR_PATTERN = /nostr:(npub1[a-z0-9]+|nprofile1[a-z0-9]+|nevent1[a-z0-9]+|note1[a-z0-9]+|naddr1[a-z0-9]+)/g;
  const HASHTAG_PATTERN = /#(\w+)/g;

  const COMBINED_PATTERN = new RegExp(
    `(${URL_PATTERN.source}|${NOSTR_PATTERN.source}|${HASHTAG_PATTERN.source})`,
    'gi'
  );

  const entityMap = new Map<string, NostrEntity>();
  for (const e of entities) {
    entityMap.set(e.original, e);
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(COMBINED_PATTERN.source, 'gi');
  let key = 0;

  while ((match = regex.exec(displayText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(displayText.slice(lastIndex, match.index));
    }

    const matched = match[0];

    if (matched.startsWith('nostr:')) {
      const entity = entityMap.get(matched);
      if (entity && (entity.type === "npub" || entity.type === "nprofile")) {
        let name = entity.pubkey?.slice(0, 8) || "user";
        if (primalProfiles && entity.pubkey) {
          const profile = primalProfiles.get(entity.pubkey);
          if (profile) {
            name = profile.display_name || profile.name || name;
          }
        }
        parts.push(
          <span key={key++} className="text-[#6600ff] cursor-pointer hover:underline" data-testid="mention-link">
            @{name}
          </span>
        );
      } else if (entity && (entity.type === "nevent" || entity.type === "note")) {
        parts.push(
          <EmbeddedNoteCard key={key++} eventId={entity.eventId || ""} bech32={entity.bech32} />
        );
      } else if (entity && entity.type === "naddr") {
        let name = entity.pubkey?.slice(0, 8) || "address";
        if (primalProfiles && entity.pubkey) {
          const profile = primalProfiles.get(entity.pubkey);
          if (profile) {
            name = profile.display_name || profile.name || name;
          }
        }
        parts.push(
          <span key={key++} className="text-[#6600ff] cursor-pointer hover:underline" data-testid="nostr-event-link">
            @{name}
          </span>
        );
      } else {
        const shortBech = matched.slice(6, 18) + "..." + matched.slice(-4);
        parts.push(
          <span key={key++} className="text-[#6600ff] text-xs">
            nostr:{shortBech}
          </span>
        );
      }
    } else if (matched.startsWith('#')) {
      parts.push(
        <span key={key++} className="text-[#6600ff] cursor-pointer hover:underline">
          {matched}
        </span>
      );
    } else if (matched.startsWith('http')) {
      const cleanUrl = matched.replace(/[)}\]]+$/, '');
      const trailing = matched.slice(cleanUrl.length);
      let displayUrl = cleanUrl;
      try {
        const urlObj = new URL(cleanUrl);
        displayUrl = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
        if (displayUrl.length > 40) displayUrl = displayUrl.slice(0, 37) + "...";
      } catch {}
      parts.push(
        <a
          key={key++}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6600ff] hover:underline break-all"
          data-testid="content-link"
        >
          {displayUrl}
        </a>
      );
      if (trailing) parts.push(trailing);
    } else {
      parts.push(matched);
    }

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < displayText.length) {
    parts.push(displayText.slice(lastIndex));
  }

  const previewLinks = links.filter(l => {
    const lower = l.toLowerCase();
    return !(/\.(jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi)(\?|$)/i.test(lower));
  });

  return (
    <>
      <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap" data-testid="post-content-text">
        {parts}
        {needsTruncation && (
          <>
            {"... "}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
              className="text-[#6600ff] hover:underline text-sm inline"
              data-testid="button-see-more"
            >
              see more
            </button>
          </>
        )}
      </p>
      {previewLinks.length > 0 && (
        <div className="space-y-2">
          {previewLinks.slice(0, 2).map((link, i) => (
            <LinkPreviewCard key={link} url={link} />
          ))}
        </div>
      )}
    </>
  );
}

export function ArticleCard({ article, profile }: { article: PrimalArticle; profile?: PrimalProfile }) {
  const authorName = profile?.display_name || profile?.name || truncateNpub(article.pubkey);
  const authorPicture = profile?.picture || "";
  const timeAgo = formatTimestamp(article.publishedAt || article.created_at);
  const naddrId = (() => {
    try {
      return nip19Utils.naddrEncode({ identifier: article.identifier, pubkey: article.pubkey, kind: 30023 });
    } catch { return article.id; }
  })();

  return (
    <Card
      className="border-none shadow-sm bg-card rounded-xs hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => window.open(`https://primal.net/e/${naddrId}`, "_blank")}
      data-testid={`card-article-${article.id}`}
    >
      <div className="border-t-2 border-[#6600ff]" />
      {article.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs text-muted-foreground font-[Marcellus]">Long-form Article</span>
        </div>
        <h3 className="text-base font-[Marcellus] font-normal text-foreground leading-snug line-clamp-2" data-testid={`text-article-title-${article.id}`}>
          {article.title || "Untitled Article"}
        </h3>
        {article.summary && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed" data-testid={`text-article-summary-${article.id}`}>
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={authorPicture} alt={authorName} />
            <AvatarFallback className="text-[8px]">{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground" data-testid={`text-article-author-${article.id}`}>{authorName}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground" data-testid={`text-article-time-${article.id}`}>{timeAgo}</span>
        </div>
        {article.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {article.hashtags.slice(0, 4).map(tag => (
              <span key={tag} className="bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PostCard({ post, primalProfiles }: { post: FeedPost; primalProfiles?: Map<string, PrimalProfile> }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [quoteRepostOpen, setQuoteRepostOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [zapAmount, setZapAmount] = useState(21);
  const [zapInputValue, setZapInputValue] = useState("21");
  const [zapComment, setZapComment] = useState("");
  const [isZapOpen, setIsZapOpen] = useState(false);
  const [isZapping, setIsZapping] = useState(false);
  const [isZapped, setIsZapped] = useState(false);
  const [localZapReceipts, setLocalZapReceipts] = useState(post.zapReceipts || []);
  const [localSatsZapped, setLocalSatsZapped] = useState(post.satszapped);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [quoteImage, setQuoteImage] = useState<string | null>(null);
  const [showReplyGifPicker, setShowReplyGifPicker] = useState(false);
  const [showQuoteGifPicker, setShowQuoteGifPicker] = useState(false);
  const [editingPresets, setEditingPresets] = useState(false);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const quoteFileRef = useRef<HTMLInputElement>(null);
  const { publishSmart, ndk, isConnected: ndkConnected } = useNDK();
  const { isConnected, profile } = useNostr();
  const [, navigate] = useLocation();

  const isGroupPost = isGroupContent(post);
  const canRepostPublic = canSharePublicly(post);
  const groupName = getGroupName(post);

  const handleImageUpload = async (file: File, setter: (url: string | null) => void) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        setter(data.url);
      }
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRepostPublic = async () => {
    if (!canRepostPublic) {
      toast("Cannot share publicly", { 
        description: "Group posts can only be shared within the group" 
      });
      return;
    }
    if (!ndk || !ndkConnected) {
      toast.error("Not connected to Nostr");
      return;
    }
    try {
      const event = new NDKEvent(ndk);
      event.kind = 6;
      event.content = JSON.stringify(post);
      event.tags = [
        ["e", post.id, ""],
        ["p", post.author.pubkey || ""],
      ];
      await publishSmart(event, true);
      toast("Reposted to Nostr!", { 
        description: `You reposted ${post.author.name}'s post publicly` 
      });
      setIsReposted(true);
    } catch (err) {
      toast.error("Failed to repost");
    }
  };

  const handleRepostGroup = () => {
    if (!isGroupPost) return;
    toast("Reposted within group!", { 
      description: `Shared within ${groupName}` 
    });
    setIsReposted(true);
  };

  const handleQuoteRepost = async () => {
    if (!ndk || !ndkConnected) {
      toast.error("Not connected to Nostr");
      return;
    }
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      const noteRef = `nostr:${post.id}`;
      let content = quoteText ? `${quoteText}\n\n${noteRef}` : noteRef;
      if (quoteImage) {
        content += `\n${quoteImage}`;
      }
      event.content = content;
      event.tags = [
        ["e", post.id, "", "mention"],
        ["p", post.author.pubkey || ""],
      ];
      const isPublic = canRepostPublic;
      await publishSmart(event, isPublic);
      if (!isPublic) {
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
      setQuoteImage(null);
    } catch (err) {
      toast.error("Failed to post quote");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? "Removed from bookmarks" : "Bookmarked!");
  };

  const handleReply = () => {
    setReplyOpen(!replyOpen);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() && !replyImage) return;
    if (!ndk || !ndkConnected) {
      toast.error("Not connected to Nostr");
      return;
    }
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      let content = replyText.trim();
      if (replyImage) {
        content += (content ? "\n" : "") + replyImage;
      }
      event.content = content;
      event.tags = [
        ["e", post.id, "", "reply"],
        ["p", post.author.pubkey || ""],
      ];
      await publishSmart(event, true);
      toast("Reply posted!", { description: `Replied to ${post.author.name}` });
      setReplyText("");
      setReplyImage(null);
      setReplyOpen(false);
    } catch (err) {
      toast.error("Failed to post reply");
    }
  };

  const handleZap = async () => {
    if (!isConnected) {
      toast.error("Please login to zap posts", { description: "Connect your Nostr account to send zaps" });
      return;
    }
    setIsZapping(true);
    try {
      const nwcConnection = loadNWCConnection();
      let paymentHash: string | undefined;
      if (nwcConnection && post.author.lud16) {
        try {
          const result = await zapViaLightning(
            nwcConnection,
            post.author.lud16,
            zapAmount,
            zapComment || undefined,
            post.author.pubkey && ndk ? {
              senderPubkey: profile?.pubkey || "",
              recipientPubkey: post.author.pubkey,
              eventId: post.eventId,
              signEvent: async (eventData: any) => {
                const ndkEvent = new NDKEvent(ndk);
                ndkEvent.kind = eventData.kind;
                ndkEvent.content = eventData.content;
                ndkEvent.tags = eventData.tags;
                ndkEvent.created_at = eventData.created_at;
                await ndkEvent.sign();
                return ndkEvent.rawEvent();
              }
            } : undefined
          );
          paymentHash = result.paymentHash;
          toast.success("Lightning Zap Sent!", { description: `You sent ${zapAmount} sats to ${post.author.name} via Lightning` });
        } catch (lightningError: any) {
          console.error("Lightning payment failed:", lightningError);
          toast.error("Lightning payment failed", { description: lightningError.message || "Please try again" });
        }
      } else if (!nwcConnection) {
        toast.info("No wallet connected", { description: "Connect a Lightning wallet in the Wallet page for real payments" });
      } else if (!post.author.lud16) {
        toast.info("Recipient has no Lightning address", { description: "Recording zap to community leaderboard only" });
      }
      setIsZapped(true);
      setLocalSatsZapped(prev => prev + zapAmount);
      const myReceipt = {
        pubkey: profile?.pubkey || "",
        amount: zapAmount,
        name: profile?.name || "You",
        avatar: profile?.picture || "",
      };
      setLocalZapReceipts(prev => [myReceipt, ...prev]);
      setIsZapOpen(false);
      setZapComment("");
      setZapAmount(21);
      setZapInputValue("21");
    } catch (error: any) {
      console.error("Zap error:", error);
      toast.error("Failed to zap", { description: error.message || "Please try again" });
    } finally {
      setIsZapping(false);
    }
  };

  const getZapPresets = (): number[] => {
    if (typeof window === 'undefined') return [21, 50, 100, 500, 1000, 5000];
    try {
      const saved = localStorage.getItem("zapPresets");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [21, 50, 100, 500, 1000, 5000];
  };
  const [zapPresets, setZapPresets] = useState<number[]>(getZapPresets);
  const [editPresetValues, setEditPresetValues] = useState<string[]>(zapPresets.map(String));

  const savePresets = () => {
    const newPresets = editPresetValues.map(v => Math.max(1, parseInt(v) || 21));
    setZapPresets(newPresets);
    localStorage.setItem("zapPresets", JSON.stringify(newPresets));
    setEditingPresets(false);
  };

  return (
    <Card className="p-4 border border-gray-100 shadow-none hover:border-gray-200 transition-colors" data-testid={`post-${post.id}`}>
      <div className="flex gap-3">
        {post.author.pubkey ? (
          <Link href={`/profile/${post.author.pubkey}`} className="shrink-0">
            <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {post.author.pubkey ? (
              <Link href={`/profile/${post.author.pubkey}`} className="text-sm truncate max-w-[140px] hover:underline cursor-pointer" style={{ fontFamily: 'Marcellus, serif' }}>{post.author.name}</Link>
            ) : (
              <span className="text-sm truncate max-w-[140px]" style={{ fontFamily: 'Marcellus, serif' }}>{post.author.name}</span>
            )}
            <span className="text-muted-foreground text-xs truncate max-w-[120px]">{truncateNpub(post.author.handle)}</span>
            <span className="text-muted-foreground text-[11px] flex items-center gap-1 shrink-0">
              · {post.timestamp}
              {post.relaySource === "private" && (
                <Lock className="w-3 h-3" strokeWidth={1.5} />
              )}
              {post.relaySource === "public" && (
                <Globe className="w-3 h-3" strokeWidth={1.5} />
              )}
            </span>
            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 hover:bg-[#F0E6FF] shrink-0" data-testid={`button-more-${post.id}`}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </Button>
          </div>
          {(() => {
            const parsed = parseNostrContent(post.content);
            return (
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a, button, video, img, [role="button"]')) return;
                  navigate(`/note/${post.eventId || post.id}`);
                }}
                data-testid={`link-thread-${post.id}`}
              >
                <RichTextContent
                  text={parsed.text}
                  entities={parsed.entities}
                  links={parsed.links}
                  primalProfiles={primalProfiles}
                  shorten={true}
                  isExpanded={isContentExpanded}
                  onToggleExpand={() => setIsContentExpanded(true)}
                />
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
              </div>
            );
          })()}
          {localZapReceipts.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 mb-1 flex-wrap" data-testid={`zap-receipts-${post.id}`}>
              <Zap className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
              {localZapReceipts.slice(0, 5).map((zr, i) => (
                <div key={`${zr.pubkey}-${i}`} className="flex items-center gap-1 rounded-full px-1.5 py-0.5 border border-gray-200" style={{ backgroundColor: '#ffffff' }} data-testid={`zap-receipt-${post.id}-${i}`}>
                  <Avatar className="w-4 h-4">
                    {zr.avatar && <AvatarImage src={zr.avatar} />}
                    <AvatarFallback className="text-[6px] bg-gray-100">{(zr.name || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground">{formatSats(zr.amount)}</span>
                </div>
              ))}
              {localZapReceipts.length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{localZapReceipts.length - 5} more</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <button 
              onClick={handleReply}
              className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors text-xs flex-1 text-muted-foreground hover:text-foreground`} 
              data-testid={`button-reply-${post.id}`}
            >
              <MessageCircle className={`w-3.5 h-3.5 ${replyOpen ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} />
              <span>{post.comments > 0 ? post.comments : ""}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors text-xs flex-1 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 text-muted-foreground hover:text-foreground`} data-testid={`button-repost-${post.id}`}>
                  <Repeat2 className={`w-4 h-4 ${isReposted ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} />
                  <span>{post.reposts > 0 ? post.reposts : ""}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {canRepostPublic ? (
                  <DropdownMenuItem onClick={handleRepostPublic} data-testid={`menu-repost-${post.id}`}>
                    <Repeat2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    <div>
                      <p>Repost to Nostr</p>
                      <p className="text-xs text-muted-foreground">Share publicly</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled className="text-[#A1A1AA] cursor-not-allowed" data-testid={`menu-repost-disabled-${post.id}`}>
                    <Repeat2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    <div>
                      <p>Repost to Nostr</p>
                      <p className="text-xs text-muted-foreground">Only your own content can go public</p>
                    </div>
                  </DropdownMenuItem>
                )}
                {isGroupPost && (
                  <DropdownMenuItem onClick={handleRepostGroup} data-testid={`menu-repost-group-${post.id}`}>
                    <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    <div>
                      <p>Repost within Group</p>
                      <p className="text-xs text-muted-foreground">{groupName}</p>
                    </div>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setQuoteRepostOpen(true)} data-testid={`menu-quote-repost-${post.id}`}>
                  <Quote className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  <div>
                    <p>Quote Repost</p>
                    <p className="text-xs text-muted-foreground">
                      {canRepostPublic ? "Add your thoughts" : "Within group only"}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={quoteRepostOpen} onOpenChange={(open) => {
              setQuoteRepostOpen(open);
              if (!open) { setShowQuoteGifPicker(false); setQuoteImage(null); }
            }}>
              <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
                    <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm text-amber-800">
                      This post is from a private group. Your quote will only be visible within that group.
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <Textarea 
                    placeholder="What are your thoughts?"
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="min-h-[80px] resize-none"
                    data-testid={`textarea-quote-${post.id}`}
                  />
                  {quoteImage && (
                    <div className="relative inline-block">
                      <img src={quoteImage} alt="Attachment" className="max-h-32 rounded-lg" />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-1 right-1 w-5 h-5"
                        onClick={() => setQuoteImage(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <input
                      ref={quoteFileRef}
                      type="file"
                      accept="image/*,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, setQuoteImage);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-full"
                      onClick={() => quoteFileRef.current?.click()}
                      data-testid={`button-quote-image-${post.id}`}
                    >
                      <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-full"
                      onClick={() => setShowQuoteGifPicker(!showQuoteGifPicker)}
                      data-testid={`button-quote-gif-${post.id}`}
                    >
                      <Smile className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                  {showQuoteGifPicker && (
                    <GifPicker
                      onSelect={(gifUrl) => {
                        setQuoteImage(gifUrl);
                        setShowQuoteGifPicker(false);
                      }}
                      onClose={() => setShowQuoteGifPicker(false)}
                    />
                  )}
                  <Card className="p-3 bg-[#F4F4F5] overflow-hidden">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-normal truncate">{post.author.name}</span>
                    </div>
                    <p className="text-sm mt-2 line-clamp-3 break-words overflow-hidden">{post.content}</p>
                  </Card>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleQuoteRepost}
                    data-testid={`button-submit-quote-${post.id}`}
                  >
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isZapOpen} onOpenChange={(open) => {
              setIsZapOpen(open);
              if (!open) setEditingPresets(false);
            }}>
              <button
                onClick={() => setIsZapOpen(true)}
                className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors text-xs flex-1 text-muted-foreground hover:text-foreground`}
                data-testid={`button-zap-${post.id}`}
              >
                <Zap className={`w-3.5 h-3.5 ${isZapped ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} fill={isZapped ? "#6600ff" : "none"} />
                <span data-testid={`count-zaps-${post.id}`}>{localSatsZapped > 0 ? formatSats(localSatsZapped) : ""}</span>
              </button>
              <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-normal">
                    <Zap className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /> Zap {post.author.name}
                  </DialogTitle>
                  <DialogDescription>
                    Send sats directly to their Lightning Address.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 py-3">
                  {editingPresets ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {editPresetValues.map((val, i) => (
                          <Input
                            key={i}
                            type="number"
                            value={val}
                            onChange={(e) => {
                              const newVals = [...editPresetValues];
                              newVals[i] = e.target.value;
                              setEditPresetValues(newVals);
                            }}
                            className="text-center text-sm h-9"
                            data-testid={`input-preset-${i}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingPresets(false)} className="text-xs hover:bg-[#F0E6FF]">Cancel</Button>
                        <Button size="sm" onClick={savePresets} className="text-xs bg-foreground text-background hover:bg-foreground/90">Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {zapPresets.map((amount) => (
                          <button
                            key={amount}
                            className={`h-9 rounded-md text-sm font-normal flex items-center justify-center gap-1 transition-colors border ${
                              zapAmount === amount
                                ? "bg-foreground text-background border-foreground"
                                : "border-border hover:border-foreground/30 hover:bg-[#F0E6FF] text-foreground"
                            }`}
                            onClick={() => {
                              setZapAmount(amount);
                              setZapInputValue(String(amount));
                            }}
                            data-testid={`button-preset-${amount}`}
                          >
                            <Zap className="w-3 h-3" strokeWidth={1.5} /> {amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setEditPresetValues(zapPresets.map(String));
                          setEditingPresets(true);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="button-edit-presets"
                      >
                        customize amounts
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor={`custom-amount-${post.id}`} className="text-sm text-muted-foreground">Custom Amount (Sats)</Label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                      <Input
                        id={`custom-amount-${post.id}`}
                        type="text"
                        inputMode="numeric"
                        value={zapInputValue}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setZapInputValue(val);
                          setZapAmount(parseInt(val) || 0);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="pl-9 text-sm font-normal bg-[#FAFAFA] border-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`zap-comment-${post.id}`} className="text-sm text-muted-foreground">Comment (Optional)</Label>
                    <Input
                      id={`zap-comment-${post.id}`}
                      placeholder="Great post!"
                      value={zapComment}
                      onChange={(e) => setZapComment(e.target.value)}
                      className="bg-[#FAFAFA] border-muted text-sm"
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="hover:bg-[#F0E6FF]">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    onClick={handleZap}
                    disabled={isZapping || !isConnected || zapAmount <= 0}
                    className="bg-foreground hover:bg-foreground/90 text-background font-normal px-8 w-full sm:w-auto disabled:opacity-50"
                    data-testid={`button-confirm-zap-${post.id}`}
                  >
                    {isZapping ? "Zapping..." : `Zap ${zapAmount.toLocaleString()} Sats`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button 
              onClick={handleLike}
              className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors text-xs flex-1 text-muted-foreground hover:text-foreground`} 
              data-testid={`button-like-${post.id}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-[#eb00a8]' : ''}`} strokeWidth={1.5} fill={isLiked ? "#eb00a8" : "none"} />
              <span data-testid={`count-likes-${post.id}`}>{likes > 0 ? likes : ""}</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-1 transition-colors text-xs flex-1 text-muted-foreground hover:text-foreground`} 
              data-testid={`button-bookmark-${post.id}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} fill={isBookmarked ? "#6600ff" : "none"} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground rounded-full px-2 py-1 transition-colors text-xs flex-1" 
                  data-testid={`button-share-${post.id}`}
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
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
                  <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
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
                      <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
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
                      <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
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
          {replyOpen && (
            <div className="mt-3 pt-3 border-t border-gray-100" data-testid={`reply-composer-${post.id}`}>
              <Textarea
                placeholder={`Reply to ${post.author.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
                autoFocus
                data-testid={`textarea-reply-${post.id}`}
              />
              {replyImage && (
                <div className="relative inline-block mt-2">
                  <img src={replyImage} alt="Attachment" className="max-h-24 rounded-lg" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-1 right-1 w-5 h-5"
                    onClick={() => setReplyImage(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={replyFileRef}
                    type="file"
                    accept="image/*,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, setReplyImage);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-full"
                    onClick={() => replyFileRef.current?.click()}
                    data-testid={`button-reply-image-${post.id}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-[#6600ff] hover:bg-[#F0E6FF] rounded-full"
                    onClick={() => setShowReplyGifPicker(!showReplyGifPicker)}
                    data-testid={`button-reply-gif-${post.id}`}
                  >
                    <Smile className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setReplyOpen(false); setReplyText(""); setReplyImage(null); setShowReplyGifPicker(false); }}
                    className="text-xs hover:bg-[#F0E6FF]"
                    data-testid={`button-cancel-reply-${post.id}`}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() && !replyImage}
                    className="text-xs bg-foreground text-background hover:bg-white hover:border-[#E5E5E5] hover:text-foreground border border-transparent"
                    data-testid={`button-submit-reply-${post.id}`}
                  >
                    Reply
                  </Button>
                </div>
              </div>
              {showReplyGifPicker && (
                <div className="mt-2">
                  <GifPicker
                    onSelect={(gifUrl) => {
                      setReplyImage(gifUrl);
                      setShowReplyGifPicker(false);
                    }}
                    onClose={() => setShowReplyGifPicker(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export const EXPLORE_OPTIONS: { value: ExploreMode; label: string; icon: typeof TrendingUp }[] = [
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "most_zapped", label: "Most Zapped", icon: Zap },
  { value: "media", label: "Media", icon: Camera },
  { value: "latest", label: "Latest", icon: Clock },
];

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("following");
  const [exploreMode, setExploreMode] = useState<ExploreMode>("trending");
  const { posts, articles, isLoading, isRefreshing, refetch, ndkConnected, newPostCount, showNewPosts, pendingPosts, primalProfiles } = useNostrFeed(activeTab, exploreMode);

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
      <div className="p-4 lg:p-6 max-w-[960px] mx-auto" style={{ marginLeft: 'clamp(0px, calc(50vw - 550px), calc(100% - 960px))' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif" data-testid="text-feed-title">Your Feed</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Personalized updates from your courses, communities, and connections</p>
        
        <PostComposer onPostPublished={refetch} />
        
        {/* Sticky tabs - stay visible during scroll, spans feed + sidebar */}
        <div className="sticky top-14 md:top-20 z-[30] py-3" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div className="flex items-center">
            <div className="flex gap-1 flex-1 max-w-[620px]">
              <button
                onClick={() => setActiveTab("following")}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === "following" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid="tab-following"
              >
                Following
              </button>
              <button
                onClick={() => setActiveTab("tribe")}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === "tribe" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid="tab-tribe"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" strokeWidth={1.5} />
                  Tribes
                </span>
              </button>
              <button
                onClick={() => setActiveTab("buddies")}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === "buddies" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid="tab-buddies"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" strokeWidth={1.5} />
                  Buddies
                </span>
              </button>
            </div>

            <div className="hidden lg:flex w-[300px] shrink-0 ml-6 items-center justify-center gap-2">
              <button
                onClick={refetch}
                disabled={isRefreshing || isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors disabled:text-[#C4C4C4] disabled:cursor-not-allowed"
                data-testid="button-refresh-feed"
                title="Refresh feed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === "explore" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                    data-testid="tab-explore"
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
                      onClick={() => {
                        setExploreMode(option.value);
                        setActiveTab("explore");
                      }}
                      className={`cursor-pointer ${exploreMode === option.value && activeTab === "explore" ? "bg-gray-50" : ""}`}
                      data-testid={`explore-option-${option.value}`}
                    >
                      <option.icon className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="lg:hidden ml-auto flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={isRefreshing || isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors disabled:text-[#C4C4C4] disabled:cursor-not-allowed"
                data-testid="button-refresh-feed-mobile"
                title="Refresh feed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === "explore" ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                    data-testid="tab-explore-mobile"
                  >
                    <currentExploreOption.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {currentExploreOption.label}
                    <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
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
                      className={`cursor-pointer ${exploreMode === option.value && activeTab === "explore" ? "bg-gray-50" : ""}`}
                    >
                      <option.icon className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {(activeTab === "tribe" || activeTab === "buddies") && (
          <div className="flex items-center gap-2 mt-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="text-muted-foreground">
              {activeTab === "tribe" 
                ? "Tribe posts are private to the LaB community and never shared publicly."
                : "Buddy conversations are private and only visible to your buddies."}
            </span>
          </div>
        )}

        <div className="flex gap-6 mt-4">
          <div className="flex-1 space-y-4 min-w-0 max-w-[620px]">
            {/* New posts pill - positioned below sticky tabs, not overlapping */}
            {newPostCount > 0 && (
              <div className="flex justify-center -mt-2 mb-2">
                <button
                  onClick={showNewPosts}
                  className="flex items-center gap-2.5 px-4 py-2 bg-foreground text-background rounded-full shadow-lg hover:shadow-xl transition-all text-sm"
                  data-testid="button-show-new-posts"
                >
                  <div className="flex -space-x-2">
                    {pendingPosts.slice(0, 3).map((p, i) => (
                      <Avatar key={p.id} className="w-6 h-6 border-2 border-foreground" style={{ zIndex: 3 - i }}>
                        {p.author.avatar && <AvatarImage src={p.author.avatar} />}
                        <AvatarFallback className="text-[8px] bg-muted-foreground text-background">{p.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="font-normal">
                    {newPostCount} new {newPostCount === 1 ? "post" : "posts"}
                  </span>
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
                    <ArticleCard
                      article={articles[Math.floor(index / 5)]}
                      profile={primalProfiles.get(articles[Math.floor(index / 5)].pubkey)}
                    />
                  )}
                </div>
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

          <div className="hidden lg:block w-[300px] shrink-0 space-y-4 sticky top-36 self-start max-h-[calc(100vh-160px)] overflow-y-auto">
            <Link href="/daily-practice">
              <Card className="p-4 hover:border-gray-300 transition-colors cursor-pointer border border-gray-100 shadow-none" data-testid="card-daily-practice-cta">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontFamily: 'Marcellus, serif' }}>Daily LOVE Practice</p>
                    <p className="text-xs text-muted-foreground">Start your morning ritual</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card className="p-4 border border-gray-100 shadow-none" data-testid="card-trending-topics">
              <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2" style={{ fontFamily: 'Marcellus, serif' }}>
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                Trending on Nostr
              </h3>
              <div className="space-y-2.5">
                {trendingTags.length > 0 ? (
                  trendingTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2 text-sm" data-testid={`trending-tag-${tag}`}>
                      <span className="text-[#6600ff]">#{tag}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Loading trending topics...</p>
                )}
              </div>
            </Card>

            <Card className="p-4 border border-gray-100 shadow-none" data-testid="card-community-info">
              <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2" style={{ fontFamily: 'Marcellus, serif' }}>
                <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                11x LOVE LaB
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
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
