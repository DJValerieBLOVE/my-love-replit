import Layout from "@/components/layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Share2, Heart, Plus, Calendar, FlaskConical, ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LOVE_CODE_AREAS, ELEVEN_DIMENSIONS, EVENTS } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { StreakGrid } from "@/components/streak-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDreams, getAreaProgress, saveDream, getAllExperiments } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { toast } from "sonner";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { Link } from "wouter";
import type { Experiment } from "@shared/schema";

export default function BigDreams() {
  const queryClient = useQueryClient();
  const { isConnected, userStats } = useNostr();
  const [editingDreams, setEditingDreams] = useState<Record<string, string>>({});
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    areaName: string;
    dreamText: string;
    progress: number;
  }>({ open: false, areaName: "", dreamText: "", progress: 0 });

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

  const { data: experiments = [] } = useQuery({
    queryKey: ["experiments"],
    queryFn: getAllExperiments,
  });

  const saveDreamMutation = useMutation({
    mutationFn: ({ areaId, dream }: { areaId: string; dream: string }) => saveDream(areaId, dream),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dreams"] });
      toast.success("Dream saved!");
    },
    onError: () => { toast.error("Failed to save dream"); },
  });

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

  const currentStreak = userStats?.streak || 0;
  const upcomingEvents = EVENTS.slice(0, 3);
  const recentExperiments = (experiments as Experiment[]).slice(0, 3);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">

        <div>
          <h1 className="text-2xl font-serif font-normal text-muted-foreground" data-testid="text-greeting">
            {getTimeGreeting()}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="overflow-hidden bg-gradient-to-r from-[#6600ff]/5 to-[#cc00ff]/5 border-purple-200/50" data-testid="card-daily-practice">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6600ff] to-[#cc00ff] flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-normal font-serif" data-testid="text-daily-practice-title">Daily LOVE Practice</h2>
                  <p className="text-sm text-muted-foreground">
                    Your daily check-in for growth and reflection
                  </p>
                </div>
              </div>
              <Link href="/daily-practice">
                <Button size="lg" className="gap-2" data-testid="button-start-practice">
                  <Plus className="w-5 h-5" /> Start Today's Practice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4" data-testid="card-streak">
          <StreakGrid currentStreak={currentStreak} longestStreak={30} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal font-serif text-muted-foreground flex items-center gap-2">
                <Target className="w-5 h-5" /> My 11 Big Dreams
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {dreamsLoading || progressLoading ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">Loading your dreams...</div>
              ) : (
                LOVE_CODE_AREAS.map((area) => {
                  const currentDream = dreamsByArea[area.id] || "";
                  const currentProgress = progressByArea[area.id] || 0;
                  const editingDream = editingDreams[area.id] ?? currentDream;

                  return (
                    <Card key={area.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group" data-testid={`card-dream-${area.id}`}>
                      <div className={cn("h-[2px] w-full", area.color)} />
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-normal font-serif text-muted-foreground">{area.name}</CardTitle>
                            <span className="text-xs font-normal text-muted-foreground">{currentProgress}%</span>
                          </div>
                          <Progress value={currentProgress} className="h-1.5" indicatorClassName={area.color} />

                          <Textarea
                            placeholder={`Your big dream for ${area.name.toLowerCase()}...`}
                            className="min-h-[70px] bg-muted/30 border-muted focus:bg-background resize-none text-sm font-serif"
                            value={editingDream}
                            onChange={(e) => handleDreamChange(area.id, e.target.value)}
                            data-testid={`textarea-dream-${area.id}`}
                          />

                          <div className="flex justify-end gap-2">
                            {isConnected && currentDream && currentProgress > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShareDialog({ open: true, areaName: area.name, dreamText: currentDream, progress: currentProgress })}
                                className="text-muted-foreground text-xs"
                                data-testid={`button-share-dream-${area.id}`}
                              >
                                <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveDream(area.id)}
                              disabled={saveDreamMutation.isPending}
                              className="text-xs"
                              data-testid={`button-save-dream-${area.id}`}
                            >
                              {saveDreamMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            {recentExperiments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> Experiment Progress
                  </h3>
                  <Link href="/experiments">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" data-testid="link-all-experiments">
                      View all <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentExperiments.map((exp) => {
                    const mods = exp.modules as any[] | null;
                    const totalSteps = mods ? mods.reduce((sum: number, m: any) => sum + (m.steps?.length || 0), 0) : 0;
                    const completedSteps = 0;
                    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                      <Link key={exp.id} href={`/experiments/${exp.id}`}>
                        <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer group" data-testid={`card-experiment-${exp.id}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-normal text-sm truncate group-hover:text-primary transition-colors flex-1 min-w-0">{exp.title}</h4>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{completedSteps}/{totalSteps}</span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {exp.dimension ? ELEVEN_DIMENSIONS.find(d => d.id === exp.dimension)?.name : ""}
                          </p>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-normal text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Upcoming Events
                </h3>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" data-testid="link-all-events">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer group" data-testid={`card-event-${event.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-normal text-sm truncate group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {event.date} · {event.time}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareConfirmationDialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}
        contentType="dream"
        contentTitle={`${shareDialog.areaName} Dream (${shareDialog.progress}% Realized)`}
        contentPreview={shareDialog.dreamText}
      />
    </Layout>
  );
}
