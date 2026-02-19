import Layout from "@/components/layout";
import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Zap, Share2, MoreHorizontal, Radio, Calendar, UserPlus, Repeat2, Bookmark, Quote, Users, Image, Film, Smile, X, Link2, Copy, ExternalLink, Loader2, Lock, Globe } from "lucide-react";
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
  source?: "nostr" | "community" | "learning";
  relaySource?: "private" | "public";
  community?: string;
  isOwnPost?: boolean;
};

const MOCK_POSTS: FeedPost[] = [
  {
    id: "1",
    author: {
      id: "user-alex-luna",
      name: "Alex Luna",
      handle: "@alexluna",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      lud16: "alexluna@getalby.com",
    },
    content: "Just completed my 30-day morning routine experiment! The compound effect is real. Sharing my learnings with the community later today.",
    timestamp: "2h ago",
    likes: 24,
    comments: 5,
    zaps: 1200,
    source: "nostr" as const,
  },
  {
    id: "2",
    author: {
      id: "user-jordan-rivera",
      name: "Jordan Rivera",
      handle: "@jordanr",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      lud16: "jordanr@getalby.com",
    },
    content: "Big breakthrough in my Money area today. Finally automated my savings and it feels like a weight lifted off my shoulders. Small wins add up!",
    timestamp: "4h ago",
    likes: 42,
    comments: 8,
    zaps: 2100,
    source: "nostr" as const,
  },
  {
    id: "3",
    author: {
      id: "user-11x-love-lab",
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
    isOwnPost: false,
  },
  {
    id: "5",
    author: {
      id: "current-user",
      name: "You",
      handle: "@you",
      avatar: "",
    },
    content: "My breakthrough moment today in the Body dimension - finally completed 30 days of morning workouts! Sharing this win with my community.",
    timestamp: "1h ago",
    likes: 12,
    comments: 4,
    zaps: 500,
    source: "community",
    community: "11x LOVE LaB",
    isOwnPost: true,
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

type FeedTab = "all" | "global" | "lab" | "following";

function useNostrFeed(tab: FeedTab) {
  const { fetchEvents, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const profileCacheRef = useRef<Map<string, { name: string; handle: string; avatar: string; lud16?: string }>>(new Map());
  const followListRef = useRef<string[]>([]);

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
    console.log("[Feed] fetchFeed called, ndkConnected:", ndkConnected, "tab:", tab);
    if (!ndkConnected) return;

    setIsLoading(true);
    try {
      let relayUrls: string[] | undefined;
      let authorFilter: string[] | undefined;

      if (tab === "global") {
        relayUrls = [...PUBLIC_RELAYS];
      } else if (tab === "lab") {
        relayUrls = [LAB_RELAY_URL];
      } else if (tab === "following") {
        if (!profile?.pubkey) {
          setPosts([]);
          setIsLoading(false);
          return;
        }
        const contactEvents = await fetchEvents({ kinds: [3], authors: [profile.pubkey], limit: 1 });
        if (contactEvents.length > 0) {
          const contacts = contactEvents[0].tags
            .filter(t => t[0] === "p")
            .map(t => t[1]);
          followListRef.current = contacts;
          if (contacts.length === 0) {
            setPosts([]);
            setIsLoading(false);
            return;
          }
          authorFilter = contacts.slice(0, 100);
        } else {
          setPosts([]);
          setIsLoading(false);
          return;
        }
      } else {
        relayUrls = [LAB_RELAY_URL, ...PUBLIC_RELAYS];
      }

      const filter: any = { kinds: [1], limit: 50 };
      if (authorFilter) {
        filter.authors = authorFilter;
      }

      console.log("[Feed] Fetching events with filter:", filter, "relayUrls:", relayUrls);
      const events = await fetchEvents(filter, relayUrls);
      console.log("[Feed] Got", events.length, "events from relays");

      if (events.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      const sortedEvents = events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

      const eventIds = sortedEvents.map(e => e.id);
      const uniquePubkeys = Array.from(new Set(sortedEvents.map(e => e.pubkey)));

      const [reactionEvents, zapEvents] = await Promise.all([
        fetchEvents({ kinds: [7], "#e": eventIds, limit: 500 }, relayUrls),
        fetchEvents({ kinds: [9735], "#e": eventIds, limit: 500 }, relayUrls),
      ]);

      const reactionCounts = new Map<string, number>();
      for (const r of reactionEvents) {
        const eTag = r.tags.find(t => t[0] === "e");
        if (eTag) {
          reactionCounts.set(eTag[1], (reactionCounts.get(eTag[1]) || 0) + 1);
        }
      }

      const zapCounts = new Map<string, number>();
      for (const z of zapEvents) {
        const eTag = z.tags.find(t => t[0] === "e");
        if (eTag) {
          zapCounts.set(eTag[1], (zapCounts.get(eTag[1]) || 0) + 1);
        }
      }

      await Promise.all(uniquePubkeys.map(pk => fetchProfileForPubkey(pk)));

      const feedPosts: FeedPost[] = sortedEvents.map(event => {
        const profileData = profileCacheRef.current.get(event.pubkey) || {
          name: event.pubkey.slice(0, 8) + "...",
          handle: `@${event.pubkey.slice(0, 8)}`,
          avatar: "",
        };

        let relaySource: "private" | "public" = "public";
        if (tab === "lab") {
          relaySource = "private";
        } else if (tab === "global") {
          relaySource = "public";
        } else {
          const eventRelay = (event as any).relay?.url || "";
          if (eventRelay === LAB_RELAY_URL || eventRelay.includes("railway.app")) {
            relaySource = "private";
          }
        }

        return {
          id: event.id,
          eventId: event.id,
          author: {
            pubkey: event.pubkey,
            name: profileData.name,
            handle: profileData.handle,
            avatar: profileData.avatar,
            lud16: profileData.lud16,
          },
          content: event.content,
          timestamp: formatTimestamp(event.created_at || 0),
          likes: reactionCounts.get(event.id) || 0,
          comments: 0,
          zaps: zapCounts.get(event.id) || 0,
          source: "nostr" as const,
          relaySource,
          isOwnPost: event.pubkey === profile?.pubkey,
        };
      });

      setPosts(feedPosts);
    } catch (err) {
      console.error("[useNostrFeed] Error fetching feed:", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [ndkConnected, tab, fetchEvents, fetchProfileForPubkey, profile?.pubkey]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { posts, isLoading, refetch: fetchFeed, ndkConnected };
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
                className="text-muted-foreground hover:text-love-body hover:bg-love-body-light"
                data-testid="button-add-image"
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGifSelect}
                className="text-muted-foreground hover:text-love-mission hover:bg-love-mission-light"
                data-testid="button-add-gif"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileSelect("video")}
                className="text-muted-foreground hover:text-love-time hover:bg-love-time-light"
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{post.author.name}</span>
            <span className="text-muted-foreground text-sm">{post.author.handle}</span>
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              · {post.timestamp}
              {post.relaySource === "private" && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
              {post.relaySource === "public" && (
                <Globe className="w-3 h-3 text-muted-foreground" />
              )}
            </span>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 hover:bg-[#F0E6FF]" data-testid={`button-more-${post.id}`}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <p className="text-sm mt-1 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-love-time hover:bg-love-time-light rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-reply-${post.id}`}>
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments > 0 ? post.comments : ""}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isReposted ? 'text-love-mission' : 'text-muted-foreground hover:text-love-mission hover:bg-love-mission-light'}`} data-testid={`button-repost-${post.id}`}>
                  <Repeat2 className="w-4 h-4" />
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

            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-love-family hover:bg-love-family-light rounded-md px-2 py-1 transition-colors text-sm" data-testid={`button-zap-${post.id}`}>
              <Zap className="w-5 h-5" />
              <span data-testid={`count-zaps-${post.id}`}>{post.zaps > 0 ? post.zaps.toLocaleString() : ""}</span>
            </button>

            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isLiked ? 'text-love-romance' : 'text-muted-foreground hover:text-love-romance hover:bg-love-romance-light'}`} 
              data-testid={`button-like-${post.id}`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
              <span data-testid={`count-likes-${post.id}`}>{likes > 0 ? likes : ""}</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors text-sm ${isBookmarked ? 'text-love-body' : 'text-muted-foreground hover:text-love-body hover:bg-love-body-light'}`} 
              data-testid={`button-bookmark-${post.id}`}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-love-soul hover:bg-love-soul-light rounded-md px-2 py-1 transition-colors text-sm ml-auto" 
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

function FeedSidebar() {
  return (
    <div className="space-y-6">
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
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const { posts, isLoading, refetch, ndkConnected } = useNostrFeed(activeTab);

  const displayPosts = posts.length > 0 ? posts : (!ndkConnected ? MOCK_POSTS : []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-serif font-bold mb-2">Your Feed</h1>
        <p className="text-muted-foreground text-sm mb-6">Personalized updates from your courses, communities, and connections</p>
        
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <PostComposer onPostPublished={refetch} />
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedTab)} className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="global" data-testid="tab-global">Global</TabsTrigger>
                <TabsTrigger value="lab" data-testid="tab-lab">LaB</TabsTrigger>
                <TabsTrigger value="following" data-testid="tab-following">Following</TabsTrigger>
              </TabsList>

              {(["all", "global", "lab", "following"] as FeedTab[]).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {isLoading ? (
                    <FeedLoadingSkeleton />
                  ) : displayPosts.length > 0 ? (
                    displayPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No posts yet.</p>
                      <p className="text-sm mt-2">
                        {tab === "following" 
                          ? "Follow some people to see their posts here!" 
                          : tab === "lab"
                          ? "No posts from LaB relay yet."
                          : "Be the first to share something!"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

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
