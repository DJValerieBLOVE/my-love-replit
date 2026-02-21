import Layout from "@/components/layout";
import { useState } from "react";
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
  Pencil,
  Lock,
  Zap,
  MoreHorizontal,
  QrCode,
  Mail,
  LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Experiment, Course, Community } from "@shared/schema";

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
      <Card className="rounded-xs hover:shadow-md transition-all cursor-pointer group" data-testid={`card-${type}-${title}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-normal text-sm truncate">{title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description || "No description"}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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

  const ownExperimentsList = (ownExperiments as Experiment[]).filter(e => e.isPublished);
  const ownCoursesList = (ownCourses as Course[]).filter(c => c.isPublished);
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
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
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
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-background pb-2">
          <div className="w-full h-[200px] overflow-hidden bg-muted" data-testid="profile-banner">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt="Profile banner"
                className="w-full h-[200px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-400/30 via-pink-400/20 to-orange-400/30" />
            )}
          </div>

          <div className="absolute top-[140px] left-[14px] z-10" data-testid="profile-avatar-wrapper">
            <div className="w-[120px] h-[120px] rounded-full border-4 border-background overflow-hidden bg-muted">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  data-testid="img-avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-4xl font-normal text-muted-foreground">{user.name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-3 pr-3 pb-5" data-testid="profile-actions">
            <button
              className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
              data-testid="button-context-menu"
              title="More options"
            >
              <MoreHorizontal className="w-[18px] h-[18px] text-foreground" />
            </button>
            <button
              className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
              data-testid="button-qr-code"
              title="QR Code"
            >
              <QrCode className="w-[16px] h-[16px] text-foreground" />
            </button>
            <button
              className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
              data-testid="button-message"
              title="Message"
            >
              <Mail className="w-[18px] h-[18px] text-foreground" />
            </button>
            {isOwnProfile && (
              <button
                onClick={openEditDialog}
                className="h-10 px-4 rounded-md text-sm font-bold text-foreground border border-transparent"
                style={{
                  background: 'linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, #bc1888, #e1306c, #f77737, #fcaf45, #ffdc80) border-box',
                }}
                data-testid="button-edit-profile"
              >
                edit profile
              </button>
            )}
          </div>

          <div className="px-5 pt-2" data-testid="profile-card">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1" data-testid="profile-name-row">
                  <h1 className="text-xl font-bold text-foreground truncate max-w-[250px]" data-testid="text-display-name">
                    {displayName}
                  </h1>
                  {nostrProfile?.nip05 && (
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                  )}
                  {isPaidMember && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white shrink-0" data-testid="badge-premium">
                      Premium
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="profile-verification-row">
                  {nostrProfile?.nip05 && (
                    <span className="truncate max-w-[400px]" data-testid="text-nip05">{nostrProfile.nip05}</span>
                  )}
                </div>

                {aboutText && (
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-line max-w-lg" data-testid="text-about">
                    {aboutText}
                  </div>
                )}

                {nostrProfile?.website && (
                  <div className="flex items-center gap-1 text-sm" data-testid="profile-website">
                    <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a
                      href={rectifyUrl(nostrProfile.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[350px]"
                    >
                      {nostrProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {nostrProfile?.lud16 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-lightning">
                    <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="truncate">{nostrProfile.lud16}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                <div className="flex items-center gap-3" data-testid="profile-follow-stats">
                  <button className="flex items-center gap-1 hover:opacity-80 transition-opacity" data-testid="text-following-count">
                    <span className="text-sm font-semibold text-foreground">{formatNumber(nostrProfile?.following_count || 0)}</span>
                    <span className="text-sm text-muted-foreground">following</span>
                  </button>
                  <button className="flex items-center gap-1 hover:opacity-80 transition-opacity" data-testid="text-followers-count">
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
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-copy-npub"
                  >
                    <span className="truncate max-w-[180px] text-xs font-mono">
                      {profile.npub.substring(0, 12)}...{profile.npub.substring(profile.npub.length - 8)}
                    </span>
                    {copiedNpub ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0 mx-5 mt-4 py-3 border-t border-border" data-testid="profile-stats-bar">
            {[
              { value: nostrProfile?.note_count || 0, label: 'notes' },
              { value: nostrProfile?.reply_count || 0, label: 'replies' },
              { value: nostrProfile?.long_form_note_count || 0, label: 'reads' },
              { value: nostrProfile?.media_count || 0, label: 'media' },
              { value: nostrProfile?.total_zap_count || 0, label: 'zaps' },
              { value: nostrProfile?.relay_count || 0, label: 'relays' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline mr-7" data-testid={`stat-${stat.label}`}>
                <span className="text-3xl font-light text-foreground">{formatNumber(stat.value)}</span>
                <span className="text-base text-muted-foreground ml-2 lowercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-8 space-y-6 mt-4">
          {lookingForBuddy && (
            <Card className="rounded-lg border shadow-sm bg-purple-50/50 dark:bg-purple-950/20" data-testid="card-buddy">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Looking for an accountability buddy</span>
                </div>
                {buddyDesc && <p className="text-sm text-muted-foreground">{buddyDesc}</p>}
                {buddyInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {buddyInterests.map((interest: string) => (
                      <span key={interest} className="text-xs px-2.5 py-0.5 rounded-md border border-border bg-background text-muted-foreground">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Published Content</h2>
              {isOwnProfile && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/creator")} data-testid="button-go-creator">
                  Creator Dashboard
                </Button>
              )}
            </div>

            {content.experiments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" /> Experiments ({stats.experimentsCount})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.experiments.map((exp) => (
                    <ContentCard key={exp.id} title={exp.title} description={exp.description} type="experiment" href={`/experiments/${exp.id}`} />
                  ))}
                </div>
              </div>
            )}

            {content.courses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Courses ({stats.coursesCount})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.courses.map((course) => (
                    <ContentCard key={course.id} title={course.title} description={course.description} type="course" href={`/experiments/course/${course.id}`} />
                  ))}
                </div>
              </div>
            )}

            {content.communities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" /> Communities ({stats.communitiesCount})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.communities.map((community) => (
                    <ContentCard key={community.id} title={community.name} description={community.description} type="community" href={`/community/${community.id}`} />
                  ))}
                </div>
              </div>
            )}

            {content.experiments.length === 0 && content.courses.length === 0 && content.communities.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <p className="text-muted-foreground">{isOwnProfile ? "You haven't published any content yet." : "This user hasn't published any content yet."}</p>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
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
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveProfile} disabled={profileMutation.isPending} data-testid="button-save-profile">
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
