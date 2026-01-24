import { Music, Pin, Flame } from "lucide-react";
import { useState as useReactState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAreaProgress, getJournalEntries, CURRENT_USER_ID } from "@/lib/api";

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
  const [pinnedCards, setPinnedCards] = useReactState<Record<string, boolean>>({});

  const togglePin = (id: string) => {
    setPinnedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
      id: "daily-love",
      title: "Daily LOVE Practice",
      subtitle: "Vibe • Vision • Value • Villain • Victory",
      image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Vibe Check</div>
          <div className="space-y-1">
            {[
              { label: "Vibe", value: "High" },
              { label: "Vision", value: "Clear" },
              { label: "Value", value: "Grateful" },
              { label: "Villain", value: "Conquered" },
              { label: "Victory", value: "Claimed" }
            ].map((item) => (
              <div key={item.label} className="p-2 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
                <div className="flex items-center justify-between text-[14px] text-gray-900">
                  <span>{item.label}</span>
                  <span className="text-[12px] text-muted-foreground">{item.value}</span>
                </div>
              </div>
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
        <div className="space-y-2 px-1">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2 text-center">Active Experiments</div>
          <div className="space-y-1 mt-1">
            <div className="p-2 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex justify-between text-[14px] text-gray-900 mb-1">
                <span>Morning Routine</span>
                <span className="text-[12px] text-muted-foreground">65%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                <div className="bg-love-body h-1.5 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <div className="p-2 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex justify-between text-[14px] text-gray-900 mb-1">
                <span>Daily Journaling</span>
                <span className="text-[12px] text-muted-foreground">40%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                <div className="bg-love-body h-1.5 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/experiments",
    },
    {
      id: "song-day",
      title: "Song of the Day",
      subtitle: "Daily Vibe",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Now Playing</div>
          <div className="p-3 px-4 bg-gray-50/80 rounded-md border border-gray-100/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-love-body flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] text-gray-900 truncate leading-tight">Love is the Answer</div>
              <div className="text-[12px] text-muted-foreground truncate">DJ Valerie B LOVE</div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/resources",
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
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2 text-center">Current Courses</div>
          <div className="space-y-1">
            <div className="p-2 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-[14px] text-gray-900 truncate">11x LOVE Foundations</div>
                <span className="text-[12px] text-muted-foreground whitespace-nowrap">75%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                <div className="bg-love-body h-1.5 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div className="p-2 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-[14px] text-gray-900 truncate">Daily Rituals</div>
                <span className="text-[12px] text-muted-foreground whitespace-nowrap">30%</span>
              </div>
              <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                <div className="bg-love-body h-1.5 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/learn",
    },
    {
      id: "podcast-day",
      title: "Podcast of the Day",
      subtitle: "Deep Dive: Lightning",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop",
      backContent: (
        <div className="space-y-2 px-1">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Now Playing</div>
          <div className="p-3 px-4 bg-gray-50/80 rounded-md border border-gray-100/50">
            <div className="text-[14px] text-gray-900 leading-tight">Lightning Network 101</div>
            <div className="text-[12px] text-muted-foreground mt-1">with DJ Valerie B LOVE</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[40%]" />
              </div>
              <span className="text-[10px] text-muted-foreground">12:45</span>
            </div>
          </div>
        </div>
      ),
      detailsLink: "/resources",
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
          <div className="text-[12px] text-muted-foreground">
            {streak > 0
              ? `Keep it going! You're on fire!`
              : "Start your streak today!"}
          </div>
        </div>
      ),
      detailsLink: "/journal",
    },
    {
      id: "daily-affirmation",
      title: "Daily Affirmation",
      subtitle: "Your mantra for today",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop",
      backContent: (
        <div className="flex flex-col items-center justify-center text-center h-full px-4 space-y-3">
          <div className="text-[14px] font-bold text-gray-900 leading-relaxed italic">
            "I am the architect of my own masterpiece, building with LOVE and intention."
          </div>
          <div className="w-8 h-0.5 bg-love-body/20 rounded-full" />
        </div>
      ),
      detailsLink: "/big-dreams",
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
            isPinned={pinnedCards[card.id]}
            onPinToggle={() => togglePin(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
