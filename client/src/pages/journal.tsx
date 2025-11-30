import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Sparkles, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FiveVsWizard } from "@/components/daily-practice/five-vs-wizard";
import { useState } from "react";
import WhiteLogo from "@assets/white transparent vector and png art  11x LOVE logo _1764365495719.png";

export default function LabNotes() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsPracticing(false);
    setIsCompleted(true);
  };

  const entries = [
    {
      id: 1,
      date: "Today, Nov 28",
      vibe: 8,
      vision: "Focus on connection and clarity.",
      villain: "Distraction",
      value: "Presence",
      victory: "Completed the team briefing early.",
      content: "My focus today was on connection. I noticed that when I paused to breathe before responding to emails, I felt much more grounded and capable. The experiment with the morning cold plunge is getting easier...",
      tags: ["Daily 5 V's", "Experiment"]
    },
    {
      id: 2,
      date: "Yesterday, Nov 27",
      vibe: 6,
      vision: "Finish the quarterly report.",
      villain: "Procrastination",
      value: "Discipline",
      victory: "Wrote 500 words.",
      content: "Felt a bit sluggish this morning. Need to prioritize sleep. The 'Villain' of procrastination showed up around 2pm, but I used the 5-second rule to break through.",
      tags: ["Daily 5 V's"]
    },
    {
      id: 3,
      date: "Nov 26",
      vibe: 9,
      vision: "Celebrate the small wins.",
      villain: "Doubt",
      value: "Joy",
      victory: "Hosted a great dinner.",
      content: "Incredible energy today! The morning practice really set the tone. I felt a deep sense of gratitude for the community.",
      tags: ["Daily 5 V's", "Gratitude"]
    }
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground mb-2">Lab Notes</h1>
            <p className="text-lg text-muted-foreground">
              Your private record of experiments, discoveries, and daily vibes.
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => setIsPracticing(true)}
          >
            <PenLine className="w-4 h-4" /> New Entry
          </Button>
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

            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-lg border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search your notes..." className="pl-9 bg-background/50 border-muted text-[16px]" />
              </div>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" /> Date Range
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>

            <div className="grid gap-6">
              {entries.map((entry) => (
                <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-all group bg-card">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Col 1: As Is (Meta Data) */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div>
                          <div className="font-bold text-lg text-muted-foreground font-serif">{entry.date}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1 font-serif">10:42 AM</div>
                        </div>
                        
                        <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
                          <div className="text-xs font-bold text-muted-foreground uppercase mb-1 font-serif">Vibe</div>
                          <div className="text-2xl font-black text-primary font-serif">{entry.vibe}<span className="text-sm text-muted-foreground font-medium">/10</span></div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 text-[10px] font-serif">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Col 2: Input Prompt (Content) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Reflection</label>
                        <p className="text-base leading-relaxed text-muted-foreground font-serif italic">
                          "{entry.content}"
                        </p>
                      </div>

                      {/* Col 3: 5 V's List */}
                      <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50 h-fit">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
