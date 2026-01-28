import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music, 
  Headphones,
  Plus, 
  Bookmark, 
  FileText, 
  Download, 
  BookOpen,
  Heart,
  PenLine,
  Search,
  KeyRound,
  Lock,
  Sun,
  Moon,
  ChevronRight,
  Flame,
  BarChart3,
  Library,
  Video,
  Mic,
  File,
  FolderOpen,
  Play,
  Clock,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJournalEntries } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 11 LOVE Code areas for tagging
const LOVE_AREAS = [
  { id: "god", name: "God/Spirituality", color: "#eb00a8" },
  { id: "mission", name: "Mission", color: "#a2f005" },
  { id: "body", name: "Body", color: "#6600ff" },
  { id: "mind", name: "Mind", color: "#9900ff" },
  { id: "soul", name: "Soul", color: "#cc00ff" },
  { id: "romance", name: "Romance", color: "#e60023" },
  { id: "family", name: "Family", color: "#ff6600" },
  { id: "community", name: "Community", color: "#ffdf00" },
  { id: "money", name: "Money", color: "#00d81c" },
  { id: "time", name: "Time", color: "#00ccff" },
  { id: "environment", name: "Environment", color: "#0033ff" },
];

// Generate streak data for full year (365 days) organized by weeks
const generateYearStreakData = () => {
  const weeks: { date: string; dayOfWeek: number; completion: number }[][] = [];
  const today = new Date();
  
  // Go back to the start of the year (or 365 days)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  
  // Adjust to start on Sunday
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  
  let currentWeek: { date: string; dayOfWeek: number; completion: number }[] = [];
  
  for (let i = 0; i <= 371; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date > today) break;
    
    const dayOfWeek = date.getDay();
    // Random completion: 0 = none, 1 = morning only, 2 = evening only, 3 = both
    const completion = Math.random() > 0.35 ? (Math.random() > 0.5 ? 3 : Math.random() > 0.5 ? 1 : 2) : 0;
    
    currentWeek.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      completion,
    });
    
    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
};

const YEAR_STREAK_DATA = generateYearStreakData();

