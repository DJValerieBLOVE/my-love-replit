import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  Clock, 
  Heart, 
  MoreHorizontal, 
  Video, 
  ArrowRight,
  Calendar as CalendarIcon,
  Zap,
  MessageSquare,
  Repeat2,
  Share2,
  Bookmark,
  Minus,
  Plus,
  Quote,
  Users,
  Copy,
  ExternalLink,
  AlertCircle,
  Lock,
  Globe,
  Send,
  Image as ImageIcon,
  X,
  Smile
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SatsIcon from "@assets/generated_images/sats_icon.png";
import { toast } from "sonner";
import { isGroupContent, canSharePublicly, getGroupName, type ShareablePost } from "@/lib/sharing-rules";
import { parseNostrContent, truncateNpub } from "@/lib/nostr-content";
import { useNostr } from "@/contexts/nostr-context";
import { useNDK } from "@/contexts/ndk-context";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { zapPost } from "@/lib/api";
import { loadNWCConnection, zapViaLightning } from "@/lib/nwc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GifPicker } from "@/components/gif-picker";

interface FeedPostProps {
  post: {
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
    image?: string;
    likes: number;
    comments: number;
    zaps: number;
    timestamp: string;
    source?: "nostr" | "community" | "learning";
    relaySource?: "private" | "public";
    community?: string;
    isOwnPost?: boolean;
  };
}

const SHORT_NOTE_CHARS = 500;
const SHORT_NOTE_WORDS = 100;

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

