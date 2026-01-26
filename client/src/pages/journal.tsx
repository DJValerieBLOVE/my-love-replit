import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Heart, CheckCircle, FlaskConical, Lightbulb, Plus, Sparkles, Beaker, Quote, Play, X, Moon, Sun, BookOpen, Trophy, Eye, ChevronLeft, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { getPlaylistForToday } from "@/lib/playlists";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiveVsWizard } from "@/components/daily-practice/five-vs-wizard";
import { useState, useEffect } from "react";
import WhiteLogo from "@assets/white transparent vector and png art  11x LOVE logo _1764365495719.png";
import { EntryDetailModal, JournalEntry } from "@/components/journal/entry-detail-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivePracticeCard } from "@/components/daily-practice/active-practice-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { toast } from "sonner";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";

export default function LabNotes() {
  const queryClient = useQueryClient();
  const { isConnected, profile } = useNostr();
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceData, setPracticeData] = useState<any>(null);
  const [dayCompleted, setDayCompleted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('startPractice') === 'true') {
      setIsPracticing(true);
    }
  }, []);

  // Fetch journal entries from API
  const { data: apiEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: () => getJournalEntries(50),
    enabled: isConnected,
  });

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Daily LOVE Practice saved!");
      setDayCompleted(true);
      setTimeout(() => setDayCompleted(false), 5000);
    },
    onError: () => {
      toast.error("Failed to save entry");
    },
  });

  // Update journal entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: ({ id, entry }: { id: string; entry: any }) =>
      updateJournalEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Entry updated!");
    },
    onError: () => {
      toast.error("Failed to update entry");
    },
  });

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showMissedCheckinAlert, setShowMissedCheckinAlert] = useState(true); 
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    entry: JournalEntry | null;
  }>({ open: false, entry: null });
  const todaysPlaylist = getPlaylistForToday();

  const handleShareEntry = (entry: JournalEntry) => {
    setShareDialog({ open: true, entry });
  };

  // Combine real journal entries with mock entries for other types
  // Mock entries for non-daily-practice types (temporarily keep until we implement those)
  const mockEntries: JournalEntry[] = [
    {
      id: 1,
      type: "daily-practice",
      date: "Sunday Nov 28th",
      time: "10:42 AM",
      morningVibe: 8,
      eveningVibe: 9,
      vibe: 8, // Fallback
      gratitude: "The sun shining through the window and fresh coffee.",
      focusArea: {
        name: "GOD/LOVE",
        color: "#eb00a8",
        progress: 85,
        dream: "To feel universally connected and lead with unconditional love in every interaction."
      },
      vision: "Focus on connection and clarity.",
      villain: "Distraction",
      value: "Presence",
      victory: "Completed the team briefing early.",
      content: "My focus today was on connection. I noticed that when I paused to breathe before responding to emails, I felt much more grounded and capable. The experiment with the morning cold plunge is getting easier...",
      tags: ["Daily LOVE Practice"],
      values: ["Presence", "Review goals", "Meditate 10m"],
      checkedItems: [true, true, false]
    },
    {
      id: 2,
      type: "experiment",
      date: "Saturday Nov 27th",
      time: "4:15 PM",
      experimentTitle: "Cold Plunge Challenge",
      hypothesis: "3 minutes at 50°F will increase morning focus by 50%.",
      observation: "First minute was brutal. Second minute panic subsided. Third minute felt clarity.",
      conclusion: "Definite increase in alertness immediately after.",
      content: "This was harder than I thought but the payoff was immediate. I felt buzzing energy for 3 hours afterwards.",
      tags: ["Experiment", "Health"]
    },
    {
      id: 3,
      type: "daily-practice",
      date: "Friday Nov 26th",
      time: "9:30 AM",
      morningVibe: 9,
      eveningVibe: 7,
      vibe: 9, // Fallback
      focusArea: {
        name: "Community",
        color: "#ffdf00",
        progress: 90,
        dream: "To spark a movement where every member feels seen, heard, and valued."
      },
      vision: "Celebrate the small wins.",
      villain: "Doubt",
      value: "Joy",
      victory: "Hosted a great dinner.",
      content: "Incredible energy today! The morning practice really set the tone. I felt a deep sense of gratitude for the community.",
      tags: ["Daily LOVE Practice"]
    },
    {
      id: 4,
      type: "discovery",
      date: "Thursday Nov 25th",
      time: "2:00 PM",
      ahaMoment: "Lightning Network is just an abacus for energy.",
      context: "Reading the Bitcoin Standard while hiking.",
      actionItem: "Write a blog post about energy transfer.",
      content: "It clicked when I was looking at the stream. Money flows like water. Lightning channels are just directing that flow without moving the entire ocean (chain).",
      tags: ["Discovery", "Bitcoin"]
    }
  ];

  // Combine API entries (real data) with mock entries (for experiments/discoveries until implemented)
  // Convert API entries to JournalEntry format
  const convertedApiEntries: JournalEntry[] = (apiEntries as any[]).map((entry: any) => ({
    id: entry.id,
    type: "daily-practice" as const,
    date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    time: new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    vibe: entry.vibeRating,
    morningVibe: entry.vibeRating,
    gratitude: entry.gratitude,
    vision: entry.lesson,
    victory: entry.blessing,
    content: entry.reflection,
    tags: ["Daily LOVE Practice"],
    values: entry.goal?.split(", ").filter(Boolean) || [],
    sharedClubId: entry.isPrivate ? "private" : (entry.sharedClubs?.[0] || "private"),
  }));

  const entries = [...convertedApiEntries, ...mockEntries.filter((e: JournalEntry) => e.type !== "daily-practice")];

  const handlePracticeComplete = (data: any) => {
    setIsPracticing(false);
    setPracticeData(null);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Prepare entry for backend (userId is set by backend from auth)
    const entry = {
      date: new Date(),
      vibeRating: parseInt(data.morningVibe) || parseInt(data.eveningVibe) || 5,
      gratitude: data.gratitude || "",
      gratitudePhoto: null,
      lesson: data.vision || "",
      blessing: data.victory || "",
      goal: data.values?.join(", ") || "",
      reflection: data.content || "",
      isPrivate: data.sharedClubId === "private",
      sharedClubs: data.sharedClubId && data.sharedClubId !== "private" ? [data.sharedClubId] : [],
    };

    // Check if updating existing entry
    if (data.id) {
      updateEntryMutation.mutate({ id: data.id, entry });
    } else {
      createEntryMutation.mutate(entry);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold text-muted-foreground">Lab Notes</h1>
          <p className="text-lg text-muted-foreground">
            Your private record of experiments, discoveries, and daily vibes.
          </p>
        </div>
        
        {/* Action Buttons - Hidden when in practice mode */}
        {!isPracticing && (
          <div className="flex gap-3">
              <Button 
                  className="gap-2"
                  onClick={() => setIsPracticing(true)}
              >
                <Heart className="w-4 h-4" /> Daily LOVE Practice
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> New Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <FlaskConical className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Experiment Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Discovery Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Magic Mentor Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        )}

        {isPracticing ? (
          // Show the blank/new card when practicing
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setIsPracticing(false)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ChevronLeft className="w-4 h-4" /> Back to Notes
                </Button>
             </div>
             <ActivePracticeCard 
               data={practiceData}
               onComplete={handlePracticeComplete} 
             />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Day Fully Completed Success Card */}
            {dayCompleted && (
               <Card className="border-none shadow-sm bg-green-50 dark:bg-green-900/10 border-green-200 mb-8">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-green-800 font-serif">Day Complete!</h2>
                  <p className="text-green-700 mb-4 font-serif text-lg">Way to go, VIP! You've earned 100 Sats.</p>
                  <div className="flex justify-center gap-2">
                      {practiceData?.values?.map((v: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 border-green-200">{v}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-end border-b border-border/40 pb-0">
                <TabsList className="bg-transparent p-0 h-auto -mb-px flex-wrap justify-start gap-6">
                  <TabsTrigger 
                    value="all" 
                    className="px-0 py-3 bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground transition-all"
                  >
                    All Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="daily-practice" 
                    className="px-0 py-3 gap-2 bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Heart className="w-3 h-3" strokeWidth={1.5} /> Daily LOVE Practice
                  </TabsTrigger>
                  <TabsTrigger 
                    value="experiments" 
                    className="px-0 py-3 gap-2 bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground transition-all"
                  >
                    <FlaskConical className="w-3 h-3" strokeWidth={1.5} /> Experiments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discoveries" 
                    className="px-0 py-3 gap-2 bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Lightbulb className="w-3 h-3" strokeWidth={1.5} /> Discoveries
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 pb-2 w-full sm:w-auto relative">
                    <Search className="w-4 h-4 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-[65%]" />
                    <Input placeholder="Search..." className="h-8 w-full sm:w-40 bg-transparent border border-border/40 focus-visible:ring-0 pl-9 pr-3 placeholder:text-muted-foreground/50 rounded-md" />
                </div>
              </div>

              {/* Helper to render entry list */}
              {["all", "daily-practice", "experiments", "discoveries"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="space-y-6">
                  <div className="grid gap-6">
                    {entries
                      .filter(e => 
                        tabValue === "all" 
                        ? true 
                        : tabValue === "experiments" 
                          ? e.type === "experiment"
                          : tabValue === "discoveries"
                            ? e.type === "discovery"
                            : e.type === tabValue
                      )
                      .map((entry) => (
                      <Card 
                        key={entry.id} 
                        className="border-none shadow-sm hover:shadow-md transition-all group bg-card cursor-pointer"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <CardContent className="p-6">
                          {/* Date & Edit Header */}
                          <div className="flex justify-between items-start mb-3 border-b border-border/10 pb-2">
                            <div className="space-y-1">
                               {entry.type === 'daily-practice' && (
                                   <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                      <Heart className="w-3 h-3" strokeWidth={1.5} />
                                      <span className="text-xs font-medium">Daily LOVE Practice</span>
                                   </div>
                               )}
                               {entry.type === 'experiment' && (
                                   <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                      <FlaskConical className="w-3 h-3" strokeWidth={1.5} />
                                      <span className="text-xs font-medium">Experiments</span>
                                   </div>
                               )}
                               {entry.type === 'discovery' && (
                                   <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                      <Lightbulb className="w-3 h-3" strokeWidth={1.5} />
                                      <span className="text-xs font-medium">Discoveries</span>
                                   </div>
                               )}
                               <div className="text-lg font-serif font-bold text-foreground">{entry.date}</div>
                               {/* Time removed as requested */}
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Show Lock if Private (or default) */}
                                {(entry.sharedClubId === 'private' || !entry.sharedClubId) && (
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (entry.type === 'daily-practice') {
                                            setPracticeData(entry);
                                            setIsPracticing(true);
                                        }
                                    }}
                                >
                                    <PenLine className="w-4 h-4" />
                                </Button>
                            </div>
                          </div>

                          {/* Content Render based on Type */}
                          {entry.type === 'daily-practice' ? (
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
                                {/* Col 1: Morning Alignment */}
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Morning Alignment</span>
                                    </div>
                                    
                                    {/* Morning Vibe */}
                                    <div className="bg-white/50 rounded-xs px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                                        <div className="text-[15px] font-bold text-muted-foreground">Morning Vibe</div>
                                        <div className="w-16 h-8 flex items-center justify-end text-lg font-medium font-serif text-muted-foreground">
                                            {entry.morningVibe || entry.vibe}
                                        </div>
                                    </div>

                                    {/* Morning Gratitude */}
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label className="text-[15px] font-bold text-muted-foreground block pl-3">Morning Gratitude</label>
                                        <div className="flex-1 bg-white border border-muted/50 rounded-xs overflow-hidden flex flex-col shadow-sm p-3">
                                            <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                                "{entry.gratitude || "Grateful for this day..."}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Col 2: Focus & Action (Middle) */}
                                <div className="flex flex-col space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full relative shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Vision</span>
                                    </div>

                                    {/* Focus Area */}
                                    <div className="space-y-2">
                                        <label className="text-[15px] font-bold text-muted-foreground block mt-2.5 pl-3">Big Dream</label>
                                        {entry.focusArea && (
                                            <div className="w-full bg-white border border-muted/50 font-serif shadow-sm text-left whitespace-normal rounded-md p-3 min-h-[3rem]">
                                                <div className="flex flex-col gap-2 w-full text-left">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.focusArea.color }} />
                                                            <span className="text-[11px] font-bold text-muted-foreground uppercase font-serif">{entry.focusArea.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground font-serif">{entry.focusArea.progress}%</span>
                                                    </div>
                                                    
                                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${entry.focusArea.progress}%`, backgroundColor: entry.focusArea.color }} />
                                                    </div>
                                                    
                                                    <p className="text-xs font-serif text-muted-foreground italic leading-relaxed opacity-80 whitespace-normal">
                                                        "{entry.focusArea.dream}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Values (Action Steps) */}
                                    <div className="space-y-3 flex-1 pt-2">
                                        <div className="text-[15px] font-bold text-muted-foreground flex justify-between pl-3">
                                            <span>Value (3 Actions)</span>
                                        </div>
                                        <div className="space-y-3">
                                            {[entry.value, "Review goals", "Meditate 10m"].map((val, idx) => (
                                                <div key={idx} className="flex gap-3 items-center group">
                                                    <div className="w-6 h-6 rounded-full bg-green-500 border border-green-500 flex items-center justify-center shrink-0 shadow-sm">
                                                        <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                                                    </div>
                                                    <div className="h-10 flex items-center bg-white border border-muted/30 rounded-lg px-3 w-full shadow-sm">
                                                        <span className="text-sm font-serif text-green-700 line-through opacity-60 decoration-green-500/30">{val || `Action ${idx + 1}`}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Villain & Tool Inputs - Bottom */}
                                    <div className="space-y-3 pt-4 border-t border-border/10 mt-auto">
                                        <div className="space-y-1">
                                            <label className="text-[15px] font-bold text-muted-foreground pl-3 block">Villain (Obstacle)</label>
                                            <div className="min-h-[2.25rem] flex items-center bg-white border border-muted/50 rounded-md px-3 text-sm font-serif text-muted-foreground shadow-sm py-1">
                                                {entry.villain}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[15px] font-bold text-muted-foreground pl-3 block">Tool (Solution)</label>
                                            <div className="min-h-[2.25rem] flex items-center bg-white border border-muted/50 rounded-md px-3 text-sm font-serif text-muted-foreground shadow-sm py-1">
                                                {entry.tool || "Breathwork"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Col 3: Evening Review */}
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Evening Review</span>
                                    </div>

                                    {/* Evening Vibe */}
                                    <div className="bg-white/50 rounded-xs px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                                        <div className="text-[15px] font-bold text-muted-foreground">Evening Vibe</div>
                                        <div className="w-16 h-8 flex items-center justify-end text-lg font-medium font-serif text-muted-foreground">
                                            {entry.eveningVibe || "-"}
                                        </div>
                                    </div>

                                    {/* Victory Input */}
                                    <div className="space-y-2">
                                        <label className="text-[15px] font-bold text-muted-foreground flex items-center gap-1 pl-3">
                                            <Trophy className="w-3 h-3 text-muted-foreground stroke-[1.5]" /> 
                                            Victory
                                        </label>
                                        <div className="min-h-[2.25rem] flex items-center bg-white border border-muted/50 rounded-md px-3 shadow-sm text-sm font-serif text-muted-foreground py-2 whitespace-pre-wrap h-auto">
                                            {entry.victory}
                                        </div>
                                    </div>

                                    {/* Lessons & Blessings */}
                                    <div className="flex-1 flex flex-col space-y-2 pt-2 border-t border-border/20">
                                        <label className="text-[15px] font-bold text-muted-foreground block pl-3">Lessons & Blessings</label>
                                        <div className="flex-1 w-full min-h-[150px] bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                            <p className="text-sm font-serif text-muted-foreground leading-6 whitespace-pre-wrap">
                                                {entry.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                              </div>
                          ) : entry.type === 'experiment' ? (
                             /* Experiment Layout */
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FlaskConical className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Hypothesis</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.hypothesis}"
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Observation</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.observation}"
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Conclusion</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.conclusion}"
                                        </p>
                                    </div>
                                </div>
                             </div>
                          ) : (
                             /* Discovery Layout */
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lightbulb className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Aha! Moment</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.ahaMoment}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BookOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Context</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.context}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Play className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Action Item</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-muted/50 rounded-xs p-3 shadow-sm">
                                        <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                                            "{entry.actionItem}"
                                        </p>
                                    </div>
                                </div>
                             </div>
                          )}
                        </CardContent>
                      </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
      <EntryDetailModal 
        entry={selectedEntry} 
        isOpen={!!selectedEntry} 
        onClose={() => setSelectedEntry(null)}
        onShare={handleShareEntry}
        canShare={isConnected}
      />

      {shareDialog.entry && (
        <ShareConfirmationDialog
          open={shareDialog.open}
          onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}
          contentType="journal"
          contentTitle={`Daily LOVE Practice - ${shareDialog.entry.date}`}
          contentPreview={shareDialog.entry.gratitude || shareDialog.entry.vision || shareDialog.entry.content}
        />
      )}
    </Layout>
  );
}

