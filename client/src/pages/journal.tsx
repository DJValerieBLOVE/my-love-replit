import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, PenLine, Sparkles, CheckCircle } from "lucide-react";
import { useState } from "react";
import { FiveVsWizard } from "@/components/daily-practice/five-vs-wizard";

export default function Journal() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsPracticing(false);
    setIsCompleted(true);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        {!isPracticing && (
          <div>
            <h1 className="text-2xl font-serif font-bold">My Journal</h1>
            <p className="text-muted-foreground">Capture your 5 V's and Daily Discoveries.</p>
          </div>
        )}

        {isPracticing ? (
          <FiveVsWizard onComplete={handleComplete} />
        ) : (
          <div className="grid gap-6">
            {/* Daily Practice Prompt */}
            {!isCompleted ? (
              <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Morning 5 V's</h2>
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
                  <h2 className="text-xl font-bold mb-2 text-green-800">Practice Complete!</h2>
                  <p className="text-green-700 mb-0">Way to go, VIP! You've earned 100 Sats.</p>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Recent Entries</h3>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">Lab Note: Day {i}</h4>
                      <span className="text-xs text-muted-foreground">{i} days ago</span>
                    </div>
                    <p className="text-muted-foreground">My focus today was on connection. I noticed that when I paused to breathe...</p>
                    <div className="mt-3 flex gap-2">
                       <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Vibe: 8 (Love)</span>
                       <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Victory: Walking</span>
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