export function FeedPost({ post }: FeedPostProps) {
  const { isConnected, profile } = useNostr();
  const { publishSmart, ndk } = useNDK();
  const [, navigate] = useLocation();
  const [zaps, setZaps] = useState(post.zaps);
  const [isZapped, setIsZapped] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [zapAmount, setZapAmount] = useState(21);
  const [zapInputValue, setZapInputValue] = useState("21");
  const [zapComment, setZapComment] = useState("");
  const [isZapOpen, setIsZapOpen] = useState(false);
  const [isZapping, setIsZapping] = useState(false);
  const [editingPresets, setEditingPresets] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [quoteRepostOpen, setQuoteRepostOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteImage, setQuoteImage] = useState<string | null>(null);
  const [showQuoteGifPicker, setShowQuoteGifPicker] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [showReplyGifPicker, setShowReplyGifPicker] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const quoteFileRef = useRef<HTMLInputElement>(null);

  const isGroupPost = isGroupContent(post);
  const canRepostPublic = canSharePublicly(post);
  const groupName = getGroupName(post);

  const handleImageUpload = async (file: File, setter: (url: string | null) => void) => {
    try {
      const { uploadMedia } = await import("@/lib/media-upload");
      const url = await uploadMedia(file, ndk);
      setter(url);
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleRepostPublic = async () => {
    if (!canRepostPublic) {
      toast.error("Cannot share publicly", {
        description: "Group posts can only be shared within the group",
      });
      return;
    }
    if (!post.eventId || !post.author.pubkey) {
      toast.error("Cannot interact with this post", {
        description: "Missing event or author information",
      });
      return;
    }
    setIsReposted(true);
    try {
      const event = new NDKEvent(ndk!);
      event.kind = 6;
      event.content = "";
      event.tags = [
        ["e", post.eventId, "", "mention"],
        ["p", post.author.pubkey],
      ];
      await publishSmart(event, true);
      toast("Reposted to Nostr!", {
        description: `You reposted ${post.author.name}'s post publicly`,
      });
    } catch (error: any) {
      setIsReposted(false);
      toast.error("Failed to repost", {
        description: error.message || "Please try again",
      });
    }
  };

  const handleRepostGroup = () => {
    if (!isGroupPost) {
      return;
    }
    toast("Reposted within group!", {
      description: `Shared within ${groupName}`,
    });
    setIsReposted(true);
  };

  const handleQuoteRepost = async () => {
    if (!ndk) {
      toast.error("Not connected to Nostr");
      return;
    }
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      const noteRef = `nostr:${post.eventId || post.id}`;
      let content = quoteText ? `${quoteText}\n\n${noteRef}` : noteRef;
      if (quoteImage) {
        content += `\n${quoteImage}`;
      }
      event.content = content;
      event.tags = [
        ["e", post.eventId || post.id, "", "mention"],
        ["p", post.author.pubkey || ""],
      ];
      const isPublic = canRepostPublic;
      await publishSmart(event, isPublic);
      if (!isPublic) {
        toast("Quote shared within group!", {
          description: `Your quote was shared within ${groupName}`,
        });
      } else {
        toast("Quote Posted to Nostr!", {
          description: "Your quote repost was shared publicly",
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
    toast(isBookmarked ? "Removed from bookmarks" : "Bookmarked!", {
      description: isBookmarked 
        ? "Post removed from your saved items" 
        : "Post saved to your bookmarks",
    });
  };

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
      return;
    }
    setIsLiked(true);
    setLikes(prev => prev + 1);
    if (!post.eventId || !post.author.pubkey) {
      return;
    }
    try {
      const event = new NDKEvent(ndk!);
      event.kind = 7;
      event.content = "+";
      event.tags = [
        ["e", post.eventId],
        ["p", post.author.pubkey],
      ];
      await publishSmart(event, true);
    } catch (error: any) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
      toast.error("Failed to like post", {
        description: error.message || "Please try again",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link copied!");
  };

  const handleShareToX = () => {
    const text = encodeURIComponent(post.content.slice(0, 200));
    const url = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareToFacebook = () => {
    const url = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleReply = async () => {
    if (!replyText.trim() && !replyImage) return;
    if (!post.eventId || !post.author.pubkey) {
      toast.error("Cannot interact with this post", {
        description: "Missing event or author information",
      });
      return;
    }
    setIsReplying(true);
    try {
      const event = new NDKEvent(ndk!);
      event.kind = 1;
      let content = replyText.trim();
      if (replyImage) {
        content += (content ? "\n" : "") + replyImage;
      }
      event.content = content;
      event.tags = [
        ["e", post.eventId, "", "reply"],
        ["p", post.author.pubkey],
      ];
      await publishSmart(event, true);
      toast.success("Reply sent!", {
        description: `Your reply to ${post.author.name} was published`,
      });
      setReplyText("");
      setReplyImage(null);
      setShowReplyInput(false);
    } catch (error: any) {
      toast.error("Failed to send reply", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleZap = async () => {
    if (!isConnected) {
      toast.error("Please login to zap posts", {
        description: "Connect your Nostr account to send zaps"
      });
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
          
          toast.success("Lightning Zap Sent!", {
            description: `You sent ${zapAmount} sats to ${post.author.name} via Lightning`,
          });
        } catch (lightningError: any) {
          console.error("Lightning payment failed:", lightningError);
          toast.error("Lightning payment failed", {
            description: lightningError.message || "Recording zap to database instead"
          });
        }
      } else if (!nwcConnection) {
        toast.info("No wallet connected", {
          description: "Connect a Lightning wallet in the Wallet page for real payments"
        });
      } else if (!post.author.lud16) {
        toast.info("Recipient has no Lightning address", {
          description: "Recording zap to community leaderboard only"
        });
      }
      
      if (post.author.id) {
        await zapPost(post.id, post.author.id, zapAmount, zapComment || undefined, paymentHash);
      }
      
      setZaps(prev => prev + zapAmount);
      setIsZapped(true);
      setIsZapOpen(false);
      
      if (!paymentHash && post.author.id) {
        toast.success("Zap Recorded!", {
          description: `${zapAmount} sats recorded for ${post.author.name}`,
        });
      }
      
      setZapComment("");
      setZapAmount(21);
      setZapInputValue("21");
    } catch (error: any) {
      console.error("Zap error:", error);
      toast.error("Failed to record zap", {
        description: error.message || "Please try again"
      });
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
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card mb-4">
      <CardContent className="p-0">
        <div className="p-4 flex gap-3">
          {post.author.pubkey ? (
            <Link href={`/profile/${post.author.pubkey}`} className="shrink-0">
              <Avatar className="w-10 h-10 border-2 border-border cursor-pointer">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="w-10 h-10 border-2 border-border shrink-0">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {post.author.pubkey ? (
                  <Link href={`/profile/${post.author.pubkey}`} className="text-sm truncate max-w-[140px] hover:underline cursor-pointer" style={{ fontFamily: 'Marcellus, serif' }}>
                    {post.author.name}
                  </Link>
                ) : (
                  <h3 className="font-normal text-foreground text-sm truncate max-w-[160px]">
                    {post.author.name}
                  </h3>
                )}
                <span className="text-muted-foreground font-normal text-sm flex items-center gap-1 shrink-0">
                  {post.relaySource === "private" && (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                  {post.relaySource === "public" && (
                    <Globe className="w-3 h-3 text-muted-foreground" />
                  )}
                  {post.timestamp.replace(" ago", "")}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            {(() => {
              const parsed = parseNostrContent(post.content);
              const needsTruncation = !isContentExpanded && shouldTruncateContent(parsed.text);
              const displayText = needsTruncation ? truncateText(parsed.text) : parsed.text;
              return (
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a, button, video, img, [role="button"]')) return;
                    const noteId = post.eventId || post.id;
                    navigate(`/note/${noteId}`);
                  }}
                  data-testid={`link-thread-${post.id}`}
                >
                  <p className="mt-2 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {displayText}
                    {needsTruncation && (
                      <>
                        {"... "}
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsContentExpanded(true); }}
                          className="text-[#6600ff] hover:underline text-base inline"
                          data-testid="button-see-more"
                        >
                          see more
                        </button>
                      </>
                    )}
                  </p>
                  {parsed.images.length > 0 && (
                    <div className={`mt-3 gap-2 ${parsed.images.length === 1 ? '' : 'grid grid-cols-2'}`}>
                      {parsed.images.map((img, i) => (
                        <div key={i} className="rounded-xs overflow-hidden border border-[#E5E5E5]">
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
                        <video key={i} src={vid} controls className="w-full rounded-xs max-h-[400px]" data-testid={`video-post-media-${post.id}-${i}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {post.image && !parseNostrContent(post.content).images.includes(post.image) && (
              <div className="mt-3 rounded-xs overflow-hidden border border-[#E5E5E5]">
                <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border px-2 h-12">
              <Button 
                variant="ghost" 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className={`px-2 gap-1.5 min-w-[60px] text-muted-foreground hover:text-foreground`}
                data-testid={`button-reply-${post.id}`}
              >
                <MessageSquare className={`w-[18px] h-[18px] ${showReplyInput ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} />
                <span className="text-sm font-normal text-muted-foreground">{post.comments > 0 ? post.comments : ""}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`px-2 gap-1.5 min-w-[60px] text-muted-foreground hover:text-foreground`}
                    data-testid={`button-repost-${post.id}`}
                  >
                    <Repeat2 className={`w-[22px] h-[22px] ${isReposted ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} />
                  </Button>
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
                        <p className="text-xs text-muted-foreground">{post.community || "Group members only"}</p>
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

              <Dialog open={quoteRepostOpen} onOpenChange={(open) => {
                setQuoteRepostOpen(open);
                if (!open) { setShowQuoteGifPicker(false); setQuoteImage(null); }
              }}>
                <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Quote Repost</DialogTitle>
                    <DialogDescription>
                      {isGroupPost && !post.isOwnPost 
                        ? `Add your thoughts - will be shared within ${post.community || "the group"} only`
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
                    <Card className="p-3 bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-normal truncate">{post.author.name}</span>
                      </div>
                      <p className="text-sm mt-2 line-clamp-3 break-words">{post.content}</p>
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
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`px-2 rounded-full transition-all group min-w-[60px] text-muted-foreground hover:text-foreground`}
                  >
                    <Zap 
                      className={`mr-1.5 transition-all ${isZapped ? 'text-[#6600ff]' : ''} w-[22px] h-[22px] group-hover:scale-110`} 
                      strokeWidth={1.5}
                      fill={isZapped ? "#6600ff" : "none"}
                    />
                    <span className="text-sm font-normal text-muted-foreground">
                      {zaps > 0 ? zaps.toLocaleString() : ""}
                    </span>
                  </Button>
                </DialogTrigger>
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
                        >
                          customize amounts
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="custom-amount" className="text-sm text-muted-foreground">Custom Amount (Sats)</Label>
                      <div className="relative">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <Input 
                          id="custom-amount" 
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
                      <Label htmlFor="zap-comment" className="text-sm text-muted-foreground">Comment (Optional)</Label>
                      <Input 
                        id="zap-comment" 
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

              <Button 
                variant="ghost" 
                onClick={handleLike}
                className={`px-2 gap-1.5 min-w-[60px] text-muted-foreground hover:text-foreground`}
                data-testid={`button-like-${post.id}`}
              >
                <Heart className={`w-[18px] h-[18px] ${isLiked ? 'text-[#eb00a8]' : ''}`} strokeWidth={1.5} fill={isLiked ? "#eb00a8" : "none"} />
                <span className="text-sm font-normal text-muted-foreground">{likes > 0 ? likes : ""}</span>
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleBookmark}
                className={`px-2 gap-1.5 min-w-[50px] text-muted-foreground hover:text-foreground`}
                data-testid={`button-bookmark-${post.id}`}
              >
                <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'text-[#6600ff]' : ''}`} strokeWidth={1.5} fill={isBookmarked ? "#6600ff" : "none"} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-love-soul hover:bg-love-soul-light px-2 gap-1.5 min-w-[50px]"
                    data-testid={`button-share-${post.id}`}
                  >
                    <Share2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer"
                    data-testid={`button-copy-link-${post.id}`}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  {canRepostPublic && (
                    <>
                      <DropdownMenuItem
                        onClick={handleShareToX}
                        className="cursor-pointer"
                        data-testid={`button-share-x-${post.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Share to X
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleShareToFacebook}
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

            {showReplyInput && (
              <div className="mt-3 pt-3 border-t border-border" data-testid={`reply-input-container-${post.id}`}>
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
                      onClick={() => { setShowReplyInput(false); setReplyText(""); setReplyImage(null); setShowReplyGifPicker(false); }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={isReplying || (!replyText.trim() && !replyImage)}
                      className="shrink-0"
                      data-testid={`button-submit-reply-${post.id}`}
                    >
                      {isReplying ? "Sending..." : "Reply"}
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
      </CardContent>
    </Card>
  );
}
