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
  Calendar,
  MapPin,
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

  const user = isOwnProfile ? {
    id: currentUserId || "guest",
    name: displayName,
    handle: displayName.toLowerCase().replace(/\s+/g, '-'),
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">

        {!isOwnProfile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/people" className="hover:text-primary">People</Link>
            <span>/</span>
            <span>{user.name}'s Profile</span>
          </div>
        )}

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" data-testid="img-avatar" />
            ) : (
              <span className="text-3xl font-normal text-muted-foreground">{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-serif font-normal text-foreground" data-testid="text-display-name">{user.name}</h1>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditDialog}
                  className="gap-1.5"
                  data-testid="button-edit-profile"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-handle">@{user.handle}</p>

            {nostrProfile?.nip05 && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-nip05">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                <span>{nostrProfile.nip05}</span>
              </div>
            )}
            {nostrProfile?.lud16 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-lightning">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span>{nostrProfile.lud16}</span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm">
              <button className="flex items-center gap-1 hover:underline" data-testid="text-following-count">
                <span className="font-normal text-foreground">{nostrProfile?.following_count || 0}</span>
                <span className="text-muted-foreground">Following</span>
              </button>
              <button className="flex items-center gap-1 hover:underline" data-testid="text-followers-count">
                <span className="font-normal text-foreground">{nostrProfile?.followers_count || 0}</span>
                <span className="text-muted-foreground">Followers</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              {nostrProfile?.location && (
                <div className="flex items-center gap-1" data-testid="text-location">
                  <MapPin className="w-3 h-3" />
                  <span>{nostrProfile.location}</span>
                </div>
              )}
              {publicProfile?.createdAt && (
                <div className="flex items-center gap-1" data-testid="text-joined">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(publicProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {aboutText && (
          <Card className="rounded-xs border-none shadow-sm" data-testid="card-about">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 whitespace-pre-line">{aboutText}</p>
            </CardContent>
          </Card>
        )}

        {lookingForBuddy && (
          <Card className="rounded-xs border-none shadow-sm bg-purple-50/50" data-testid="card-buddy">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">Looking for an accountability buddy</span>
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

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-normal text-muted-foreground">Published Content</h2>
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

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Edit Profile</DialogTitle>
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
