import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, FlaskConical, Loader2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { useNostr } from "@/contexts/nostr-context";
import { useQuery } from "@tanstack/react-query";
import { getAllExperiments } from "@/lib/api";
import { ELEVEN_DIMENSIONS, EXPERIMENT_TAGS } from "@/lib/mock-data";
import type { Experiment } from "@shared/schema";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "in-progress", label: "In Progress" },
  { id: "my-experiments", label: "My Experiments" },
  { id: "new", label: "New" },
  { id: "all", label: "All" },
  { id: "suggested", label: "Suggested" },
  { id: "complete", label: "Complete" },
];

export default function Grow() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDimension, setSelectedDimension] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    experiment: Experiment | null;
  }>({ open: false, experiment: null });
  const { isConnected, profile } = useNostr();

  const { data: experiments = [], isLoading: experimentsLoading } = useQuery({
    queryKey: ["experiments"],
    queryFn: getAllExperiments,
  });

  const allExperiments = experiments as Experiment[];

  const filteredExperiments = allExperiments.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedDimension !== "all") {
      if (exp.dimension !== selectedDimension) return false;
    }

    if (selectedTag !== "all") {
      const expTags = (exp as any).tags as string[] | null;
      if (!expTags || !expTags.includes(selectedTag)) return false;
    }

    switch (activeTab) {
      case "in-progress":
        return false;
      case "my-experiments":
        return exp.creatorId === profile?.userId;
      case "new":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);
        return exp.createdAt ? new Date(exp.createdAt) >= oneWeekAgo : false;
      case "suggested":
        return true;
      case "complete":
        return false;
      case "all":
      default:
        return true;
    }
  });

  const hasActiveFilters = selectedDimension !== "all" || selectedTag !== "all";
  const selectedDimensionData = ELEVEN_DIMENSIONS.find((d) => d.id === selectedDimension);

  const getDimensionData = (dimensionId: string | null | undefined) => {
    if (!dimensionId) return null;
    return ELEVEN_DIMENSIONS.find((d) => d.id === dimensionId);
  };

  const getTotalStepCount = (exp: Experiment) => {
    const mods = exp.modules as any[] | null;
    if (!mods || !Array.isArray(mods)) return 0;
    return mods.reduce((sum: number, mod: any) => sum + (mod.steps?.length || 0), 0);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-4">
        <div>
          <h1 className="text-2xl font-serif text-muted-foreground" data-testid="text-page-title">Experiments</h1>
          <p className="text-muted-foreground">Skill-building adventures for personal growth</p>
        </div>

        <div className="flex gap-2 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white h-10"
              data-testid="input-search"
            />
          </div>
          <Select value={selectedDimension} onValueChange={setSelectedDimension}>
            <SelectTrigger className="w-[180px] h-10" data-testid="select-dimension">
              <SelectValue>
                {selectedDimension === "all" ? (
                  "All Dimensions"
                ) : selectedDimensionData ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedDimensionData.hex }} />
                    {selectedDimensionData.name}
                  </span>
                ) : (
                  "All Dimensions"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dimensions</SelectItem>
              {ELEVEN_DIMENSIONS.map((dim) => (
                <SelectItem key={dim.id} value={dim.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dim.hex }} />
                    {dim.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[140px] h-10" data-testid="select-tag">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {EXPERIMENT_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedDimension !== "all" && selectedDimensionData && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedDimensionData.hex }} />
                {selectedDimensionData.name}
                <button onClick={() => setSelectedDimension("all")} className="hover:text-foreground" data-testid="clear-dimension">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTag !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white text-muted-foreground">
                {selectedTag}
                <button onClick={() => setSelectedTag("all")} className="hover:text-foreground" data-testid="clear-tag">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setSelectedDimension("all"); setSelectedTag("all"); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
              data-testid="clear-all-filters"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-1.5 flex-wrap items-center">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-colors border",
                activeTab === tab.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"
              )}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
          <Button onClick={() => setLocation("/experiments/create")} className="gap-2 ml-auto" data-testid="button-create-experiment">
            <Plus className="w-4 h-4" /> Create Experiment
          </Button>
        </div>

        {experimentsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredExperiments.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">
              {activeTab === "in-progress" && "No Experiments In Progress"}
              {activeTab === "my-experiments" && "You Haven't Created Any Experiments"}
              {activeTab === "new" && "No New Experiments"}
              {activeTab === "complete" && "No Completed Experiments"}
              {activeTab === "suggested" && "No Suggestions Yet"}
              {activeTab === "all" && "No Experiments Yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "in-progress" && "Start an experiment to track your progress here."}
              {activeTab === "my-experiments" && "Create your first experiment to share with the community."}
              {activeTab === "new" && "Check back soon for new experiments."}
              {activeTab === "complete" && "Complete an experiment to see it here."}
              {activeTab === "suggested" && "Suggestions will appear as you use the platform."}
              {activeTab === "all" && "Be the first to create an experiment!"}
            </p>
            {isConnected && activeTab === "my-experiments" && (
              <Button onClick={() => setLocation("/experiments/create")} className="gap-2">
                <Plus className="w-4 h-4" /> Create Experiment
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => {
              const dimData = getDimensionData(experiment.dimension);
              const stepCount = getTotalStepCount(experiment);
              return (
                <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group border-none shadow-sm bg-card cursor-pointer flex flex-col h-full rounded-xs" data-testid={`card-experiment-${experiment.id}`}>
                    <div className="h-[2px] w-full" style={{ backgroundColor: dimData?.hex || '#6600ff' }} />
                    <div className="relative aspect-video overflow-hidden">
                      {experiment.image ? (
                        <img
                          src={experiment.image}
                          alt={experiment.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F0E6FF] flex items-center justify-center">
                          <FlaskConical className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {dimData && (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground" data-testid={`badge-dimension-${experiment.id}`}>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dimData.hex }} />
                            {dimData.name}
                          </span>
                        )}
                        {((experiment as any).tags as string[] | null)?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground" data-testid={`badge-tag-${experiment.id}`}>
                            {tag}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {stepCount} step{stepCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <h3 className="text-lg leading-tight mb-1 text-muted-foreground group-hover:text-primary transition-colors" data-testid={`text-experiment-${experiment.id}`}>
                        {experiment.title}
                      </h3>
                      {experiment.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{experiment.description}</p>
                      )}

                      <div className="mt-auto">
                        <Button className="w-full gap-2" data-testid={`button-experiment-${experiment.id}`}>
                          <FlaskConical className="w-4 h-4" /> View Experiment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {shareDialog.experiment && (
        <ShareConfirmationDialog
          open={shareDialog.open}
          onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}
          contentType="experiment"
          contentTitle={`Completed: ${shareDialog.experiment.title}`}
          contentPreview={`I just completed the ${shareDialog.experiment.title} experiment! 🎉`}
        />
      )}
    </Layout>
  );
}
