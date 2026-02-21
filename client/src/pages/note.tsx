import Layout from "@/components/layout";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart, MessageCircle, Zap, Share2, MoreHorizontal, Repeat2, Bookmark,
  ChevronLeft, Copy, ExternalLink,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNDK } from "@/contexts/ndk-context";
import { useNostr } from "@/contexts/nostr-context";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { parseNostrContent, truncateNpub } from "@/lib/nostr-content";
import {
  fetchPrimalThread,
  type PrimalEvent,
  type PrimalProfile,
  type PrimalEventStats,
  type PrimalThreadResult,
} from "@/lib/primal-cache";
import {
  formatSats,
  formatTimestamp,
  RichTextContent,
} from "@/pages/feed";

function formatFullDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " · " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ThreadReplyCard({
  event,
  profiles,
  stats,
  mainEventId,
}: {
  event: PrimalEvent;
  profiles: Map<string, PrimalProfile>;
  stats: Map<string, PrimalEventStats>;
  mainEventId: string;
}) {
  const profile = profiles.get(event.pubkey);
  const eventStats = stats.get(event.id);
  const [isLiked, setIsLiked] = useState(false);
  const [, navigate] = useLocation();

  const replyingToTag = event.tags.find(t => t[0] === "p" && t[1]);
  const replyingToPubkey = replyingToTag?.[1];
  const replyingToProfile = replyingToPubkey ? profiles.get(replyingToPubkey) : null;
  const replyingToName = replyingToProfile?.display_name || replyingToProfile?.name || (replyingToPubkey ? replyingToPubkey.slice(0, 8) + "..." : null);

  const parsed = parseNostrContent(event.content);

  return (
    <div className="py-4 border-b border-gray-100" data-testid={`reply-${event.id}`}>
      <div className="flex gap-3">
        <Link href={`/profile/${event.pubkey}`}>
          <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80">
            {profile?.picture && <AvatarImage src={profile.picture} />}
            <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">
              {(profile?.name || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Link href={`/profile/${event.pubkey}`}>
              <span className="text-sm cursor-pointer hover:underline" style={{ fontFamily: 'Marcellus, serif' }}>
                {profile?.display_name || profile?.name || event.pubkey.slice(0, 8) + "..."}
              </span>
            </Link>
            <span className="text-muted-foreground text-xs truncate max-w-[120px]">
              {profile?.nip05 ? profile.nip05 : truncateNpub(`@${event.pubkey.slice(0, 8)}`)}
            </span>
            <span className="text-muted-foreground text-[11px] shrink-0">· {formatTimestamp(event.created_at)}</span>
            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 hover:bg-[#F0E6FF] shrink-0">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </Button>
          </div>

          {replyingToName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              replying to <span className="text-foreground">@{replyingToName}</span>
            </p>
          )}

          <div className="mt-1">
            <RichTextContent
              text={parsed.text}
              entities={parsed.entities}
              links={parsed.links}
              primalProfiles={profiles}
            />
            {parsed.images.length > 0 && (
              <div className={`mt-3 gap-2 ${parsed.images.length === 1 ? '' : 'grid grid-cols-2'}`}>
                {parsed.images.map((img, i) => (
                  <div key={i} className="rounded-xs overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-auto object-cover max-h-[300px]" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            )}
            {parsed.videos.length > 0 && (
              <div className="mt-3 space-y-2">
                {parsed.videos.map((vid, i) => (
                  <video key={i} src={vid} controls autoPlay muted loop playsInline className="w-full rounded-xs max-h-[300px]" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-3 pt-2">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs" data-testid={`reply-comment-${event.id}`}>
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              {eventStats?.replies ? <span>{eventStats.replies}</span> : null}
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs" data-testid={`reply-zap-${event.id}`}>
              <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
              {eventStats?.zapAmount ? <span>{formatSats(eventStats.zapAmount)}</span> : null}
            </button>
            <button
              onClick={() => { setIsLiked(!isLiked); }}
              className={`flex items-center gap-1.5 text-xs ${isLiked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid={`reply-like-${event.id}`}
            >
              <Heart className="w-3.5 h-3.5" strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
              {eventStats?.likes ? <span>{eventStats.likes}</span> : null}
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs" data-testid={`reply-repost-${event.id}`}>
              <Repeat2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              {eventStats?.reposts ? <span>{eventStats.reposts}</span> : null}
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs ml-auto" data-testid={`reply-bookmark-${event.id}`}>
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const noteId = params.id || "";
  const { publishSmart, ndk, isConnected: ndkConnected } = useNDK();
  const { profile } = useNostr();

  const [thread, setThread] = useState<PrimalThreadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const loadThread = useCallback(async () => {
    if (!noteId) return;
    setIsLoading(true);
    try {
      const result = await fetchPrimalThread(noteId, {
        userPubkey: profile?.pubkey,
      });
      setThread(result);
    } catch (err) {
      console.error("[Note] Failed to load thread:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, profile?.pubkey]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !ndk || !ndkConnected) {
      if (!ndkConnected) toast.error("Not connected to Nostr");
      return;
    }
    setIsReplying(true);
    try {
      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = replyText;

      const rootTag = thread?.mainEvent?.tags.find(t => t[0] === "e" && t[3] === "root");
      const rootId = rootTag ? rootTag[1] : noteId;

      event.tags = [];
      if (rootId !== noteId) {
        event.tags.push(["e", rootId, "", "root"]);
      }
      event.tags.push(["e", noteId, "", rootId === noteId ? "root" : "reply"]);
      if (thread?.mainEvent?.pubkey) {
        event.tags.push(["p", thread.mainEvent.pubkey]);
      }
      await publishSmart(event, true);
      toast.success("Reply posted!");
      setReplyText("");
      setTimeout(loadThread, 1500);
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setIsReplying(false);
    }
  };

  const mainEvent = thread?.mainEvent;
  const mainProfile = mainEvent ? thread?.profiles.get(mainEvent.pubkey) : null;
  const mainStats = mainEvent ? thread?.stats.get(mainEvent.id) : null;

  const peopleInNote = new Map<string, PrimalProfile>();
  if (thread) {
    if (mainEvent) {
      const p = thread.profiles.get(mainEvent.pubkey);
      if (p) peopleInNote.set(mainEvent.pubkey, p);
    }
    for (const reply of thread.replies) {
      const p = thread.profiles.get(reply.pubkey);
      if (p) peopleInNote.set(reply.pubkey, p);
    }
  }

  const replyingPeople = new Map<string, PrimalProfile>();
  if (thread) {
    for (const reply of thread.replies) {
      const p = thread.profiles.get(reply.pubkey);
      if (p && reply.pubkey !== mainEvent?.pubkey) {
        replyingPeople.set(reply.pubkey, p);
      }
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
          <div className="max-w-[940px] mx-auto p-4 md:p-6">
            <div className="flex gap-4">
              <div className="flex-1 min-w-0 max-w-[656px]">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => navigate(-1 as any)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <h1 className="text-lg font-[Marcellus]" data-testid="text-thread-title">Thread</h1>
                </div>
                <Card className="p-5">
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </Card>
                <div className="mt-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 py-4 border-b border-gray-100">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!mainEvent) {
    return (
      <Layout>
        <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
          <div className="max-w-[940px] mx-auto p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate(-1 as any)} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <h1 className="text-lg font-[Marcellus]">Thread</h1>
            </div>
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Note not found</p>
              <p className="text-sm text-muted-foreground mt-2">This note may have been deleted or is unavailable.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/people")}>
                Back to Feed
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const parsed = parseNostrContent(mainEvent.content);

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-[940px] mx-auto p-4 md:p-6">
          <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-[656px]">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => window.history.length > 1 ? navigate(-1 as any) : navigate("/people")}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <h1 className="text-lg font-[Marcellus]" data-testid="text-thread-title">Thread</h1>
              </div>

              {thread?.parentEvents && thread.parentEvents.length > 0 && (
                <div className="mb-4 border-b border-gray-200 pb-4">
                  {thread.parentEvents.map(parentEvent => {
                    const parentProfile = thread.profiles.get(parentEvent.pubkey);
                    const parentParsed = parseNostrContent(parentEvent.content);
                    return (
                      <Link key={parentEvent.id} href={`/note/${parentEvent.id}`}>
                        <div className="flex gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2">
                          <div className="flex flex-col items-center">
                            <Avatar className="w-10 h-10">
                              {parentProfile?.picture && <AvatarImage src={parentProfile.picture} />}
                              <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">
                                {(parentProfile?.name || "?").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm" style={{ fontFamily: 'Marcellus, serif' }}>
                                {parentProfile?.display_name || parentProfile?.name || parentEvent.pubkey.slice(0, 8) + "..."}
                              </span>
                              <span className="text-muted-foreground text-xs">{formatTimestamp(parentEvent.created_at)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{parentParsed.text.replace(/nostr:\S+/g, '').replace(/https?:\/\/\S+/g, '').trim()}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div data-testid="main-note">
                <div className="flex items-start gap-3 mb-4">
                  <Link href={`/profile/${mainEvent.pubkey}`}>
                    <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80">
                      {mainProfile?.picture && <AvatarImage src={mainProfile.picture} />}
                      <AvatarFallback className="bg-gray-100 text-muted-foreground text-sm">
                        {(mainProfile?.name || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${mainEvent.pubkey}`}>
                      <p className="text-base cursor-pointer hover:underline" style={{ fontFamily: 'Marcellus, serif' }} data-testid="text-main-author">
                        {mainProfile?.display_name || mainProfile?.name || mainEvent.pubkey.slice(0, 8) + "..."}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground" data-testid="text-main-handle">
                      {mainProfile?.nip05 || truncateNpub(`@${mainEvent.pubkey.slice(0, 8)}`)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F0E6FF]">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </Button>
                </div>

                <div className="text-[15px] leading-relaxed mb-4" data-testid="text-main-content">
                  <RichTextContent
                    text={parsed.text}
                    entities={parsed.entities}
                    links={parsed.links}
                    primalProfiles={thread?.profiles}
                  />
                  {parsed.images.length > 0 && (
                    <div className={`mt-4 gap-2 ${parsed.images.length === 1 ? '' : 'grid grid-cols-2'}`}>
                      {parsed.images.map((img, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-border">
                          <img src={img} alt="" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {parsed.videos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {parsed.videos.map((vid, i) => (
                        <video key={i} src={vid} controls autoPlay muted loop playsInline className="w-full rounded-lg max-h-[500px]" />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4" data-testid="text-main-date">
                  {formatFullDate(mainEvent.created_at)}
                  {mainStats && (mainStats.replies > 0 || mainStats.likes > 0 || mainStats.zaps > 0) && (
                    <span> · {[
                      mainStats.replies > 0 ? `${mainStats.replies} Reactions` : null,
                    ].filter(Boolean).join(" · ")}</span>
                  )}
                </p>

                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100" data-testid="main-note-actions">
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm" data-testid="action-comments">
                    <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span>{mainStats?.replies || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm" data-testid="action-zaps">
                    <Zap className="w-4 h-4" strokeWidth={1.5} />
                    <span>{mainStats?.zapAmount ? formatSats(mainStats.zapAmount) : 0}</span>
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-1.5 text-sm ${isLiked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    data-testid="action-likes"
                  >
                    <Heart className="w-4 h-4" strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
                    <span>{mainStats?.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm" data-testid="action-reposts">
                    <Repeat2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>{mainStats?.reposts || 0}</span>
                  </button>
                  <button
                    onClick={() => { setIsBookmarked(!isBookmarked); toast(isBookmarked ? "Removed" : "Bookmarked!"); }}
                    className={`flex items-center gap-1.5 text-sm ${isBookmarked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    data-testid="action-bookmark"
                  >
                    <Bookmark className="w-4 h-4" strokeWidth={1.5} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="py-4 border-b border-gray-100" data-testid="reply-composer">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      {profile?.picture ? <AvatarImage src={profile.picture} /> : null}
                      <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`reply to ${mainProfile?.display_name || mainProfile?.name || "..."}`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[44px] text-sm resize-none border-0 shadow-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                        data-testid="textarea-thread-reply"
                      />
                    </div>
                  </div>
                  {replyText.trim() && (
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitReply}
                        disabled={isReplying || !replyText.trim()}
                        className="text-xs"
                        data-testid="button-submit-thread-reply"
                      >
                        {isReplying ? "Posting..." : "Reply"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div data-testid="replies-section">
                {thread?.replies && thread.replies.length > 0 ? (
                  thread.replies.map(reply => (
                    <ThreadReplyCard
                      key={reply.id}
                      event={reply}
                      profiles={thread.profiles}
                      stats={thread.stats}
                      mainEventId={noteId}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No replies yet</p>
                    <p className="text-xs mt-1">Be the first to reply!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:block w-[280px] shrink-0">
              <div className="sticky top-6 space-y-6">
                {mainProfile && (
                  <div data-testid="sidebar-people-in-note">
                    <h3 className="text-sm font-[Marcellus] text-foreground mb-3 uppercase tracking-wide">People in this Note</h3>
                    <Link href={`/profile/${mainEvent.pubkey}`}>
                      <div className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2">
                        <Avatar className="w-10 h-10">
                          {mainProfile.picture && <AvatarImage src={mainProfile.picture} />}
                          <AvatarFallback className="bg-gray-100 text-muted-foreground text-xs">
                            {(mainProfile.name || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ fontFamily: 'Marcellus, serif' }}>
                            {mainProfile.display_name || mainProfile.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {mainProfile.nip05 || `@${mainEvent.pubkey.slice(0, 8)}`}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {mainProfile.about && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 px-2">{mainProfile.about}</p>
                    )}
                  </div>
                )}

                {replyingPeople.size > 0 && (
                  <div className="border-t border-gray-100 pt-4" data-testid="sidebar-replying-to-note">
                    <h3 className="text-sm font-[Marcellus] text-foreground mb-3 uppercase tracking-wide">Replying to this Note</h3>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(replyingPeople.entries()).slice(0, 12).map(([pubkey, p]) => (
                        <Link key={pubkey} href={`/profile/${pubkey}`}>
                          <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 border-2 border-white" title={p.display_name || p.name || pubkey.slice(0, 8)}>
                            {p.picture && <AvatarImage src={p.picture} />}
                            <AvatarFallback className="bg-gray-100 text-muted-foreground text-[8px]">
                              {(p.name || "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      ))}
                    </div>
                    {replyingPeople.size > 12 && (
                      <p className="text-xs text-muted-foreground mt-2">+{replyingPeople.size - 12} more</p>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="button-share-note">
                        <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Share this note
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/note/${noteId}`);
                          toast.success("Link copied!");
                        }}
                        data-testid="button-copy-note-link"
                      >
                        <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.open(`https://primal.net/e/${noteId}`, "_blank");
                        }}
                        data-testid="button-view-on-primal"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        View on Primal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
