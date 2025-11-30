import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Heart, CheckCircle, FlaskConical, Lightbulb, Plus, Sparkles, Beaker, Quote, Play, X, Moon, Sun, BookOpen, Trophy } from "lucide-react";
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
      date: "Today, Nov 28",
      time: "10:42 AM",
      morningVibe: 8,
      eveningVibe: 9,
      vibe: 8, // Fallback
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
      date: "Yesterday, Nov 27",
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
      date: "Nov 26",
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
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground mb-2">Lab Notes</h1>
            <p className="text-lg text-muted-foreground">
              Your private record of experiments, discoveries, and daily vibes.
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 bg-background/50 border-muted text-[16px] h-9" />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPracticing ? (
          // Show the blank/new card when practicing
          <div className="space-y-8">
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
               <Card className="border-none shadow-sm bg-green-50 dark:bg-green-900/10 border-green-200">
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

            {/* Missed Check-in Alert (Mock) - Only show if we haven't done practice yet */}
            {showMissedCheckinAlert && !practiceData && !dayCompleted && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-3 z-10">
                   <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-muted-foreground">
                     <Moon className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="font-bold text-orange-700 text-sm">Missed your evening vibe check?</h3>
                     <p className="text-orange-600 text-xs">It's okay! Tap here to reflect on yesterday's wins.</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-orange-400 hover:text-orange-600 z-10" onClick={() => setShowMissedCheckinAlert(false)}>
                  <X className="w-4 h-4" />
                </Button>
                {/* Background decoration */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-xl" />
              </div>
            )}

            {/* Daily Practice Prompt & Song of the Day - Only show if we haven't started practice */}
            {!practiceData && !dayCompleted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-muted/30 h-full flex flex-col justify-center">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                      <Heart className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-muted-foreground">Daily LOVE Practice</h2>
                    <p className="text-muted-foreground mb-6">Set your vibe, vision, and victory for the day.</p>
                    <Button 
                      className="gap-2"
                      onClick={() => setIsPracticing(true)}
                    >
                      <img src={WhiteLogo} alt="Logo" className="w-4 h-4" /> Start Daily Practice
                    </Button>
                  </CardContent>
                </Card>

                <Card className={`border-none shadow-sm overflow-hidden relative h-64 md:h-auto group ${todaysPlaylist?.bg}`}>
                   <CardContent className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                      <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 ${todaysPlaylist?.color}`}>
                        {todaysPlaylist?.icon && <todaysPlaylist.icon className="w-6 h-6" />}
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Song of the Day</p>
                        <h3 className="font-serif text-2xl font-bold">{todaysPlaylist?.theme}</h3>
                        <p className="text-sm opacity-80 max-w-[80%] mx-auto">{todaysPlaylist?.description}</p>
                      </div>

                      <Button className="rounded-full w-12 h-12 p-0 bg-primary text-white hover:scale-105 transition-transform shadow-lg">
                         <Play className="w-5 h-5 ml-1" />
                      </Button>
                   </CardContent>
                   
                   {/* Decorative circles */}
                   <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </Card>
              </div>
            )}
            
            {/* Removed old isCompleted block since we have new cards above */}
            
            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <TabsList className="bg-[#FAFAFA] p-1 h-auto flex-wrap justify-start">
                  <TabsTrigger value="all" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">All Notes</TabsTrigger>
                  <TabsTrigger value="daily-practice" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /> Daily LOVE Practice
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <FlaskConical className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /> Experiments
                  </TabsTrigger>
                  <TabsTrigger value="discoveries" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Lightbulb className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /> Discoveries
                  </TabsTrigger>
                </TabsList>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" /> New Entry
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem 
                      onClick={() => setIsPracticing(true)}
                      className="focus:bg-love-body/10 focus:text-love-body cursor-pointer"
                    >
                      <Heart className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-love-body" strokeWidth={1.5} /> Daily LOVE Practice
                    </DropdownMenuItem>
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
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                            {/* Col 1: The Compass */}
                            <div className="flex flex-col justify-between space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  {entry.type === 'daily-practice' && <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />}
                                  {entry.type === 'experiment' && <Beaker className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />}
                                  {entry.type === 'discovery' && <Lightbulb className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />}
                                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mt-[1px]">
                                    {entry.type === 'daily-practice' ? "The Compass" : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                  </span>
                                </div>
                                <div className="text-lg text-muted-foreground font-serif mb-4">{entry.date}</div>
                              
                                {entry.type === 'daily-practice' && (
                                  <div className="space-y-4">
                                    {/* Morning Vibe */}
                                    <div className="bg-white/50 rounded-xl p-3 border border-border/40 flex justify-between items-center">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif flex items-center gap-2">
                                          <Sun className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                                          Morning Vibe
                                      </div>
                                      <div className="text-lg font-medium text-muted-foreground font-serif">{entry.morningVibe || entry.vibe}<span className="text-[10px] text-muted-foreground font-medium">/11</span></div>
                                    </div>
                                    
                                    {/* Focus Area */}
                                    {entry.focusArea && (
                                      <div className="bg-white/30 rounded-lg p-3 border border-border/20 space-y-2">
                                         <div className="flex items-center justify-between mb-1">
                                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Big Dream: <span style={{ color: entry.focusArea.color }}>{entry.focusArea.name}</span></div>
                                          <div className="text-[10px] font-medium text-muted-foreground">{entry.focusArea.progress}%</div>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-2">
                                          <div className="h-full rounded-full" style={{ width: `${entry.focusArea.progress}%`, backgroundColor: entry.focusArea.color }} />
                                        </div>
                                        <div className="text-xs font-serif text-muted-foreground italic leading-relaxed opacity-80">
                                          "{entry.focusArea.dream}"
                                        </div>
                                      </div>
                                    )}

                                    {/* Vision & Villain */}
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Vision</div>
                                            <div className="text-sm font-serif text-muted-foreground whitespace-normal italic">"{entry.vision}"</div>
                                        </div>
                                        <div className="pt-2 border-t border-border/20">
                                            <div className="text-[10px] font-bold text-red-900/60 uppercase mb-1">Villain</div>
                                            <div className="text-sm font-serif text-red-800/80 whitespace-normal">{entry.villain}</div>
                                        </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Col 2: The Actions (Middle) */}
                            <div className="flex flex-col space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full">
                               {entry.type === 'daily-practice' ? (
                                 <>
                                   <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">The Actions</span>
                                   </div>

                                   <div className="space-y-4 flex-1">
                                      <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex justify-between">
                                          <span>Values (Actions)</span>
                                          <span className="text-[9px] opacity-50">Done</span>
                                        </div>
                                        <div className="space-y-2">
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

                                   <div className="space-y-4 pt-4 border-t border-border/20">
                                      {/* Evening Vibe */}
                                      <div className="bg-white/50 rounded-xl p-3 border border-border/40 flex justify-between items-center">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif flex items-center gap-2">
                                            <Moon className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                                            Evening Vibe
                                        </div>
                                        <div className="text-lg font-medium text-muted-foreground font-serif">{entry.eveningVibe || "-"}<span className="text-[10px] text-muted-foreground font-medium">/11</span></div>
                                      </div>

                                      {/* Victory */}
                                      <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            <Trophy className="w-3 h-3 text-muted-foreground" /> Victory
                                        </div>
                                        <div className="text-sm font-serif text-muted-foreground whitespace-normal">{entry.victory}</div>
                                      </div>
                                   </div>
                                 </>
                               ) : (
                                 // For other types, just show content
                                 <div className="flex items-center justify-center h-full text-muted-foreground italic font-serif">
                                   See details...
                                 </div>
                               )}
                            </div>

                            {/* Col 3: The Wisdom (Reflection) */}
                            <div className="flex flex-col h-full bg-white p-5 rounded-2xl border border-border/20 shadow-sm">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                                    {entry.type === 'daily-practice' ? "Lessons & Blessings" : "Notes"}
                                </label>
                                <div className="flex-1">
                                    {entry.type === 'experiment' ? (
                                        <>
                                          <p className="text-base font-bold font-serif mb-2">{entry.experimentTitle}</p>
                                          <p className="text-base leading-relaxed text-muted-foreground font-serif italic line-clamp-[10]">
                                            "{entry.hypothesis}" <br/><br/>
                                            {entry.content}
                                          </p>
                                        </>
                                      ) : entry.type === 'discovery' ? (
                                        <>
                                           <p className="text-base leading-relaxed text-foreground font-serif font-medium italic line-clamp-[10]">
                                            "{entry.ahaMoment}" <br/><br/>
                                            {entry.content}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-base leading-relaxed text-muted-foreground font-serif italic whitespace-pre-wrap">
                                          "{entry.content}"
                                        </p>
                                      )}
                                </div>
                            </div>
                          </div>
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

