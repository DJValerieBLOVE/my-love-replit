import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, CheckCircle, PenLine } from "lucide-react";
import { useState } from "react";
import { FiveVsWizard } from "@/components/daily-practice/five-vs-wizard";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function BigDreams() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsPracticing(false);
    setIsCompleted(true);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-12">
        {!isPracticing && (
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Big Dreams</h1>
            <p className="text-lg text-muted-foreground">
              "The future belongs to those who believe in the beauty of their dreams."
            </p>
          </div>
        )}

        {isPracticing ? (
          <FiveVsWizard onComplete={handleComplete} />
        ) : (
          <div className="space-y-12">
            {/* Section 1: Daily 5 V's */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Daily Practice
              </h2>
              {!isCompleted ? (
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Morning 5 V's</h3>
                    <p className="text-muted-foreground mb-6">Set your vibe, vision, and victory for the day.</p>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
                      onClick={() => setIsPracticing(true)}
                    >
                      <Sparkles className="w-4 h-4" /> Start Daily Practice
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-none shadow-sm bg-green-50 dark:bg-green-900/10 border-green-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-green-800">Practice Complete!</h3>
                    <p className="text-green-700 mb-0">Way to go, VIP! You've earned 100 Sats.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Section 2: My 11 Big Dreams */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> My 11 Big Dreams
                </h2>
                <span className="text-sm text-muted-foreground">Update your vision for each dimension</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {LOVE_CODE_AREAS.map((area) => (
                  <Card key={area.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                    <div className={cn("h-2 w-full", area.color)} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-serif">{area.name}</CardTitle>
                        <span className="text-xs font-bold text-muted-foreground">{area.progress}% Realized</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={area.progress} className="h-2" />
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Vision</label>
                        <Textarea 
                          placeholder={`What is your big dream for your ${area.name.toLowerCase()}?`}
                          className="min-h-[80px] bg-muted/30 border-muted focus:bg-background resize-none text-sm"
                        />
                      </div>
                      <div className="flex justify-end">
                         <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                           Save Vision
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 3: Journal Entries */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-primary" /> Journal Entries
                </h2>
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-none shadow-sm hover:bg-muted/20 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg">Lab Note: Day {i}</h4>
                          <p className="text-sm text-muted-foreground">November {28 - i}, 2025</p>
                        </div>
                        <div className="flex gap-2">
                           <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Vibe: 8</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        My focus today was on connection. I noticed that when I paused to breathe before responding to emails, I felt much more grounded and capable. The experiment with the morning cold plunge is getting easier...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
