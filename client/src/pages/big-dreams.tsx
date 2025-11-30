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
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold font-serif text-muted-foreground">{area.name}</CardTitle>
                        <span className="text-xs font-bold text-muted-foreground">{area.progress}% Realized</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={area.progress} className="h-2" indicatorClassName={area.color} />
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Vision</label>
                        <Textarea 
                          placeholder={`What is your big dream for your ${area.name.toLowerCase()}?`}
                          className="min-h-[80px] bg-muted/30 border-muted focus:bg-background resize-none text-base md:text-[16px] font-serif"
                          defaultValue={area.dream}
                        />
                      </div>
                      <div className="flex justify-end">
                         <Button variant="ghost">
                           Save Vision
                         </Button>
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
