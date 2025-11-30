import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Heart, CheckCircle, FlaskConical, Lightbulb, Plus, Sparkles, Beaker, Quote, Play, X, Moon, Sun, BookOpen, Trophy, Eye, ChevronLeft } from "lucide-react";
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

export default function LabNotes() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceData, setPracticeData] = useState<any>(null);
  const [dayCompleted, setDayCompleted] = useState(false);
  // Removed isEveningModalOpen since we use the card now

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('startPractice') === 'true') {
      setIsPracticing(true);
    }
  }, []);


  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showMissedCheckinAlert, setShowMissedCheckinAlert] = useState(true); 
  const todaysPlaylist = getPlaylistForToday();

  const handlePracticeComplete = (data: any) => {
    setIsPracticing(false);
    setPracticeData(data);
    
    // Trigger confetti for morning practice complete
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleEveningComplete = (eveningData: any) => {
      setDayCompleted(true);
      // Here we would normally save everything to the backend
      console.log("Full Day Data:", { ...practiceData, ...eveningData });
  };

  const entries: JournalEntry[] = [
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
      tags: ["Daily LOVE Practice"]
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
      date: "Nov 25",
      time: "2:00 PM",
      ahaMoment: "Lightning Network is just an abacus for energy.",
      context: "Reading the Bitcoin Standard while hiking.",
      actionItem: "Write a blog post about energy transfer.",
      content: "It clicked when I was looking at the stream. Money flows like water. Lightning channels are just directing that flow without moving the entire ocean (chain).",
      tags: ["Discovery", "Bitcoin"]
    }
  ];

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
        
        {/* Action Buttons */}
        <div className="flex gap-3">
            <Button 
                className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md"
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

        {isPracticing ? (
          // Show the blank/new card when practicing
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setIsPracticing(false)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ChevronLeft className="w-4 h-4" /> Back to Notes
                </Button>
             </div>
             <ActivePracticeCard 
               onComplete={handlePracticeComplete} 
             />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Practice Card (Replaces static card + modal) */}
            {practiceData && !dayCompleted && (
               <ActivePracticeCard 
                 data={practiceData} 
                 onComplete={handleEveningComplete} 
               />
            )}

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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <PenLine className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Content Render based on Type */}
                          {entry.type === 'daily-practice' ? (
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                                {/* Col 1: Morning Alignment */}
                                <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mt-[1px]">
                                        Morning Alignment
                                      </span>
                                    </div>
                                  
                                      <div className="space-y-6">
                                        {/* Morning Vibe */}
                                        <div className="bg-white/50 rounded-xl h-10 px-3 border border-border/40 flex justify-between items-center">
                                          <div className="text-[15px] font-bold text-muted-foreground">Morning Vibe</div>
                                          <div className="text-lg font-medium text-muted-foreground font-serif">{entry.morningVibe || entry.vibe}<span className="text-[10px] text-muted-foreground font-medium">/11</span></div>
                                        </div>

                                        {/* Gratitude */}
                                         <div className="flex-1">
                                            <div className="text-[15px] font-bold text-muted-foreground mb-2 pl-3">Morning Gratitude</div>
                                            <div className="text-sm font-serif text-muted-foreground whitespace-normal italic leading-relaxed pl-3">"{entry.gratitude || "Grateful for this day..."}"</div>
                                        </div>
                                      </div>
                                  </div>
                                </div>

                                {/* Col 2: Focus & Action (Middle) */}
                                <div className="flex flex-col space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full relative shadow-sm">
                                       <div className="flex items-center gap-2 mb-2">
                                          <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Vision</span>
                                       </div>

                                       <div className="flex flex-col h-full justify-between">
                                          <div className="space-y-6">
                                              {/* Focus Area */}
                                              {entry.focusArea && (
                                                <div className="bg-white/30 rounded-lg p-3 border border-border/20 space-y-2">
                                                  <div className="flex items-center justify-between mb-1 pt-1">
                                                    <div className="text-[15px] font-bold text-muted-foreground font-serif">Big Dream: <span style={{ color: entry.focusArea.color }}>{entry.focusArea.name}</span></div>
                                                    <div className="text-[10px] font-bold text-muted-foreground font-serif">{entry.focusArea.progress}%</div>
                                                  </div>
                                                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-2">
                                                    <div className="h-full rounded-full" style={{ width: `${entry.focusArea.progress}%`, backgroundColor: entry.focusArea.color }} />
                                                  </div>
                                                  <div className="text-xs font-serif text-muted-foreground italic leading-relaxed opacity-80">
                                                    "{entry.focusArea.dream}"
                                                  </div>
                                                </div>
                                              )}

                                              {/* Values */}
                                              <div>
                                                <div className="text-[15px] font-bold text-muted-foreground mb-2 flex justify-between pl-3">
                                                  <span>Value (3 Actions)</span>
                                                </div>
                                                <div className="space-y-2 pl-3">
                                                    <div className="flex gap-3 items-center opacity-90">
                                                        <div className="w-5 h-5 rounded-full bg-green-500 border border-green-500 flex items-center justify-center shrink-0 shadow-sm">
                                                            <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                        </div>
                                                        <span className="text-sm font-serif text-green-800 line-through opacity-70">{entry.value || "Action 1"}</span>
                                                    </div>
                                                    <div className="flex gap-3 items-center opacity-90">
                                                        <div className="w-5 h-5 rounded-full bg-green-500 border border-green-500 flex items-center justify-center shrink-0 shadow-sm">
                                                            <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                        </div>
                                                        <span className="text-sm font-serif text-green-800 line-through opacity-70">Review goals</span>
                                                    </div>
                                                    <div className="flex gap-3 items-center opacity-90">
                                                        <div className="w-5 h-5 rounded-full bg-green-500 border border-green-500 flex items-center justify-center shrink-0 shadow-sm">
                                                            <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                        </div>
                                                        <span className="text-sm font-serif text-green-800 line-through opacity-70">Meditate 10m</span>
                                                    </div>
                                                </div>
                                              </div>
                                          </div>

                                          {/* Villain at the bottom */}
                                          <div className="mt-6 pt-4 border-t border-border/10">
                                              <div className="text-[15px] font-bold text-muted-foreground mb-1 pl-3">Villain (Obstacle)</div>
                                              <div className="text-sm font-serif text-muted-foreground whitespace-normal pl-3">{entry.villain}</div>
                                          </div>
                                       </div>
                                </div>

                                {/* Col 3: Evening Review (Reflection) */}
                                <div className="flex flex-col h-full bg-muted/5 p-5 rounded-2xl border border-border/20 shadow-sm">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Moon className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                                        Evening Review
                                    </label>
                                    <div className="flex-1">
                                            <div className="flex flex-col h-full space-y-6">
                                               {/* Evening Vibe */}
                                              <div className="bg-white/50 rounded-xl h-10 px-3 border border-border/40 flex justify-between items-center">
                                                <div className="text-[15px] font-bold text-muted-foreground">Evening Vibe</div>
                                                <div className="text-lg font-medium text-muted-foreground font-serif">{entry.eveningVibe || "-"}<span className="text-[10px] text-muted-foreground font-medium">/11</span></div>
                                              </div>

                                               {/* Victory */}
                                              <div>
                                                <div className="text-[15px] font-bold text-muted-foreground mb-1 flex items-center gap-1 pl-3">
                                                    <Trophy className="w-3 h-3 text-muted-foreground" /> Victory
                                                </div>
                                                <div className="text-sm font-serif text-muted-foreground whitespace-normal pl-3">{entry.victory}</div>
                                              </div>

                                               {/* Lessons */}
                                               <div className="pt-2 border-t border-border/20 flex-1">
                                                <div className="text-[15px] font-bold text-muted-foreground mb-1 pl-3">Lessons & Blessings</div>
                                                <p className="text-sm leading-relaxed text-muted-foreground font-serif italic whitespace-pre-wrap pl-3">
                                                  "{entry.content}"
                                                </p>
                                              </div>
                                            </div>
                                    </div>
                                </div>
                              </div>
                          ) : entry.type === 'experiment' ? (
                             /* Experiment Layout */
                             <div className="space-y-6 p-2">
                                <div className="flex items-center gap-2 mb-4">
                                   <Beaker className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                                   <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Experiment Log</span>
                                </div>
                                
                                <div className="bg-secondary/5 p-6 rounded-xl border border-secondary/20">
                                   <h3 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Hypothesis</h3>
                                   <p className="italic text-xl font-serif text-foreground">"{entry.hypothesis}"</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="bg-muted/5 p-5 rounded-xl border border-border/10">
                                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Observation</h4>
                                      <p className="text-sm font-serif text-muted-foreground leading-relaxed">{entry.observation}</p>
                                   </div>
                                   <div className="bg-muted/5 p-5 rounded-xl border border-border/10">
                                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Conclusion</h4>
                                      <p className="text-sm font-serif text-muted-foreground leading-relaxed">{entry.conclusion}</p>
                                   </div>
                                </div>

                                <div className="pt-4 border-t border-border/10">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Additional Notes</h4>
                                    <p className="text-sm font-serif text-muted-foreground leading-relaxed">{entry.content}</p>
                                </div>
                             </div>
                          ) : (
                             /* Discovery Layout */
                             <div className="space-y-6 p-2">
                                <div className="flex items-center gap-2 mb-4">
                                   <Lightbulb className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                                   <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Discovery Note</span>
                                </div>

                                <div className="flex items-start gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                   <Lightbulb className="w-8 h-8 text-yellow-600/80 shrink-0 mt-1" strokeWidth={1.5} />
                                   <div className="space-y-2">
                                     <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">The "Aha!" Moment</h3>
                                     <p className="text-xl font-serif font-medium italic leading-relaxed text-foreground/90">"{entry.ahaMoment}"</p>
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div>
                                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Context</h4>
                                      <p className="text-sm font-serif text-muted-foreground leading-relaxed">{entry.context}</p>
                                   </div>
                                   <div>
                                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Action Item</h4>
                                      <div className="flex items-center gap-3 p-3 bg-muted/10 border border-border/10 rounded-lg">
                                         <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                         <span className="text-sm font-medium">{entry.actionItem}</span>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="pt-4 border-t border-border/10">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Reflection</h4>
                                    <p className="text-sm font-serif text-muted-foreground leading-relaxed">{entry.content}</p>
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
      />
    </Layout>
  );
}

