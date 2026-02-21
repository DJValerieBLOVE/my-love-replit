import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useNostr } from "@/contexts/nostr-context";
import { useNostrProfile } from "@/hooks/use-nostr-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { getPublicProfile, getCreatorExperiments, getCreatorCourses, getCreatorCommunities, updateProfile } from "@/lib/api";
import {
  FlaskConical,
  BookOpen,
  Users,
  Loader2,
  ExternalLink,
  BadgeCheck,
  Lock,
  Zap,
  MoreHorizontal,
  QrCode,
  Mail,
  LinkIcon,
  Copy,
  Check,
  Flame,
  Trophy,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Experiment, Course, Community } from "@shared/schema";
import { fetchPrimalUserFeed } from "@/lib/primal-cache";
import type { PrimalProfile } from "@/lib/primal-cache";
import { PostCard, primalEventToFeedPost, type FeedPost } from "@/pages/feed";

const LAB_INTEREST_OPTIONS = [
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

type ProfileTab = "notes" | "replies" | "reads" | "media" | "zaps" | "relays" | "lab";

interface PublicProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  nip05: string | null;
  level: string;
  sats: number;
  streak: number;
  badges: string[] | null;
  satsGiven: number;
  satsReceived: number;
  lookingForBuddy: boolean | null;
  buddyDescription: string | null;
  labInterests: string[] | null;
  createdAt: string | null;
  content: {
    experiments: Experiment[];
    courses: Course[];
    communities: Community[];
  };
  stats: {
    experimentsCount: number;
    coursesCount: number;
    communitiesCount: number;
  };
}

