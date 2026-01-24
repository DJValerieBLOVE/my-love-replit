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
        <div className="text-center space-y-3">
          <div className="text-5xl font-bold text-love-body">{winsThisWeek}</div>
          <div className="text-sm text-muted-foreground">wins this week</div>
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <span>{streak} day streak</span>
            <Flame className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex justify-center gap-1 pt-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
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
        <div className="text-center space-y-3">
          <div className="text-4xl font-bold" style={{ color: "#6600ff" }}>
            {overallProgress}%
          </div>
          <div className="text-sm text-muted-foreground">overall progress</div>
          <div className="flex items-end justify-center gap-1 h-16">
            {AREA_ORDER.map((area, i) => {
              const progress = areaProgress.find((p: any) => p.area === area);
              const score = progress?.currentScore || 0;
              const height = Math.max(10, (score / 11) * 100);
              return (
                <div
                  key={area}
                  className="w-4 rounded-t-sm transition-all"
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
        <div className="space-y-3">
          <div className="text-3xl font-bold text-center text-love-body">2</div>
          <div className="text-sm text-center text-muted-foreground">experiments active</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Morning Routine</span>
              <span className="text-muted-foreground">65%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-love-body h-2 rounded-full" style={{ width: "65%" }} />
            </div>
            <div className="flex justify-between text-sm mt-3">
              <span>Daily Journaling</span>
              <span className="text-muted-foreground">40%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-love-body h-2 rounded-full" style={{ width: "40%" }} />
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
        <div className="space-y-3">
          <div className="text-sm font-medium">Upcoming Events</div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">Weekly Check-in</div>
              <div className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">Community Call</div>
              <div className="text-xs text-muted-foreground">Friday, 3:00 PM</div>
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
        <div className="text-center space-y-3">
          <div className="flex justify-center -space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 border-2 border-white" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white" />
          </div>
          <div className="text-sm text-muted-foreground">Your accountability partners</div>
          <div className="text-xs text-green-600 font-medium">All on track this week!</div>
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
        <div className="space-y-3">
          <div className="text-sm font-medium">Current Courses</div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">11x LOVE Foundations</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-love-body h-1.5 rounded-full" style={{ width: "75%" }} />
                </div>
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">Daily Rituals</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-love-body h-1.5 rounded-full" style={{ width: "30%" }} />
                </div>
                <span className="text-xs text-muted-foreground">30%</span>
              </div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/learn",
    },
    {
      id: "ai-mentor",
      title: "AI Mentor",
      subtitle: "Ready to guide",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-3">
          <div className="text-4xl text-muted-foreground">AI</div>
          <div className="font-medium">Magic Mentor</div>
          <div className="text-sm text-muted-foreground">
            Your AI coach is ready to help you grow
          </div>
          <div className="text-xs text-muted-foreground">Online now</div>
        </div>
      ),
      detailsLink: "/mentor",
    },
    {
      id: "streak",
      title: "Streak",
      subtitle: `${streak} days strong`,
      image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=800&fit=crop",
      backContent: (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-10 h-10 text-muted-foreground" />
            <span className="text-5xl font-bold">{streak}</span>
          </div>
          <div className="text-sm text-muted-foreground">consecutive days</div>
          <div className="text-xs text-muted-foreground">
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
        <div className="space-y-3">
          <div className="text-sm font-medium">Your Communities</div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <div>
                <div className="font-medium text-sm">11x LOVE LaB</div>
                <div className="text-xs text-green-600">3 online</div>
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500" />
              <div>
                <div className="font-medium text-sm">Growth Mindset</div>
                <div className="text-xs text-green-600">1 online</div>
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
