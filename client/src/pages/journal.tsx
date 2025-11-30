import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Sparkles, CheckCircle, Beaker, Lightbulb, Plus } from "lucide-react";
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
      vibe: 8,
      vision: "Focus on connection and clarity.",
      villain: "Distraction",
      value: "Presence",
      victory: "Completed the team briefing early.",
      content: "My focus today was on connection. I noticed that when I paused to breathe before responding to emails, I felt much more grounded and capable. The experiment with the morning cold plunge is getting easier...",
      tags: ["Daily 5 V's"]
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
      vibe: 9,
      vision: "Celebrate the small wins.",
      villain: "Doubt",
      value: "Joy",
      victory: "Hosted a great dinner.",
      content: "Incredible energy today! The morning practice really set the tone. I felt a deep sense of gratitude for the community.",
      tags: ["Daily 5 V's"]
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Entry
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsPracticing(true)}>
                <Sparkles className="w-4 h-4 mr-2 text-primary" /> Daily 5 V's Practice
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Beaker className="w-4 h-4 mr-2 text-secondary" /> Log Experiment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" /> Note Discovery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isPracticing ? (
          <FiveVsWizard onComplete={handleComplete} />
        ) : (
          <div className="space-y-8">
            {/* Daily Practice Prompt */}
            {!isCompleted && (
              <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-muted-foreground">Morning 5 V's</h2>
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
                    <CheckCircle className="w-8 h-8 text-green-600" />
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
                    <Sparkles className="w-3 h-3" /> Daily Practice
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Beaker className="w-3 h-3" /> Experiments
                  </TabsTrigger>
                  <TabsTrigger value="discoveries" className="px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Lightbulb className="w-3 h-3" /> Discoveries
                  </TabsTrigger>
                </TabsList>

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
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Col 1: Meta Data */}
                            <div className="flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {entry.type === 'daily-practice' && <Sparkles className="w-3 h-3 text-primary" />}
                                  {entry.type === 'experiment' && <Beaker className="w-3 h-3 text-secondary" />}
                                  {entry.type === 'discovery' && <Lightbulb className="w-3 h-3 text-yellow-500" />}
                                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                    {entry.type === 'daily-practice' ? "Daily 5 V's" : entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                  </span>
                                </div>
                                <div className="font-bold text-lg text-muted-foreground font-serif">{entry.date}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1 font-serif">{entry.time}</div>
                              </div>
                              
                              {entry.type === 'daily-practice' && (
                                <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
                                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1 font-serif">Vibe</div>
                                  <div className="text-2xl font-black text-primary font-serif">{entry.vibe}<span className="text-sm text-muted-foreground font-medium">/10</span></div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {entry.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 text-[10px] font-serif">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Col 2: Content Preview */}
                            <div className="space-y-2">
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