function ContentCard({
  title,
  description,
  type,
  href
}: {
  title: string;
  description: string | null;
  type: "experiment" | "course" | "community";
  href: string;
}) {
  const icons = { experiment: FlaskConical, course: BookOpen, community: Users };
  const Icon = icons[type];

  return (
    <Link href={href}>
      <Card className="rounded-xs hover:shadow-md transition-all cursor-pointer group border-none shadow-sm" data-testid={`card-${type}-${title}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-normal text-sm truncate">{title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description || "No description"}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}

function formatJoinedDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Joined Nostr on ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const [, setLocation] = useLocation();
  const { profile, userStats } = useNostr();
  const { nostrProfile } = useNostrProfile(profile?.pubkey);
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBuddyDesc, setEditBuddyDesc] = useState("");
  const [editLookingForBuddy, setEditLookingForBuddy] = useState(false);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [copiedNpub, setCopiedNpub] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("notes");
  const [userNotes, setUserNotes] = useState<FeedPost[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesProfiles, setNotesProfiles] = useState<Map<string, PrimalProfile>>(new Map());

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update profile", { description: err.message });
    },
  });

  const currentUserId = profile?.userId;
  const isOwnProfile = !params.userId || params.userId === currentUserId;
  const targetUserId = params.userId || currentUserId;
  const isPaidMember = userStats?.tier && userStats.tier !== "free";

  useEffect(() => {
    if (profile?.pubkey && (activeTab === "notes" || activeTab === "replies")) {
      loadUserNotes();
    }
  }, [profile?.pubkey, activeTab]);

  const loadUserNotes = async () => {
    if (!profile?.pubkey) return;
    setNotesLoading(true);
    try {
      const result = await fetchPrimalUserFeed(profile.pubkey, { limit: 20, skipCache: true });
      const posts = result.events
        .filter(e => {
          if (activeTab === "replies") return e.tags?.some((t: string[]) => t[0] === "e");
          return !e.tags?.some((t: string[]) => t[0] === "e" && t[3] === "reply");
        })
        .map(e => primalEventToFeedPost(e, result.profiles, profile.pubkey, "public", result.stats, result.zapReceipts));
      setUserNotes(posts);
      setNotesProfiles(result.profiles);
    } catch (err) {
      console.error("[Profile] Error loading notes:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  const openEditDialog = () => {
    setEditName(profile?.name || "");
    setEditBuddyDesc(profile?.buddyDescription || "");
    setEditLookingForBuddy(profile?.lookingForBuddy || false);
    setEditInterests(profile?.labInterests || []);
    setEditOpen(true);
  };

  const handleSaveProfile = () => {
    profileMutation.mutate({
      name: editName,
      lookingForBuddy: editLookingForBuddy,
      buddyDescription: editBuddyDesc,
      labInterests: editInterests,
    });
  };

  const toggleInterest = (interest: string) => {
    setEditInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const copyNpub = () => {
    if (profile?.npub) {
      navigator.clipboard.writeText(profile.npub);
      setCopiedNpub(true);
      toast.success("Public key copied!");
      setTimeout(() => setCopiedNpub(false), 2000);
    }
  };

  const { data: publicProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: () => getPublicProfile(targetUserId!),
    enabled: !!targetUserId && !isOwnProfile,
  });

  const { data: ownExperiments = [] } = useQuery({
    queryKey: ["creator", "experiments"],
    queryFn: getCreatorExperiments,
    enabled: isOwnProfile && !!currentUserId,
  });

  const { data: ownCourses = [] } = useQuery({
    queryKey: ["creator", "courses"],
    queryFn: getCreatorCourses,
    enabled: isOwnProfile && !!currentUserId,
  });

  const { data: ownCommunities = [] } = useQuery({
    queryKey: ["creator", "communities"],
    queryFn: getCreatorCommunities,
    enabled: isOwnProfile && !!currentUserId,
  });

  const displayName = nostrProfile?.display_name || nostrProfile?.name || profile?.name || "Guest";
  const displayPicture = nostrProfile?.picture || profile?.picture || "";
  const aboutText = nostrProfile?.about || "";
  const bannerImage = nostrProfile?.banner || "";

  const user = isOwnProfile ? {
    id: currentUserId || "guest",
    name: displayName,
    handle: nostrProfile?.name || displayName.toLowerCase().replace(/\s+/g, '-'),
    avatar: displayPicture,
  } : publicProfile ? {
    id: publicProfile.id,
    name: publicProfile.name,
    handle: publicProfile.handle,
    avatar: publicProfile.avatar || "",
  } : null;

  const ownExperimentsList = (ownExperiments as Experiment[]).filter((e: Experiment) => e.isPublished);
  const ownCoursesList = (ownCourses as Course[]).filter((c: Course) => c.isPublished);
  const ownCommunitiesList = ownCommunities as Community[];

  const content = isOwnProfile ? {
    experiments: ownExperimentsList,
    courses: ownCoursesList,
    communities: ownCommunitiesList,
  } : publicProfile?.content || { experiments: [], courses: [], communities: [] };

  const stats = isOwnProfile ? {
    experimentsCount: ownExperimentsList.length,
    coursesCount: ownCoursesList.length,
    communitiesCount: ownCommunitiesList.length,
  } : publicProfile?.stats || { experimentsCount: 0, coursesCount: 0, communitiesCount: 0 };

  if (!isOwnProfile && profileLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isOwnProfile && !user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">User not found.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">Go Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4" data-testid="text-login-prompt">Please log in to view your profile.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">Go Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const buddyInterests = isOwnProfile ? (profile?.labInterests || []) : (publicProfile?.labInterests || []);
  const lookingForBuddy = isOwnProfile ? profile?.lookingForBuddy : publicProfile?.lookingForBuddy;
  const buddyDesc = isOwnProfile ? profile?.buddyDescription : publicProfile?.buddyDescription;

  const rectifyUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  };

  const statTabs: { key: ProfileTab; value: number; label: string }[] = [
    { key: "notes", value: nostrProfile?.note_count || 0, label: "notes" },
    { key: "replies", value: nostrProfile?.reply_count || 0, label: "replies" },
    { key: "reads", value: nostrProfile?.long_form_note_count || 0, label: "reads" },
    { key: "media", value: nostrProfile?.media_count || 0, label: "media" },
    { key: "zaps", value: nostrProfile?.total_zap_count || 0, label: "zaps" },
    { key: "relays", value: nostrProfile?.relay_count || 0, label: "relays" },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="relative bg-background pb-2">
          <div className="w-full h-[180px] overflow-hidden bg-muted rounded-b-lg" data-testid="profile-banner">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt="Profile banner"
                className="w-full h-[180px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6600ff]/20 via-[#eb00a8]/15 to-[#6600ff]/10" />
            )}
          </div>

          <div className="absolute top-[120px] left-5 z-10" data-testid="profile-avatar-wrapper">
            <div className="w-[100px] h-[100px] rounded-full border-4 border-background overflow-hidden bg-muted shadow-md">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  data-testid="img-avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-3xl text-muted-foreground">{user.name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-3 pr-5 pb-4" data-testid="profile-actions">
            <button
              className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center hover:bg-[#F0E6FF] transition-colors"
              data-testid="button-context-menu"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
            <button
              className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center hover:bg-[#F0E6FF] transition-colors"
              data-testid="button-qr-code"
              title="QR Code"
            >
              <QrCode className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
            <button
              className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center hover:bg-[#F0E6FF] transition-colors"
              data-testid="button-message"
              title="Message"
            >
              <Mail className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
            {isOwnProfile && (
              <button
                onClick={openEditDialog}
                className="h-9 px-4 rounded-md text-sm font-normal bg-foreground text-background hover:bg-foreground/90 transition-colors"
                data-testid="button-edit-profile"
              >
                edit profile
              </button>
            )}
          </div>

          <div className="px-5 pt-1" data-testid="profile-card">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap" data-testid="profile-name-row">
                  <h1 className="text-xl font-normal text-foreground truncate max-w-[280px]" data-testid="text-display-name">
                    {displayName}
                  </h1>
                  {nostrProfile?.nip05 && (
                    <BadgeCheck className="w-[18px] h-[18px] text-[#6600ff] shrink-0" />
                  )}
                  {isPaidMember && (
                    <span className="px-2.5 py-0.5 text-xs font-normal rounded-full bg-[#6600ff] text-white shrink-0" data-testid="badge-premium">
                      11x LaB
                    </span>
                  )}
                </div>

                {nostrProfile?.nip05 && (
                  <p className="text-sm text-muted-foreground truncate" data-testid="text-nip05">{nostrProfile.nip05}</p>
                )}

                {aboutText && (
                  <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mt-2" data-testid="text-about">
                    {aboutText}
                  </div>
                )}

                {nostrProfile?.website && (
                  <div className="flex items-center gap-1.5 text-sm mt-1" data-testid="profile-website">
                    <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <a
                      href={rectifyUrl(nostrProfile.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6600ff] hover:underline truncate"
                    >
                      {nostrProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {nostrProfile?.lud16 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="text-lightning">
                    <Zap className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{nostrProfile.lud16}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                <div className="flex items-center gap-2" data-testid="profile-follow-stats">
                  <button className="flex items-center gap-1 hover:opacity-70 transition-opacity" data-testid="text-following-count">
                    <span className="text-sm font-semibold text-foreground">{formatNumber(nostrProfile?.following_count || 0)}</span>
                    <span className="text-sm text-muted-foreground">following</span>
                  </button>
                  <button className="flex items-center gap-1 hover:opacity-70 transition-opacity" data-testid="text-followers-count">
                    <span className="text-sm font-semibold text-foreground">{formatNumber(nostrProfile?.followers_count || 0)}</span>
                    <span className="text-sm text-muted-foreground">followers</span>
                  </button>
                </div>

                {nostrProfile?.time_joined ? (
                  <span className="text-sm text-muted-foreground" data-testid="text-joined">
                    {formatJoinedDate(nostrProfile.time_joined)}
                  </span>
                ) : null}

                {profile?.npub && (
                  <button
                    onClick={copyNpub}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-copy-npub"
                  >
                    <span className="truncate max-w-[160px] text-xs font-mono">
                      {profile.npub.substring(0, 12)}...{profile.npub.substring(profile.npub.length - 8)}
                    </span>
                    {copiedNpub ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center mx-5 mt-4 py-2.5 border-t border-border overflow-x-auto" data-testid="profile-stats-bar">
            {statTabs.map((stat) => (
              <button
                key={stat.label}
                onClick={() => setActiveTab(stat.key)}
                className={cn(
                  "flex items-baseline mr-5 cursor-pointer transition-opacity hover:opacity-70 shrink-0",
                  activeTab === stat.key ? "opacity-100" : "opacity-60"
                )}
                data-testid={`stat-${stat.label}`}
              >
                <span className={cn(
                  "text-lg font-normal text-foreground",
                  activeTab === stat.key && "text-[#6600ff]"
                )}>
                  {formatNumber(stat.value)}
                </span>
                <span className={cn(
                  "text-sm text-muted-foreground ml-1.5",
                  activeTab === stat.key && "text-[#6600ff]"
                )}>
                  {stat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-8 mt-2">
          {(activeTab === "notes" || activeTab === "replies") && (
            <div className="space-y-0" data-testid="profile-notes-feed">
              {notesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : userNotes.length > 0 ? (
                <div className="divide-y divide-border">
                  {userNotes.map((post) => (
                    <div key={post.id} className="py-0">
                      <PostCard post={post} primalProfiles={notesProfiles} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "notes" ? "No notes yet" : "No replies yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reads" && (
            <div className="text-center py-12">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Long-form articles will appear here</p>
            </div>
          )}

          {activeTab === "media" && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Media content will appear here</p>
            </div>
          )}

          {activeTab === "zaps" && (
            <div className="text-center py-12">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Zap history will appear here</p>
            </div>
          )}

          {activeTab === "relays" && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Relay connections will appear here</p>
            </div>
          )}

          {activeTab === "lab" && (
            <div className="space-y-6 mt-2">
              {lookingForBuddy && (
                <Card className="rounded-xs border-none shadow-sm" data-testid="card-buddy">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-sm font-normal text-foreground">Looking for an accountability buddy</span>
                    </div>
                    {buddyDesc && <p className="text-sm text-muted-foreground">{buddyDesc}</p>}
                    {buddyInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {buddyInterests.map((interest: string) => (
                          <span key={interest} className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-normal text-foreground">Published Content</h2>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation("/creator")}
                      className="text-muted-foreground hover:bg-[#F0E6FF]"
                      data-testid="button-go-creator"
                    >
                      Creator Dashboard
                    </Button>
                  )}
                </div>

                {content.experiments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" strokeWidth={1.5} /> Experiments ({stats.experimentsCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {content.experiments.map((exp: Experiment) => (
                        <ContentCard key={exp.id} title={exp.title} description={exp.description} type="experiment" href={`/experiments/${exp.id}`} />
                      ))}
                    </div>
                  </div>
                )}

                {content.courses.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4" strokeWidth={1.5} /> Courses ({stats.coursesCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {content.courses.map((course: Course) => (
                        <ContentCard key={course.id} title={course.title} description={course.description} type="course" href={`/experiments/course/${course.id}`} />
                      ))}
                    </div>
                  </div>
                )}

                {content.communities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" strokeWidth={1.5} /> Communities ({stats.communitiesCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {content.communities.map((community: Community) => (
                        <ContentCard key={community.id} title={community.name} description={community.description} type="community" href={`/community/${community.id}`} />
                      ))}
                    </div>
                  </div>
                )}

                {content.experiments.length === 0 && content.courses.length === 0 && content.communities.length === 0 && (
                  <Card className="p-8 text-center border-dashed border-none shadow-sm">
                    <p className="text-muted-foreground text-sm">{isOwnProfile ? "You haven't published any content yet." : "This user hasn't published any content yet."}</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab !== "lab" && (
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setActiveTab("lab")}
                className="flex items-center gap-2 text-sm text-[#6600ff] hover:underline"
                data-testid="button-view-lab-profile"
              >
                <Flame className="w-4 h-4" strokeWidth={1.5} />
                View 11x LOVE LaB Profile
              </button>
            </div>
          )}
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-normal">Edit Profile</DialogTitle>
              <DialogDescription>Update your profile information and preferences</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your display name" data-testid="input-edit-name" />
              </div>

              {aboutText && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">Bio <span className="text-xs text-muted-foreground font-normal">(synced from Nostr)</span></Label>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{aboutText}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-normal text-sm">Looking for an Accountability Buddy</h4>
                    <p className="text-xs text-muted-foreground">Let others know you're open to connecting</p>
                  </div>
                  {isPaidMember ? (
                    <Switch checked={editLookingForBuddy} onCheckedChange={setEditLookingForBuddy} data-testid="switch-looking-buddy" />
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Paid members only
                    </div>
                  )}
                </div>

                {editLookingForBuddy && isPaidMember && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-buddy-desc">What are you looking for?</Label>
                    <Textarea id="edit-buddy-desc" value={editBuddyDesc} onChange={(e) => setEditBuddyDesc(e.target.value)} placeholder="Describe the kind of accountability partner you're looking for..." className="min-h-[80px]" data-testid="textarea-buddy-desc" />
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-normal text-sm">LaB Interests</h4>
                    <p className="text-xs text-muted-foreground">Select your areas of interest for better matching</p>
                  </div>
                  {!isPaidMember && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Paid members only
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {LAB_INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => isPaidMember && toggleInterest(interest)}
                      disabled={!isPaidMember}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-normal transition-colors border",
                        editInterests.includes(interest)
                          ? "bg-foreground text-background border-foreground"
                          : isPaidMember
                          ? "bg-muted hover:bg-[#F0E6FF] border-border text-foreground"
                          : "bg-muted border-border text-muted-foreground opacity-50 cursor-not-allowed"
                      )}
                      data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="hover:bg-[#F0E6FF]">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveProfile} disabled={profileMutation.isPending} className="bg-foreground text-background hover:bg-foreground/90" data-testid="button-save-profile">
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
