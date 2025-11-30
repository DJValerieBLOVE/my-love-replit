import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Heart, CheckCircle, Beaker, Lightbulb, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiveVsWizard } from "@/components/daily-practice/five-vs-wizard";
import { useState } from "react";
import WhiteLogo from "@assets/white transparent vector and png art  11x LOVE logo _1764365495719.png";
import { EntryDetailModal, JournalEntry } from "@/components/journal/entry-detail-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LabNotes() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleComplete = () => {
    setIsPracticing(false);
    setIsCompleted(true);
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
          <FiveVsWizard onComplete={handleComplete} />
        ) : (
          <div className="space-y-8">
            {/* Daily Practice Prompt */}
            {!isCompleted && (
              <Card className="border-none shadow-sm bg-muted/30">
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
            )}
            
            {isCompleted && (
               <Card className="border-none shadow-sm bg-green-50 dark:bg-green-900/10 border-green-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-green-800">Practice Complete!</h2>
                  <p className="text-green-700 mb-0">Way to go, VIP! You've earned 100 Sats.</p>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <TabsList className="bg-[#FAFAFA] p-1 h-auto flex-wrap justify-start">
                  <TabsTrigger value="all" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">All Notes</TabsTrigger>
                  <TabsTrigger value="daily-practice" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /> Daily LOVE Practice
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Beaker className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /> Experiments
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
                      <Beaker className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Log Experiment
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                      <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Note Discovery
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
                          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1fr] gap-8">
                            {/* Col 1: Meta Data */}
                            <div className="flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {entry.type === 'daily-practice' && <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />}
                                  {entry.type === 'experiment' && <Beaker className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />}
                                  {entry.type === 'discovery' && <Lightbulb className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />}
                                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mt-[1px]">
                                    {entry.type === 'daily-practice' ? "Daily LOVE Practice" : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                  </span>
                                </div>
                                <div className="text-lg text-muted-foreground font-serif">{entry.date}</div>
                              </div>
                              
                              {entry.type === 'daily-practice' && (
                                <div className="space-y-2">
                                  <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10 flex justify-between items-center px-3">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif">Morning Vibe</div>
                                    <div className="text-lg font-black text-primary font-serif">{entry.morningVibe || entry.vibe}<span className="text-[10px] text-muted-foreground font-medium">/10</span></div>
                                  </div>
                                  <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10 flex justify-between items-center px-3">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif">Evening Vibe</div>
                                    <div className="text-lg font-black text-primary font-serif">{entry.eveningVibe || "-"}<span className="text-[10px] text-muted-foreground font-medium">/10</span></div>
                                  </div>
                                  
                                  {entry.focusArea && (
                                    <div className="bg-muted/20 rounded-lg p-3 border border-border/50 mt-2 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Focus: <span style={{ color: entry.focusArea.color }}>{entry.focusArea.name}</span></div>
                                      </div>
                                      <div className="text-xs font-serif text-muted-foreground italic leading-relaxed">
                                        "{entry.focusArea.dream}"
                                      </div>
                                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${entry.focusArea.progress}%`, backgroundColor: entry.focusArea.color }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Col 2: Content Preview */}
                            <div className="space-y-2 pt-[3px]">
                              {entry.type === 'experiment' ? (
                                <>
                                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hypothesis</label>
                                  <p className="text-base font-bold font-serif mb-2">{entry.experimentTitle}</p>
                                  <p className="text-base leading-relaxed text-muted-foreground font-serif italic line-clamp-3">
                                    "{entry.hypothesis}"
                                  </p>
                                </>
                              ) : entry.type === 'discovery' ? (
                                <>
                                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">"Aha!" Moment</label>
                                   <p className="text-base leading-relaxed text-foreground font-serif font-medium italic line-clamp-3">
                                    "{entry.ahaMoment}"
                                  </p>
                                </>
                              ) : (
                                <>
                                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Reflection</label>
                                  <p className="text-base leading-relaxed text-muted-foreground font-serif italic line-clamp-4">
                                    "{entry.content}"
                                  </p>
                                </>
                              )}
                            </div>

                            {/* Col 3: Key Details List */}
                            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50 h-fit">
                              {entry.type === 'daily-practice' && (
                                <>
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Vision</div>
                                    <div className="text-sm font-serif text-muted-foreground whitespace-normal">{entry.vision}</div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Value</div>
                                    <div className="text-sm font-serif text-muted-foreground whitespace-normal">{entry.value}</div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Villain</div>
                                    <div className="text-sm font-serif text-red-500 whitespace-normal">{entry.villain}</div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Victory</div>
                                    <div className="text-sm font-serif text-green-600 whitespace-normal">{entry.victory}</div>
                                  </div>
                                </>
                              )}

                              {entry.type === 'experiment' && (
                                <>
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Observation</div>
                                    <div className="text-sm font-serif text-muted-foreground whitespace-normal line-clamp-2">{entry.observation}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Conclusion</div>
                                    <div className="text-sm font-serif text-muted-foreground whitespace-normal line-clamp-2">{entry.conclusion}</div>
                                  </div>
                                </>
                              )}

                              {entry.type === 'discovery' && (
                                <>
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Context</div>
                                    <div className="text-sm font-serif text-muted-foreground whitespace-normal">{entry.context}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Action Item</div>
                                    <div className="text-sm font-serif text-primary whitespace-normal font-medium">{entry.actionItem}</div>
                                  </div>
                                </>
                              )}
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

