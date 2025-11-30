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
import WhiteLogo from "@assets/white transparent vector and png art  11x LOVE logo _1764365495719.png";

export default function BigDreams() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-12">
        <div>
          <h1 className="text-3xl font-serif font-bold text-muted-foreground mb-2">Big Dreams</h1>
          <p className="text-lg text-muted-foreground italic">
            "The future belongs to those who believe in the beauty of their dreams."
          </p>
        </div>

        <div className="space-y-12">
        {/* Removed and moved to Lab Notes */}

        {/* Section 2: My 11 Big Dreams */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
                  <Target className="w-5 h-5 text-primary" /> My 11 Big Dreams
                </h2>
                <span className="text-sm text-muted-foreground">Update your vision for each dimension</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {LOVE_CODE_AREAS.map((area) => (
                  <Card key={area.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                    <div className={cn("h-[2px] w-full", area.color)} />
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Col 1: As Is (Identity & Progress) */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <CardTitle className="text-2xl font-bold font-serif text-muted-foreground">{area.name}</CardTitle>
                            <span className="text-sm font-bold text-muted-foreground">{area.progress}% Realized</span>
                          </div>
                          <Progress value={area.progress} className="h-3" indicatorClassName={area.color} />
                          <div className="text-sm text-muted-foreground italic mt-4">
                            "{area.dream}"
                          </div>
                        </div>

                        {/* Col 2: Input Prompt */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Input Prompt</label>
                          <Textarea 
                            placeholder={`What is your big dream for your ${area.name.toLowerCase()}?`}
                            className="min-h-[120px] bg-muted/30 border-muted focus:bg-background resize-none text-base font-serif"
                            defaultValue={area.dream}
                          />
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm">Save Vision</Button>
                          </div>
                        </div>

                        {/* Col 3: Summary of 5 V's */}
                        <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border/50">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">5 V's Summary</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase">Vision</div>
                              <div className="text-sm font-serif line-clamp-2">{area.dream}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Value</div>
                                <div className="text-sm font-serif text-muted-foreground">{area.value || "Define value..."}</div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Victory</div>
                                <div className="text-sm font-serif text-green-600">{area.victory || "Define victory..."}</div>
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase">Villain</div>
                              <div className="text-sm font-serif text-red-500">{area.villain || "Identify obstacle..."}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
      </div>
    </Layout>
  );
}
