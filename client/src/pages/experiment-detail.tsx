import {
  ArrowLeft, CheckCircle, PlayCircle, Clock, BookOpen, Zap,
  MessageCircle, Send, FlaskConical, Lightbulb, Circle, Check,
  ChevronDown, ChevronUp, MoveRight, Trophy, Lock, User as UserIcon
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { FeedPost } from "@/components/feed-post";
import confetti from 'canvas-confetti';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { EqVisualizer } from "@/components/eq-visualizer";
import { toast } from "sonner";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNostr } from "@/contexts/nostr-context";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getExperiment } from "@/lib/api";
import { ELEVEN_DIMENSIONS } from "@/lib/mock-data";
import { EditorPreview, richTextEditorStyles } from "@/components/rich-text-editor";
import type { Experiment, ExperimentModule, ExperimentStep } from "@shared/schema";

function YouTubeEmbed({ url }: { url: string }) {
  const getEmbedUrl = (rawUrl: string) => {
    try {
      if (rawUrl.includes("youtube.com/watch")) {
        const videoId = new URL(rawUrl).searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (rawUrl.includes("youtu.be/")) {
        const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (rawUrl.includes("youtube.com/embed/")) return rawUrl;
      if (rawUrl.includes("vimeo.com/")) {
        const videoId = rawUrl.split("vimeo.com/")[1]?.split("?")[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="relative aspect-video rounded-xs overflow-hidden mb-4" data-testid="video-embed">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    </div>
  );
}

export default function ExperimentDetail() {
  const [, params] = useRoute("/experiments/:id");
  const { profile, isConnected } = useNostr();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showZapModal, setShowZapModal] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [zapAmount, setZapAmount] = useState(210);
  const [newComment, setNewComment] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(true);

  const { data: experiment, isLoading } = useQuery({
    queryKey: ["experiment", params?.id],
    queryFn: () => getExperiment(params!.id),
    enabled: !!params?.id,
  });

  const modules: ExperimentModule[] = (experiment?.modules as ExperimentModule[]) || [];
  const activeModule = modules[activeModuleIndex];
  const activeStep = activeModule?.steps?.[activeStepIndex];
  const dimensionData = ELEVEN_DIMENSIONS.find((d) => d.id === experiment?.dimension);

  const totalSteps = modules.reduce((sum, mod) => sum + (mod.steps?.length || 0), 0);

  const [comments, setComments] = useState([
    {
      id: "1",
      author: {
        name: "Alex Chen",
        handle: "@alexc",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
      },
      content: "This lesson really shifted my perspective!",
      timestamp: "2h ago",
      likes: 12,
      comments: 3,
      zaps: 210
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{
        id: String(comments.length + 1),
        author: {
          name: profile?.name || "You",
          handle: profile?.npub ? `@${profile.npub.slice(0, 8)}` : "@user",
          avatar: profile?.picture || ""
        },
        content: newComment,
        timestamp: "1m",
        likes: 0,
        comments: 0,
        zaps: 0
      }, ...comments]);
      setNewComment("");
    }
  };

  const navigateToStep = (modIndex: number, stepIndex: number) => {
    setActiveModuleIndex(modIndex);
    setActiveStepIndex(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8 text-center">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading experiment...</p>
        </div>
      </Layout>
    );
  }

  if (!experiment) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <p className="text-muted-foreground">Experiment not found</p>
        </div>
      </Layout>
    );
  }

  const showFullContent = isConnected;

  return (
    <Layout>
      <style>{richTextEditorStyles}</style>
      <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-100px)]">
        <div className="flex-1 p-4 lg:p-8 lg:pr-12 overflow-y-auto">
          <div className="mb-6">
            <Link href="/experiments">
              <Button variant="ghost" className="gap-2 pl-0 text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
                Back to Experiments
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {dimensionData && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground" data-testid="badge-dimension">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dimensionData.hex }} />
                  {dimensionData.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-muted-foreground mb-4" data-testid="text-experiment-title">{experiment.title}</h1>

            <div className="border-l-2 border-primary/20 pl-4 py-1 cursor-pointer hover:border-primary transition-colors" onClick={() => setIsAboutOpen(!isAboutOpen)}>
              <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4" /> About this Experiment
                {isAboutOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
              {isAboutOpen && (
                <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {experiment.description && (
                    <p className="text-[17px] leading-relaxed text-muted-foreground max-w-2xl" data-testid="text-description">
                      {experiment.description}
                    </p>
                  )}
                  {experiment.benefitsFor && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Who Could Benefit</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-benefits">{experiment.benefitsFor}</p>
                    </div>
                  )}
                  {experiment.outcomes && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Outcomes & Goals</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-outcomes">{experiment.outcomes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {showFullContent && activeStep ? (
            <div className="mb-8">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Module {activeModuleIndex + 1}: {activeModule?.title || "Untitled Module"}
                </p>
                <h2 className="text-2xl font-serif font-normal text-muted-foreground" data-testid="text-active-step-title">
                  {activeStep.title || `Step ${activeStepIndex + 1}`}
                </h2>
              </div>

              {activeStep.videoUrl && <YouTubeEmbed url={activeStep.videoUrl} />}

              {activeStep.content && (
                <div className="mb-6" data-testid="step-content">
                  <EditorPreview html={activeStep.content} />
                </div>
              )}

              <div className="flex items-center gap-3 mt-8">
                {activeStepIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => navigateToStep(activeModuleIndex, activeStepIndex - 1)}
                    data-testid="button-prev-step"
                  >
                    Previous Step
                  </Button>
                )}
                {activeStepIndex === 0 && activeModuleIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const prevMod = modules[activeModuleIndex - 1];
                      navigateToStep(activeModuleIndex - 1, (prevMod?.steps?.length || 1) - 1);
                    }}
                    data-testid="button-prev-module"
                  >
                    Previous Module
                  </Button>
                )}
                <div className="flex-1" />
                {activeModule && activeStepIndex < (activeModule.steps?.length || 0) - 1 ? (
                  <Button onClick={() => navigateToStep(activeModuleIndex, activeStepIndex + 1)} className="gap-2" data-testid="button-next-step">
                    Next Step <MoveRight className="w-4 h-4" />
                  </Button>
                ) : activeModuleIndex < modules.length - 1 ? (
                  <Button onClick={() => navigateToStep(activeModuleIndex + 1, 0)} className="gap-2" data-testid="button-next-module">
                    Next Module <MoveRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowCompletionModal(true)} className="gap-2" data-testid="button-complete">
                    <Trophy className="w-4 h-4" /> Complete Experiment
                  </Button>
                )}
              </div>
            </div>
          ) : !showFullContent ? (
            <div className="mb-8">
              <Card className="p-8 text-center border-dashed">
                <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-serif mb-2">Login to Start This Experiment</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to access the full curriculum, track your progress, and join the discussion.
                </p>
                <Button className="gap-2" data-testid="button-login-cta">
                  Start Experiment
                </Button>
              </Card>
            </div>
          ) : (
            <div className="mb-8">
              {experiment.image && (
                <div className="relative rounded-xs overflow-hidden aspect-video bg-black mb-8 shadow-lg ring-1 ring-border/50 group">
                  <img
                    src={experiment.image}
                    alt={experiment.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              )}
              <p className="text-muted-foreground text-center py-4">Select a step from the sidebar to begin.</p>
            </div>
          )}

          {showFullContent && (
            <div className="mt-12 max-w-3xl">
              <h2 className="text-2xl font-normal font-serif mb-6 flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
                Discussion
              </h2>
              <div className="flex gap-4 mb-8">
                <img
                  src={profile?.picture || ""}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full border border-border"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your findings, questions, or insights..."
                    className="w-full p-3 rounded-lg bg-card text-muted-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all text-[17px]"
                    rows={2}
                    data-testid="textarea-discussion"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button onClick={handleAddComment} className="gap-2 rounded-full px-8 text-base" data-testid="button-post-comment">
                      <Send className="w-3 h-3" /> Post
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <FeedPost key={comment.id} post={comment} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[320px] border-l bg-card/30 flex-shrink-0 sticky top-0 h-fit lg:h-auto lg:min-h-[calc(100vh-64px)]">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border/50">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs font-normal uppercase tracking-wider">Modules</span>
                </div>
                <p className="font-normal text-sm">{modules.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-normal uppercase tracking-wider">Steps</span>
                </div>
                <p className="font-normal text-sm">{totalSteps}</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif font-normal text-lg mb-4 text-muted-foreground">Curriculum</h3>
              <div className="space-y-3">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id || modIdx} className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-normal px-1">
                      Module {modIdx + 1}: {mod.title || "Untitled"}
                    </p>
                    <div className="space-y-0.5">
                      {mod.steps?.map((step, stepIdx) => {
                        const isActive = modIdx === activeModuleIndex && stepIdx === activeStepIndex;
                        return (
                          <button
                            key={step.id || stepIdx}
                            onClick={() => showFullContent && navigateToStep(modIdx, stepIdx)}
                            className={`
                              w-full text-left flex items-start gap-2 p-2 rounded-lg transition-all text-sm
                              ${isActive ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}
                              ${!showFullContent ? 'cursor-default' : 'cursor-pointer'}
                            `}
                            data-testid={`step-nav-${modIdx}-${stepIdx}`}
                          >
                            <div className="mt-0.5">
                              {isActive ? (
                                <Circle className="w-4 h-4 text-primary" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/30" />
                              )}
                            </div>
                            <span className={`${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.title || `Step ${stepIdx + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {experiment.tags && (experiment.tags as string[]).length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {(experiment.tags as string[]).map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center border-primary/20">
          <DialogHeader>
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-serif font-normal text-center text-muted-foreground">Experiment Complete!</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              You've completed "{experiment.title}"!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex justify-center">
              <div className="scale-75 origin-center">
                <EqVisualizer size={160} isLogo={true} />
              </div>
            </div>

            <p className="text-muted-foreground italic">
              "The only way to discover the limits of the possible is to go beyond them into the impossible."
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              className="w-full h-12 text-lg font-normal gap-2"
              size="lg"
              onClick={() => {
                setShowCompletionModal(false);
                setTimeout(() => setShowShareDialog(true), 300);
              }}
              data-testid="button-share-win"
            >
              <Share2 className="w-5 h-5" />
              Share Your Win
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowCompletionModal(false)}
              data-testid="button-close-completion"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareConfirmationDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        contentType="experiment"
        contentTitle={`I completed "${experiment.title}"!`}
        contentPreview={`I just finished the "${experiment.title}" experiment on 11x LOVE LaB! ${experiment.description || ""}`}
      />
    </Layout>
  );
}
