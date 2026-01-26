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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDreams, getAreaProgress, saveDream } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { toast } from "sonner";

export default function BigDreams() {
  const queryClient = useQueryClient();
  const { isConnected } = useNostr();
  const [editingDreams, setEditingDreams] = useState<Record<string, string>>({});

  // Fetch dreams and area progress from API
  const { data: dreams = [], isLoading: dreamsLoading } = useQuery({
    queryKey: ["dreams"],
    queryFn: () => getDreams(),
    enabled: isConnected,
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["areaProgress"],
    queryFn: () => getAreaProgress(),
    enabled: isConnected,
  });

  // Mutation to save dream
  const saveDreamMutation = useMutation({
    mutationFn: ({ areaId, dream }: { areaId: string; dream: string }) =>
      saveDream(areaId, dream),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      toast.success("Dream saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save dream");
    },
  });

  // Create lookup maps for dreams and progress
  const dreamsByArea = dreams.reduce((acc: any, dream: any) => {
    acc[dream.areaId] = dream.dream;
    return acc;
  }, {});

  const progressByArea = progress.reduce((acc: any, p: any) => {
    acc[p.areaId] = p.progress;
    return acc;
  }, {});

  const handleSaveDream = (areaId: string) => {
    const dreamText = editingDreams[areaId];
    if (dreamText?.trim()) {
      saveDreamMutation.mutate({ areaId, dream: dreamText });
    }
  };

  const handleDreamChange = (areaId: string, value: string) => {
    setEditingDreams(prev => ({ ...prev, [areaId]: value }));
  };
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
                  <Target className="w-5 h-5" /> My 11 Big Dreams
                </h2>
                <span className="text-sm text-muted-foreground">Update your vision for each dimension</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {dreamsLoading || progressLoading ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">Loading your dreams...</div>
                ) : (
                  LOVE_CODE_AREAS.map((area) => {
                    const currentDream = dreamsByArea[area.id] || "";
                    const currentProgress = progressByArea[area.id] || 0;
                    const editingDream = editingDreams[area.id] ?? currentDream;

                    return (
                      <Card key={area.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                        <div className={cn("h-[2px] w-full", area.color)} />
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                              <CardTitle className="text-xl font-bold font-serif text-muted-foreground">{area.name}</CardTitle>
                              <span className="text-sm font-bold text-muted-foreground">{currentProgress}% Realized</span>
                            </div>
                            <Progress value={currentProgress} className="h-2" indicatorClassName={area.color} />
                            
                            <div className="pt-2">
                              <Textarea 
                                placeholder={`What is your big dream for your ${area.name.toLowerCase()}?`}
                                className="min-h-[100px] bg-muted/30 border-muted focus:bg-background resize-none text-sm font-serif"
                                value={editingDream}
                                onChange={(e) => handleDreamChange(area.id, e.target.value)}
                              />
                            </div>

                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSaveDream(area.id)}
                                disabled={saveDreamMutation.isPending}
                              >
                                {saveDreamMutation.isPending ? "Saving..." : "Save Vision"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </section>
          </div>
      </div>
    </Layout>
  );
}