// Mock library items
const LIBRARY_ITEMS = [
  { id: 1, title: "The Bitcoin Standard", author: "Saifedean Ammous", type: "book", status: "reading", cover: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=200&h=300&fit=crop", area: "money" },
  { id: 2, title: "Breaking the Habit of Being Yourself", author: "Dr. Joe Dispenza", type: "audiobook", status: "completed", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop", area: "mind" },
  { id: 3, title: "Bitcoin Audible", author: "Guy Swann", type: "podcast", status: "listening", cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=300&fit=crop", area: "money" },
  { id: 4, title: "How Bitcoin Works", author: "YouTube", type: "video", status: "want", cover: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200&h=300&fit=crop", area: "money" },
  { id: 5, title: "11x Life Audit Template", author: "PDF", type: "document", status: "reference", cover: null, area: "mission" },
];

// Music & Meditation playlists
const PLAYLISTS = [
  { id: 1, title: "Morning Energy", mood: "energize", tracks: 12, duration: "45 min", gradient: "from-orange-500 to-yellow-500" },
  { id: 2, title: "Focus Flow", mood: "focus", tracks: 18, duration: "1hr 20min", gradient: "from-blue-500 to-cyan-500" },
  { id: 3, title: "Evening Wind Down", mood: "relax", tracks: 10, duration: "35 min", gradient: "from-purple-500 to-pink-500" },
];

const MEDITATIONS = [
  { id: 1, title: "Morning Intention Setting", duration: "10 min", type: "guided", gradient: "from-cyan-500 to-teal-500" },
  { id: 2, title: "Breath of Fire", duration: "5 min", type: "breathwork", gradient: "from-red-500 to-orange-500" },
  { id: 3, title: "Evening Gratitude", duration: "15 min", type: "guided", gradient: "from-indigo-500 to-purple-500" },
];

function StreakGrid() {
  const currentStreak = 7; // Mock current streak
  const longestStreak = 30; // Mock longest streak
  const totalDays = YEAR_STREAK_DATA.flat().filter(d => d.completion === 3).length;
  
  // Get month labels
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    YEAR_STREAK_DATA.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const date = new Date(week[0].date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: date.toLocaleDateString('en-US', { month: 'short' }), weekIndex });
          lastMonth = month;
        }
      }
    });
    return labels;
  };
  
  const monthLabels = getMonthLabels();
  
  return (
    <div className="space-y-3">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-lg font-bold">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-200" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-200" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-400" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-600" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* GitHub-style contribution grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Month labels */}
          <div className="flex text-[10px] text-muted-foreground mb-1 ml-6">
            {monthLabels.map((label, i) => (
              <div 
                key={i} 
                className="absolute"
                style={{ marginLeft: `${label.weekIndex * 11 + 24}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>
          <div className="h-3" /> {/* Spacer for month labels */}
          
          {/* Grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] text-[9px] text-muted-foreground pr-1">
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">M</div>
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">W</div>
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">F</div>
              <div className="h-[9px]"></div>
            </div>
            
            {/* Weeks */}
            {YEAR_STREAK_DATA.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find(d => d.dayOfWeek === dayOfWeek);
                  if (!day) {
                    return <div key={dayOfWeek} className="w-[9px] h-[9px]" />;
                  }
                  
                  const bgColor = day.completion === 0 
                    ? "bg-gray-100" 
                    : day.completion === 3 
                      ? "bg-purple-600" 
                      : day.completion === 2
                        ? "bg-purple-400"
                        : "bg-purple-200";
                  
                  return (
                    <Tooltip key={dayOfWeek}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-[9px] h-[9px] rounded-[2px] ${bgColor} cursor-pointer hover:ring-1 hover:ring-purple-400`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-muted-foreground">
                          {day.completion === 0 && "No check-in"}
                          {day.completion === 1 && "Morning only ☀️"}
                          {day.completion === 2 && "Evening only 🌙"}
                          {day.completion === 3 && "Complete day ✨"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-xs pt-1 border-t">
        <div>
          <span className="text-muted-foreground">Year of practice: </span>
          <span className="font-bold">{totalDays} complete days</span>
        </div>
        <div>
          <span className="text-muted-foreground">Longest streak: </span>
          <span className="font-bold">{longestStreak} days</span>
        </div>
        <div>
          <span className="text-muted-foreground">Current streak: </span>
          <span className="font-bold">{currentStreak} days</span>
        </div>
      </div>
    </div>
  );
}

function DailyLovePracticeTab() {
  const { isConnected } = useNostr();
  
  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: () => getJournalEntries(10),
    enabled: isConnected,
  });

  return (
    <div className="space-y-6">
      {/* Streak Visualization */}
      <Card className="p-3">
        <StreakGrid />
      </Card>

      {/* Start Today's Practice CTA */}
      <Card className="overflow-hidden bg-gradient-to-r from-[#6600ff]/5 to-[#cc00ff]/5 border-purple-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6600ff] to-[#cc00ff] flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif">Daily LOVE Practice</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Link href="/journal?startPractice=true">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-[#6600ff] to-[#cc00ff] hover:opacity-90">
                <Plus className="w-5 h-5" /> Start Today's Practice
              </Button>
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-200/30">
            <p className="text-xs text-muted-foreground">
              Complete both morning alignment and evening review to maintain your streak.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div>
        <h3 className="font-bold text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Entries
        </h3>
        <div className="space-y-2">
          {(journalEntries as any[]).slice(0, 5).map((entry: any) => (
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-orange-400" />
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    {entry.gratitude && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{entry.gratitude}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
          
          {journalEntries.length === 0 && (
            <Card className="p-6 border-dashed text-center">
              <p className="text-sm text-muted-foreground mb-3">No entries yet. Start your first practice!</p>
              <Link href="/journal?startPractice=true">
                <Button size="sm" className="gap-2">
                  <Heart className="w-4 h-4" /> Begin Practice
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function JournalTab() {
  const { isConnected } = useNostr();
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: () => getJournalEntries(10),
    enabled: isConnected,
  });

  return (
    <div className="space-y-6">
      {/* Quick Actions - Template Picker */}
      <div className="flex flex-wrap gap-2">
        <Link href="/journal?startPractice=true">
          <Button className="gap-2">
            <Heart className="w-4 h-4" /> Daily LOVE Practice
          </Button>
        </Link>
        <Button variant="outline" className="gap-2">
          <PenLine className="w-4 h-4" /> LaB Notes
        </Button>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" /> Gratitude
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" /> Blank
        </Button>
      </div>

      {/* Filter, Search & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search journal..." className="pl-9" />
          </div>
          <div className="flex gap-1">
            {["all", "love-practice", "lab-notes", "gratitude"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs"
              >
                {f === "all" && "All"}
                {f === "love-practice" && "LOVE Practice"}
                {f === "lab-notes" && "LaB Notes"}
                {f === "gratitude" && "Gratitude"}
              </Button>
            ))}
          </div>
        </div>
        {/* View Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-7 px-2"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="h-7 px-2"
          >
            <CalendarDays className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 11 Area Tags */}
      <div className="flex flex-wrap gap-1.5">
        {LOVE_AREAS.map((area) => (
          <Badge 
            key={area.id} 
            variant="outline" 
            className="cursor-pointer hover:bg-muted text-xs"
            style={{ borderColor: area.color }}
          >
            <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: area.color }} />
            {area.name}
          </Badge>
        ))}
      </div>

      {/* Journal Entries - List View */}
      {viewMode === "list" && (
        <div className="grid gap-3">
          {(journalEntries as any[]).map((entry: any) => (
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs font-medium">Daily LOVE Practice</span>
                    <Lock className="w-3 h-3 text-muted-foreground/40" />
                  </div>
                  <div className="font-serif font-bold mb-1">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.gratitude || entry.reflection || "No content..."}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Card>
          ))}
          
          {journalEntries.length === 0 && (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="p-8 text-center">
                <PenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No journal entries yet</h3>
                <p className="text-muted-foreground mb-4">Start your first entry to begin your journey.</p>
                <Link href="/journal?startPractice=true">
                  <Button className="gap-2">
                    <Heart className="w-4 h-4" /> Start Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Journal Entries - Calendar View */}
      {viewMode === "calendar" && (
        <Card className="p-4">
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg">January 2026</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 font-medium">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {[...Array(4)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* Days of the month */}
            {[...Array(27)].map((_, i) => {
              const day = i + 1;
              const hasEntry = Math.random() > 0.6;
              const hasBoth = hasEntry && Math.random() > 0.5;
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-purple-400 ${
                    hasEntry 
                      ? hasBoth 
                        ? "bg-purple-600 text-white" 
                        : "bg-purple-300 text-purple-900"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {hasEntry && (
                    <div className="flex gap-0.5 mt-0.5">
                      <Sun className="w-2.5 h-2.5" />
                      {hasBoth && <Moon className="w-2.5 h-2.5" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function BookmarksTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search bookmarks..." className="pl-9" />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Bookmark
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[120px]">
          <div className="text-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Create folder</p>
          </div>
        </Card>
        
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">Saved Item {i}</h4>
                <p className="text-xs text-muted-foreground">From Experiments</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssessmentsTab() {
  return (
    <div className="space-y-6">
      {/* 11x LOVE Code Assessment */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#6600ff]/10 to-[#cc00ff]/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif">11x LOVE Code Assessment</CardTitle>
            <Button size="sm" variant="outline">Take Again</Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm mb-4">Your results are used to personalize your Big Dreams and AI coaching.</p>
            {/* Radar chart placeholder */}
            <div className="w-64 h-64 mx-auto rounded-full border-4 border-dashed border-muted flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Radar chart coming soon</p>
              </div>
            </div>
          </div>
          
          {/* Area scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {LOVE_AREAS.map((area) => (
              <div key={area.id} className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: area.color }} />
                <p className="text-xs font-medium truncate">{area.name}</p>
                <p className="text-lg font-bold" style={{ color: area.color }}>{Math.floor(Math.random() * 40 + 60)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      <div>
        <h3 className="font-bold text-muted-foreground mb-3">Assessment History</h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">11x LOVE Code Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    Taken {i === 1 ? "January 15, 2026" : "October 3, 2025"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MusicMeditationsTab() {
  return (
    <div className="space-y-8">
      {/* Now Playing */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Now Playing</p>
            <h3 className="font-bold">Morning Energy Mix</h3>
            <p className="text-sm text-muted-foreground">High vibe instrumentals</p>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full w-12 h-12">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </Card>

      {/* Music Playlists */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
          <Music className="w-5 h-5" /> Music Playlists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAYLISTS.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className={`h-32 bg-gradient-to-br ${playlist.gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold">{playlist.title}</h3>
                <p className="text-xs text-muted-foreground">{playlist.tracks} tracks • {playlist.duration}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-dashed border-2 flex items-center justify-center min-h-[180px] cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="text-center p-4">
              <Plus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add Playlist Link</p>
              <p className="text-xs text-muted-foreground/60">Spotify, Apple Music, YouTube</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Meditations */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
          <Headphones className="w-5 h-5" /> Meditations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MEDITATIONS.map((med) => (
            <Card key={med.id} className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className={`h-32 bg-gradient-to-br ${med.gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold">{med.title}</h3>
                <p className="text-xs text-muted-foreground">{med.duration} • {med.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function LibraryTab() {
  const [category, setCategory] = useState("all");
  
  const categories = [
    { id: "all", label: "All", icon: Library },
    { id: "book", label: "Books", icon: BookOpen },
    { id: "audiobook", label: "Audiobooks", icon: Headphones },
    { id: "podcast", label: "Podcasts", icon: Mic },
    { id: "video", label: "Videos", icon: Video },
    { id: "document", label: "Documents", icon: File },
  ];

  const filteredItems = category === "all" 
    ? LIBRARY_ITEMS 
    : LIBRARY_ITEMS.filter(item => item.type === category);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reading":
      case "listening":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "want":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Want</Badge>;
      case "reference":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Reference</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat.id)}
            className="gap-2"
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Add New */}
      <Card className="p-4 border-dashed border-2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input placeholder="Paste a link to add (YouTube, Spotify, Audible, website...)" />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Card>

      {/* Continue Section */}
      <section>
        <h3 className="font-bold text-muted-foreground mb-3 flex items-center gap-2">
          <Play className="w-4 h-4" /> Continue
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.filter(i => i.status === "reading" || i.status === "listening").map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-16 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <File className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                  <div className="mt-2">{getStatusBadge(item.status)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* All Items */}
      <section>
        <h3 className="font-bold text-muted-foreground mb-3">All Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-16 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <File className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: LOVE_AREAS.find(a => a.id === item.area)?.color }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Vault() {
  const [activeTab, setActiveTab] = useState("daily-love");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-muted-foreground" /> The Vault
            </h1>
            <p className="text-muted-foreground mt-1">
              Your private space for growth, reflection, and learning.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search vault..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64" 
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full md:w-auto bg-[#FAFAFA] p-1 h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="daily-love" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Heart className="w-4 h-4" /> Daily LOVE
            </TabsTrigger>
            <TabsTrigger value="journal" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <PenLine className="w-4 h-4" /> Journal
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bookmark className="w-4 h-4" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="assessments" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" /> Assessments
            </TabsTrigger>
            <TabsTrigger value="music" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Music className="w-4 h-4" /> Music & Meditations
            </TabsTrigger>
            <TabsTrigger value="library" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Library className="w-4 h-4" /> Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily-love">
            <DailyLovePracticeTab />
          </TabsContent>

          <TabsContent value="journal">
            <JournalTab />
          </TabsContent>

          <TabsContent value="bookmarks">
            <BookmarksTab />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab />
          </TabsContent>

          <TabsContent value="music">
            <MusicMeditationsTab />
          </TabsContent>

          <TabsContent value="library">
            <LibraryTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
