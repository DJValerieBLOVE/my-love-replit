import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Search, Plus, FlaskConical, Loader2, Share2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { useNostr } from "@/contexts/nostr-context";
import { useQuery } from "@tanstack/react-query";
import { getAllExperiments } from "@/lib/api";
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-muted-foreground" data-testid="text-page-title">Experiments</h1>
          <p className="text-muted-foreground">Skill-building adventures for personal growth</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
            data-testid="input-search"
          />
        </div>

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
          <>
            <p className="text-sm text-muted-foreground">
              {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment) => (
                <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-card cursor-pointer flex flex-col h-full rounded-xs" data-testid={`card-experiment-${experiment.id}`}>
                    <div className="h-[2px] w-full bg-primary" />
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                      {experiment.image ? (
                        <img
                          src={experiment.image}
                          alt={experiment.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FlaskConical className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 z-20 text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground" data-testid={`badge-${experiment.id}`}>
                        {experiment.category}
                      </span>
                      <div className="absolute bottom-3 left-3 z-20">
                        <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                          {experiment.steps?.length || 0} step{(experiment.steps?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg leading-tight mb-1 text-muted-foreground group-hover:text-primary transition-colors" data-testid={`text-experiment-${experiment.id}`}>
                        {experiment.title}
                      </h3>
                      <p className="text-base text-muted-foreground mb-4" data-testid={`text-guide-${experiment.id}`}>
                        with {experiment.guide}
                      </p>

                      <div className="mt-auto">
                        <Button className="w-full gap-2" data-testid={`button-experiment-${experiment.id}`}>
                          <FlaskConical className="w-4 h-4" /> View Experiment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {shareDialog.experiment && (
        <ShareConfirmationDialog
          open={shareDialog.open}
          onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}
          contentType="experiment"
          contentTitle={`Completed: ${shareDialog.experiment.title}`}
          contentPreview={`I just completed the ${shareDialog.experiment.title} experiment with ${shareDialog.experiment.guide}! 🎉`}
        />
      )}
    </Layout>
  );
}
