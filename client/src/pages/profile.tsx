import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNostr } from "@/contexts/nostr-context";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { getPublicProfile, getDreams, getCreatorExperiments, getCreatorCourses, getCreatorCommunities } from "@/lib/api";
import { 
  Trophy, 
  Zap, 
  Award, 
  Target,
  Crown,
  Flame,
  Gift,
  Package,
  Brain,
  FlaskConical,
  BookOpen,
  Users,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import BitcoinIcon from "../assets/bitcoin_icon.png";
import type { Experiment, Course, Community, Dream } from "@shared/schema";

const LOVE_CODE_AREAS = [
  { id: "god", name: "GOD/LOVE", hex: "#eb00a8" },
  { id: "romance", name: "Romance", hex: "#e60023" },
  { id: "family", name: "Family", hex: "#ff6600" },
  { id: "community", name: "Community", hex: "#ffdf00" },
  { id: "mission", name: "Mission", hex: "#a2f005" },
  { id: "money", name: "Money", hex: "#00d81c" },
  { id: "time", name: "Time", hex: "#00ccff" },
  { id: "environment", name: "Environment", hex: "#0033ff" },
  { id: "body", name: "Body", hex: "#6600ff" },
  { id: "mind", name: "Mind", hex: "#9900ff" },
  { id: "soul", name: "Soul", hex: "#cc00ff" },
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
  const icons = {
    experiment: FlaskConical,
    course: BookOpen,
    community: Users,
  };
  const Icon = icons[type];

  return (
    <Link href={href}>
      <Card className="rounded-xs hover:shadow-md transition-all cursor-pointer group" data-testid={`card-${type}-${title}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-love-body/10 transition-colors">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">{title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description || "No description"}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BadgeDisplay({ badges }: { badges: string[] | null }) {
  const defaultBadges = [
    { id: "zap", emoji: "⚡️", name: "Zap Queen", desc: "Sent 10k Sats", earned: true },
    { id: "early", emoji: "🚀", name: "Early Adopter", desc: "Joined in Beta", earned: true },
    { id: "mission", emoji: "✅", name: "Mission Accomplished", desc: "Completed 1st Mission", earned: true },
  ];

  const userBadges = badges?.map(b => ({
    id: b,
    emoji: "🏆",
    name: b,
    desc: "Achievement unlocked",
    earned: true,
  })) || [];

  const allBadges = [...defaultBadges, ...userBadges];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {allBadges.map((badge) => (
        <div key={badge.id} className="flex flex-col items-center text-center gap-3 group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-200 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
            {badge.emoji}
          </div>
          <div>
            <h4 className="font-bold text-sm">{badge.name}</h4>
            <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
          </div>
        </div>
      ))}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={`locked-${i}`} className="flex flex-col items-center text-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-not-allowed">
          <div className="w-24 h-24 rounded-full bg-muted border-4 border-muted-foreground/20 flex items-center justify-center text-2xl shadow-inner">
            🔒
          </div>
          <div>
            <h4 className="font-bold text-sm text-muted-foreground">Locked Badge</h4>
            <p className="text-[10px] text-muted-foreground">Keep playing to unlock</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const [, setLocation] = useLocation();
  const { profile, userStats } = useNostr();
  
  const currentUserId = profile?.userId;
  const isOwnProfile = !params.userId || params.userId === currentUserId;
  const targetUserId = params.userId || currentUserId;

  const { data: publicProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: () => getPublicProfile(targetUserId!),
    enabled: !!targetUserId && !isOwnProfile,
  });

  const { data: dreams = [] } = useQuery({
    queryKey: ["dreams"],
    queryFn: getDreams,
    enabled: isOwnProfile,
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

  const user = isOwnProfile ? {
    id: currentUserId || "guest",
    name: profile?.name || "Guest",
    handle: profile?.name?.toLowerCase().replace(/\s+/g, '-') || "guest",
    avatar: profile?.picture || "",
    level: userStats?.level || "Explorer",
    sats: userStats?.sats || 0,
    streak: userStats?.streak || 0,
    walletBalance: userStats?.walletBalance || 0,
    badges: userStats?.badges || [],
    satsGiven: 0,
    satsReceived: 0,
  } : publicProfile ? {
    id: publicProfile.id,
    name: publicProfile.name,
    handle: publicProfile.handle,
    avatar: publicProfile.avatar || "",
    level: publicProfile.level,
    sats: publicProfile.sats,
    streak: publicProfile.streak,
    walletBalance: 0,
    badges: publicProfile.badges || [],
    satsGiven: publicProfile.satsGiven,
    satsReceived: publicProfile.satsReceived,
  } : null;

  const ownExperimentsList = (ownExperiments as Experiment[]).filter(e => e.isPublished);
  const ownCoursesList = (ownCourses as Course[]).filter(c => c.isPublished);
  const ownCommunitiesList = ownCommunities as Community[];

  const content: {
    experiments: Experiment[];
    courses: Course[];
    communities: Community[];
  } = isOwnProfile ? {
    experiments: ownExperimentsList,
    courses: ownCoursesList,
    communities: ownCommunitiesList,
  } : publicProfile?.content || {
    experiments: [],
    courses: [],
    communities: [],
  };

  const stats = isOwnProfile ? {
    experimentsCount: ownExperimentsList.length,
    coursesCount: ownCoursesList.length,
    communitiesCount: ownCommunitiesList.length,
  } : publicProfile?.stats || {
    experimentsCount: 0,
    coursesCount: 0,
    communitiesCount: 0,
  };

  const dreamsList = dreams as Dream[];
  const dreamsWithProgress = LOVE_CODE_AREAS.map(area => {
    const dreamEntry = dreamsList.find(d => d.areaId === area.id);
    return {
      ...area,
      dream: dreamEntry?.dream || "No dream set yet",
      progress: 0,
    };
  });

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

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const streakDays = weekDays.map((day, i) => ({
    day,
    active: i < Math.min(user.streak, 7),
  }));

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        
        {!isOwnProfile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/feed" className="hover:text-love-body">Feed</Link>
            <span>/</span>
            <span>{user.name}'s Profile</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-love-body to-love-soul border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 shrink-0 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">
                  {isOwnProfile ? "Current Level" : user.name}
                </p>
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2" data-testid="text-user-level">
                  {user.level} <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </h2>
                {isOwnProfile && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                    <Progress value={75} className="h-1.5 w-24 bg-black/20" indicatorClassName="bg-yellow-300" />
                    <span>750 / 1000 XP</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600/80">
                    {isOwnProfile ? "Wallet Balance" : "Total Sats"}
                  </p>
                  <h2 className="text-3xl font-black text-orange-500 flex items-center gap-2 mt-1" data-testid="text-sats">
                    {(isOwnProfile ? user.walletBalance : user.sats).toLocaleString()}
                    <span className="text-sm font-bold text-orange-400 mt-1">Sats</span>
                  </h2>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <img src={BitcoinIcon} alt="Bitcoin" className="w-6 h-6" />
                </div>
              </div>
              {isOwnProfile && (
                <Button size="sm" className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white border-none" data-testid="button-redeem">
                  Redeem Rewards
                </Button>
              )}
              {!isOwnProfile && (
                <div className="flex gap-4 text-xs mt-2">
                  <div>
                    <span className="text-muted-foreground">Given:</span>{" "}
                    <span className="font-bold text-orange-500">{user.satsGiven}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Received:</span>{" "}
                    <span className="font-bold text-orange-500">{user.satsReceived}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-blue-500 fill-blue-500" />
                  <h4 className="font-bold text-xs uppercase text-blue-600/80">Streak</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-blue-500" data-testid="text-streak">{user.streak}</span>
                  <span className="text-xs font-bold text-blue-400">Days</span>
                </div>
              </div>

              <div className="flex justify-between gap-1.5">
                {streakDays.map((d, i) => (
                  <div key={i} className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    d.active ? "bg-blue-500 text-white shadow-md" : "bg-blue-200 text-blue-400 font-bold"
                  )}>
                    {d.day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={isOwnProfile ? "journey" : "content"} className="space-y-8">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start w-full md:w-auto">
            {isOwnProfile && (
              <TabsTrigger value="journey" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-journey">
                <Target className="w-4 h-4" /> My Journey
              </TabsTrigger>
            )}
            <TabsTrigger value="content" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-content">
              <BookOpen className="w-4 h-4" /> {isOwnProfile ? "My Content" : "Content"}
            </TabsTrigger>
            <TabsTrigger value="badges" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-badges">
              <Award className="w-4 h-4" /> Badges & Trophies
            </TabsTrigger>
          </TabsList>

          {isOwnProfile && (
            <TabsContent value="journey" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-serif text-xl font-bold text-muted-foreground flex items-center gap-2">
                    <Target className="w-5 h-5" strokeWidth={1.5} /> 11 Big Dreams Progress
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dreamsWithProgress.map((area) => (
                      <Card key={area.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-xs">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.hex }} />
                              <span className="font-bold text-sm uppercase text-muted-foreground">{area.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: area.hex }}>{area.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${area.progress}%`, backgroundColor: area.hex }} />
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground italic line-clamp-1 group-hover:line-clamp-none transition-all">
                            "{area.dream}"
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-xl font-bold text-muted-foreground flex items-center gap-2">
                    <Gift className="w-5 h-5" strokeWidth={1.5} /> Next Rewards
                  </h3>
                  <Card className="border-none shadow-sm bg-muted/30 rounded-xs">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex gap-4 items-start opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">7-Day Streak Bonus</h4>
                          <p className="text-xs text-muted-foreground mt-1">Earn 500 Sats for maintaining a 7-day practice streak.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={100} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-green-600">CLAIMED</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Mystery Box (Level 13)</h4>
                          <p className="text-xs text-muted-foreground mt-1">Unlock a special digital collectible when you reach Level 13.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={75} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-muted-foreground">75%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <Brain className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Mind Master Badge</h4>
                          <p className="text-xs text-muted-foreground mt-1">Complete 30 days of meditation practices.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={45} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-muted-foreground">14/30</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-8">
              {isOwnProfile && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setLocation("/creator")} data-testid="button-go-creator">
                    Manage in Creator Dashboard
                  </Button>
                </div>
              )}
                {content.experiments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-muted-foreground flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" /> Experiments ({stats.experimentsCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.experiments.map((exp) => (
                        <ContentCard
                          key={exp.id}
                          title={exp.title}
                          description={exp.description}
                          type="experiment"
                          href={`/experiments/${exp.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {content.courses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> Courses ({stats.coursesCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.courses.map((course) => (
                        <ContentCard
                          key={course.id}
                          title={course.title}
                          description={course.description}
                          type="course"
                          href={`/grow/${course.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {content.communities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-muted-foreground flex items-center gap-2">
                      <Users className="w-5 h-5" /> Communities ({stats.communitiesCount})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.communities.map((community) => (
                        <ContentCard
                          key={community.id}
                          title={community.name}
                          description={community.description}
                          type="community"
                          href={`/community/${community.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {content.experiments.length === 0 && content.courses.length === 0 && content.communities.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{isOwnProfile ? "You haven't published any content yet." : "This user hasn't published any content yet."}</p>
                  </div>
                )}
              </div>
          </TabsContent>

          <TabsContent value="badges">
            <BadgeDisplay badges={user.badges} />
          </TabsContent>
        </Tabs>

      </div>
    </Layout>
  );
}
