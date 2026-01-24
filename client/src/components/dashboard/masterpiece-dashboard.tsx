import { FlipCard } from "./flip-card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getDreams, getAreaProgress, getJournalEntries, CURRENT_USER_ID } from "@/lib/api";
import { Flame } from "lucide-react";

const LOVE_COLORS = {
  "GOD/LOVE": "#eb00a8",
  "Romance": "#e60023",
  "Family": "#ff6600",
  "Community": "#ffdf00",
  "Mission": "#a2f005",
  "Money": "#00d81c",
  "Time": "#00ccff",
  "Environment": "#0033ff",
  "Body": "#6600ff",
  "Mind": "#9900ff",
  "Soul": "#cc00ff",
};

const AREA_ORDER = [
  "GOD/LOVE",
  "Romance",
  "Family",
  "Community",
  "Mission",
  "Money",
  "Time",
  "Environment",
  "Body",
  "Mind",
  "Soul",
];

export function MasterpieceDashboard() {
  const [, setLocation] = useLocation();

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journalEntries", CURRENT_USER_ID],
    queryFn: () => getJournalEntries(CURRENT_USER_ID),
  });

  const { data: areaProgress = [] } = useQuery({
    queryKey: ["areaProgress", CURRENT_USER_ID],
    queryFn: () => getAreaProgress(CURRENT_USER_ID),
  });

  const calculateStreak = () => {
    if (journalEntries.length === 0) return 0;
    const sortedEntries = [...journalEntries].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && entryDate.getTime() === expectedDate.getTime() - 86400000) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWinsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return journalEntries.filter((e: any) => new Date(e.createdAt) > oneWeekAgo).length;
  };

  const calculateOverallProgress = () => {
    if (areaProgress.length === 0) return 0;
    const total = areaProgress.reduce((sum: number, p: any) => sum + (p.currentScore || 0), 0);
    return Math.round((total / (areaProgress.length * 11)) * 100);
  };

  const streak = calculateStreak();
  const winsThisWeek = getWinsThisWeek();
  const overallProgress = calculateOverallProgress();

  const cards = [
    {
      id: "daily-wins",
      title: "Daily Wins",
      subtitle: "Celebrate progress",
      image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-love-body">{winsThisWeek}</div>
          <div className="text-xs text-muted-foreground">wins this week</div>
          <div className="flex items-center justify-center gap-2 text-base font-semibold">
            <span>{streak} day streak</span>
            <Flame className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex justify-center gap-1 pt-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < streak ? "bg-gray-900" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      ),
      detailsLink: "/journal",
    },
    {
      id: "11x-love",
      title: "11x LOVE",
      subtitle: "Life balance",
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold" style={{ color: "#6600ff" }}>
            {overallProgress}%
          </div>
          <div className="text-xs text-muted-foreground">overall progress</div>
          <div className="flex items-end justify-center gap-1 h-12">
            {AREA_ORDER.map((area, i) => {
              const progress = areaProgress.find((p: any) => p.area === area);
              const score = progress?.currentScore || 0;
              const height = Math.max(10, (score / 11) * 100);
              return (
                <div
                  key={area}
                  className="w-3 rounded-t-sm transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: LOVE_COLORS[area as keyof typeof LOVE_COLORS],
                  }}
                  title={`${area}: ${score}/11`}
                />
              );
            })}
          </div>
        </div>
      ),
      detailsLink: "/big-dreams",
    },
    {
      id: "your-goals",
      title: "Your Goals",
      subtitle: "Focus on 3",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-center text-love-body">2</div>
          <div className="text-xs text-center text-muted-foreground">experiments active</div>
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-xs">
              <span>Morning Routine</span>
              <span className="text-muted-foreground">65%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-love-body h-1.5 rounded-full" style={{ width: "65%" }} />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span>Daily Journaling</span>
              <span className="text-muted-foreground">40%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-love-body h-1.5 rounded-full" style={{ width: "40%" }} />
            </div>
          </div>
        </div>
      ),
      detailsLink: "/experiments",
    },
    {
      id: "events",
      title: "Events",
      subtitle: "2 upcoming",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Upcoming Events</div>
          <div className="space-y-1">
            <div className="p-2 px-3 bg-gray-50/80 rounded-md flex items-center justify-between gap-2 border border-gray-100/50">
              <div className="font-medium text-[11px] text-gray-900 truncate">Weekly Check-in</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">Tomorrow, 10:00 AM</div>
            </div>
            <div className="p-2 px-3 bg-gray-50/80 rounded-md flex items-center justify-between gap-2 border border-gray-100/50">
              <div className="font-medium text-[11px] text-gray-900 truncate">Community Call</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">Friday, 3:00 PM</div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/events",
    },
    {
      id: "buddies",
      title: "Buddies",
      subtitle: "3 partners",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-2">
          <div className="flex justify-center -space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 border-2 border-white" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white" />
          </div>
          <div className="text-xs text-muted-foreground">Your accountability partners</div>
          <div className="text-[10px] text-green-600 font-medium">All on track this week!</div>
        </div>
      ),
      detailsLink: "/buddies",
    },
    {
      id: "learning",
      title: "Learning",
      subtitle: "2 active",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Current Courses</div>
          <div className="space-y-1">
            <div className="p-2 px-3 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-medium text-[11px] text-gray-900 truncate">11x LOVE Foundations</div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1">
                <div className="bg-love-body h-1 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div className="p-2 px-3 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-medium text-[11px] text-gray-900 truncate">Daily Rituals</div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">30%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1">
                <div className="bg-love-body h-1 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/learn",
    },
    {
      id: "ai-mentor",
      title: "Magic Mentor",
      subtitle: "Your focus areas",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2 text-center">Top 3 Focus Areas</div>
          <div className="space-y-1">
            {areaProgress.length > 0 ? (
              [...areaProgress]
                .sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))
                .slice(0, 3)
                .map((area: any) => {
                  const areaId = area.areaId || "unknown";
                  const displayName = AREA_ORDER.find(a => a.toLowerCase().replace(/[\/\s]/g, '-') === areaId) || areaId;
                  const color = LOVE_COLORS[displayName as keyof typeof LOVE_COLORS] || "#6600ff";
                  const progress = area.progress || 0;
                  const status = progress >= 80 ? "Thriving" : progress >= 50 ? "Growing" : "Building";
                  return (
                    <div key={area.id} className="flex items-center gap-2 p-2 px-3 bg-gray-50/80 rounded-md border border-gray-100/50">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[11px] font-medium text-gray-900 capitalize truncate">{areaId.replace(/-/g, ' ')}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">{status}</span>
                    </div>
                  );
                })
            ) : (
              <div className="flex items-center gap-2 p-2 px-3 bg-gray-50/80 rounded-md border border-gray-100/50">
                <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                <span className="text-[11px] text-muted-foreground">Set your first goal</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-center text-muted-foreground mt-1 italic">
            Ask Magic Mentor for guidance
          </div>
        </div>
      ),
      detailsLink: "/big-dreams",
    },
    {
      id: "streak",
      title: "Streak",
      subtitle: `${streak} days strong`,
      image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-muted-foreground" />
            <span className="text-4xl font-bold">{streak}</span>
          </div>
          <div className="text-xs text-muted-foreground">consecutive days</div>
          <div className="text-[10px] text-muted-foreground">
            {streak > 0
              ? `Keep it going! You're on fire!`
              : "Start your streak today!"}
          </div>
        </div>
      ),
      detailsLink: "/journal",
    },
    {
      id: "communities",
      title: "Communities",
      subtitle: "2 groups",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Your Communities</div>
          <div className="space-y-1">
            <div className="p-2 px-3 bg-gray-50/80 rounded-md flex items-center justify-between border border-gray-100/50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
                <div className="font-medium text-[11px] text-gray-900 truncate">11x LOVE LaB</div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="text-[10px] text-green-600 font-medium whitespace-nowrap">3 online</div>
              </div>
            </div>
            <div className="p-2 px-3 bg-gray-50/80 rounded-md flex items-center justify-between border border-gray-100/50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 shrink-0" />
                <div className="font-medium text-[11px] text-gray-900 truncate">Growth Mindset</div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <div className="text-[10px] text-green-600 font-medium whitespace-nowrap">1 online</div>
              </div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/communities",
    },
  ];

  return (
    <div className="w-full h-full p-2 overflow-hidden bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-full">
        {cards.map((card) => (
          <FlipCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            backgroundImage={card.image}
            backContent={card.backContent}
            onDetailsClick={() => setLocation(card.detailsLink)}
          />
        ))}
      </div>
    </div>
  );
}
