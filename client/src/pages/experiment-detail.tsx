import {
  ArrowLeft, CheckCircle, PlayCircle, Clock, BookOpen, Zap,
  MessageCircle, Send, FlaskConical, Lightbulb, Circle, Check,
  ChevronDown, ChevronUp, MoveRight, Trophy, Lock, User as UserIcon,
  HelpCircle, PartyPopper
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExperiment, enrollInExperiment, getExperimentEnrollment, completeStep, saveQuizResult } from "@/lib/api";
import { ELEVEN_DIMENSIONS } from "@/lib/mock-data";
import { EditorPreview, richTextEditorStyles } from "@/components/rich-text-editor";
import type { Experiment, ExperimentModule, ExperimentStep, UserExperiment, StepQuizResult, QuizQuestion } from "@shared/schema";

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

function StepQuiz({
  questions,
  stepId,
  enrollmentId,
  existingResult,
  onComplete,
}: {
  questions: QuizQuestion[];
  stepId: string;
  enrollmentId: string;
  existingResult?: StepQuizResult;
  onComplete: (score: number, total: number) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(!!existingResult);
  const queryClient = useQueryClient();

  const quizResultMutation = useMutation({
    mutationFn: ({ s, t }: { s: number; t: number }) => saveQuizResult(enrollmentId, stepId, s, t),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enrollment"] }),
  });

  if (finished && existingResult) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xs p-4 mt-6" data-testid="quiz-result-summary">
        <div className="flex items-center gap-2 text-green-700 mb-1">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Quiz Completed</span>
        </div>
        <p className="text-sm text-green-600">
          You scored {existingResult.score}/{existingResult.total}
        </p>
      </div>
    );
  }

  if (finished) return null;

  const q = questions[currentQ];
  if (!q) return null;

  const handleSelect = (optIdx: number) => {
    if (answered) return;
    setSelectedAnswer(optIdx);
    setAnswered(true);
    const isCorrect = optIdx === q.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const lastCorrect = selectedAnswer === q.correctIndex ? 1 : 0;
      const finalScore = score;
      setFinished(true);
      quizResultMutation.mutate({ s: finalScore, t: questions.length });
      onComplete(finalScore, questions.length);
      if (finalScore === questions.length) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="mt-6 border rounded-xs p-5 space-y-4 bg-card" data-testid="step-quiz">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
          <HelpCircle className="w-4 h-4" /> Quiz
        </h4>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>
      <p className="text-base" data-testid="quiz-question-text">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, optIdx) => {
          let className = "w-full text-left p-3 rounded-xs border text-sm transition-all ";
          if (answered) {
            if (optIdx === q.correctIndex) {
              className += "border-green-500 bg-green-50 text-green-800";
            } else if (optIdx === selectedAnswer) {
              className += "border-red-400 bg-red-50 text-red-700";
            } else {
              className += "border-gray-200 text-muted-foreground opacity-50";
            }
          } else {
            className += "border-gray-200 hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
          }
          return (
            <button
              key={optIdx}
              onClick={() => handleSelect(optIdx)}
              className={className}
              disabled={answered}
              data-testid={`quiz-option-${optIdx}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${selectedAnswer === q.correctIndex ? 'text-green-600' : 'text-red-600'}`}>
            {selectedAnswer === q.correctIndex ? 'Correct!' : `Incorrect. The answer is: ${q.options[q.correctIndex]}`}
          </p>
          <Button size="sm" onClick={handleNext} data-testid="button-quiz-next">
            {currentQ < questions.length - 1 ? 'Next' : 'Finish Quiz'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ExperimentDetail() {
  const [, params] = useRoute("/experiments/:id");
  const { profile, isConnected } = useNostr();
  const queryClient = useQueryClient();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showModuleCompleteModal, setShowModuleCompleteModal] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareContent, setShareContent] = useState({ title: "", preview: "" });
  const [newComment, setNewComment] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(true);

  const { data: experiment, isLoading } = useQuery({
    queryKey: ["experiment", params?.id],
    queryFn: () => getExperiment(params!.id),
    enabled: !!params?.id,
  });

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", params?.id],
    queryFn: () => getExperimentEnrollment(params!.id),
    enabled: !!params?.id && isConnected,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollInExperiment(params!.id),
    onSuccess: () => {
      refetchEnrollment();
      toast.success("Enrolled successfully!");
    },
  });

  const completeStepMutation = useMutation({
    mutationFn: ({ stepId, totalSteps }: { stepId: string; totalSteps: number }) =>
      completeStep(enrollment!.id, stepId, totalSteps),
    onSuccess: (data) => {
      queryClient.setQueryData(["enrollment", params?.id], data);
      refetchEnrollment();
    },
  });

  const modules: ExperimentModule[] = (experiment?.modules as ExperimentModule[]) || [];
  const activeModule = modules[activeModuleIndex];
  const activeStep = activeModule?.steps?.[activeStepIndex];
  const dimensionData = ELEVEN_DIMENSIONS.find((d) => d.id === experiment?.dimension);

  const totalSteps = useMemo(
    () => modules.reduce((sum, mod) => sum + (mod.steps?.length || 0), 0),
    [modules]
  );

  const allStepIds = useMemo(() => {
    const ids: string[] = [];
    modules.forEach((mod) => mod.steps?.forEach((s) => { if (s.id) ids.push(s.id); }));
    return ids;
  }, [modules]);

  const completedSteps: string[] = (enrollment?.completedSteps as string[]) || [];
  const quizResults: StepQuizResult[] = (enrollment?.quizResults as StepQuizResult[]) || [];

  const isStepCompleted = useCallback((stepId: string) => completedSteps.includes(stepId), [completedSteps]);

  const getQuizResult = useCallback(
    (stepId: string) => quizResults.find((r) => r.stepId === stepId),
    [quizResults]
  );

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

  const handleMarkComplete = () => {
    if (!enrollment || !activeStep?.id) return;
    completeStepMutation.mutate(
      { stepId: activeStep.id, totalSteps },
      {
        onSuccess: (data) => {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
          toast.success("Step completed!");

          const moduleStepIds = activeModule?.steps?.map((s) => s.id).filter(Boolean) as string[];
          const updatedCompleted = (data.completedSteps as string[]) || [];
          const allModuleStepsDone = moduleStepIds.every((id) => updatedCompleted.includes(id));

          if (data.progress >= 100) {
            setTimeout(() => {
              confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
              setShowCompletionModal(true);
            }, 600);
          } else if (allModuleStepsDone && activeModuleIndex < modules.length - 1) {
            setTimeout(() => setShowModuleCompleteModal(true), 500);
          } else {
            if (activeModule && activeStepIndex < (activeModule.steps?.length || 0) - 1) {
              setTimeout(() => navigateToStep(activeModuleIndex, activeStepIndex + 1), 800);
            } else if (activeModuleIndex < modules.length - 1) {
              setTimeout(() => navigateToStep(activeModuleIndex + 1, 0), 800);
            }
          }
        },
      }
    );
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
  const isEnrolled = !!enrollment;
  const progressPercent = enrollment?.progress || 0;
  const currentStepCompleted = activeStep?.id ? isStepCompleted(activeStep.id) : false;

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
              {isEnrolled && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md border border-green-200 bg-green-50 text-green-700" data-testid="badge-enrolled">
                  <CheckCircle className="w-3 h-3" /> Enrolled
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-muted-foreground mb-4" data-testid="text-experiment-title">{experiment.title}</h1>

            {isEnrolled && (
              <div className="mb-4" data-testid="progress-bar-container">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{completedSteps.length} of {totalSteps} steps completed</span>
                  <span className="text-xs font-medium text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

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

          {showFullContent && !isEnrolled ? (
            <div className="mb-8">
              <Card className="p-8 text-center border-dashed" data-testid="enrollment-card">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-serif mb-2">Ready to Begin?</h3>
                <p className="text-muted-foreground mb-4">
                  Enroll to track your progress, take quizzes, and earn completion badges.
                </p>
                <Button
                  className="gap-2"
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  data-testid="button-enroll"
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Start Experiment"}
                </Button>
              </Card>
            </div>
          ) : showFullContent && activeStep ? (
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

              {activeStep.quizQuestions && activeStep.quizQuestions.length > 0 && isEnrolled && activeStep.id && (
                <StepQuiz
                  questions={activeStep.quizQuestions}
                  stepId={activeStep.id}
                  enrollmentId={enrollment!.id}
                  existingResult={getQuizResult(activeStep.id)}
                  onComplete={(score, total) => {
                    if (score === total) {
                      toast.success(`Perfect score! ${score}/${total}`);
                    } else {
                      toast(`Quiz complete: ${score}/${total}`);
                    }
                  }}
                />
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

                {isEnrolled && !currentStepCompleted && (
                  <Button
                    variant="outline"
                    className="gap-2 text-green-700 border-green-300 hover:bg-green-50"
                    onClick={handleMarkComplete}
                    disabled={completeStepMutation.isPending}
                    data-testid="button-mark-complete"
                  >
                    <Check className="w-4 h-4" />
                    {completeStepMutation.isPending ? "Saving..." : "Mark Complete"}
                  </Button>
                )}

                {currentStepCompleted && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600" data-testid="text-step-done">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}

                {activeModule && activeStepIndex < (activeModule.steps?.length || 0) - 1 ? (
                  <Button onClick={() => navigateToStep(activeModuleIndex, activeStepIndex + 1)} className="gap-2" data-testid="button-next-step">
                    Next Step <MoveRight className="w-4 h-4" />
                  </Button>
                ) : activeModuleIndex < modules.length - 1 ? (
                  <Button onClick={() => navigateToStep(activeModuleIndex + 1, 0)} className="gap-2" data-testid="button-next-module">
                    Next Module <MoveRight className="w-4 h-4" />
                  </Button>
                ) : isEnrolled && progressPercent >= 100 ? (
                  <Button onClick={() => setShowCompletionModal(true)} className="gap-2" data-testid="button-complete">
                    <Trophy className="w-4 h-4" /> View Completion
                  </Button>
                ) : null}
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

            {isEnrolled && (
              <div className="pb-4 border-b border-border/50" data-testid="sidebar-progress">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Your Progress</span>
                  <span className="text-xs font-medium text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {completedSteps.length}/{totalSteps} steps · {quizResults.length} quizzes taken
                </p>
              </div>
            )}

            <div>
              <h3 className="font-serif font-normal text-lg mb-4 text-muted-foreground">Curriculum</h3>
              <div className="space-y-3">
                {modules.map((mod, modIdx) => {
                  const moduleStepIds = (mod.steps || []).map((s) => s.id).filter(Boolean) as string[];
                  const moduleComplete = moduleStepIds.length > 0 && moduleStepIds.every((id) => completedSteps.includes(id));

                  return (
                    <div key={mod.id || modIdx} className="space-y-1">
                      <p className={`text-xs uppercase tracking-wider font-normal px-1 flex items-center gap-1.5 ${moduleComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {moduleComplete && <CheckCircle className="w-3 h-3" />}
                        Module {modIdx + 1}: {mod.title || "Untitled"}
                      </p>
                      <div className="space-y-0.5">
                        {mod.steps?.map((step, stepIdx) => {
                          const isActive = modIdx === activeModuleIndex && stepIdx === activeStepIndex;
                          const completed = step.id ? isStepCompleted(step.id) : false;
                          return (
                            <button
                              key={step.id || stepIdx}
                              onClick={() => showFullContent && isEnrolled && navigateToStep(modIdx, stepIdx)}
                              className={`
                                w-full text-left flex items-start gap-2 p-2 rounded-lg transition-all text-sm
                                ${isActive ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}
                                ${!showFullContent || !isEnrolled ? 'cursor-default' : 'cursor-pointer'}
                              `}
                              data-testid={`step-nav-${modIdx}-${stepIdx}`}
                            >
                              <div className="mt-0.5">
                                {completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : isActive ? (
                                  <Circle className="w-4 h-4 text-primary" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground/30" />
                                )}
                              </div>
                              <span className={`${completed ? 'text-green-700' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.title || `Step ${stepIdx + 1}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isConnected && (
              <div className="pt-4 border-t border-border/50">
                <Button className="w-full gap-2" size="sm" data-testid="button-sidebar-login">
                  <Lock className="w-3.5 h-3.5" /> Sign in to Start
                </Button>
              </div>
            )}

            {isConnected && !isEnrolled && (
              <div className="pt-4 border-t border-border/50">
                <Button
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  data-testid="button-sidebar-enroll"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
              </div>
            )}

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

      <Dialog open={showModuleCompleteModal} onOpenChange={setShowModuleCompleteModal}>
        <DialogContent className="sm:max-w-md text-center border-primary/20">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-serif font-normal text-center text-muted-foreground">
              Module Complete!
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              You finished "{activeModule?.title}"! Ready for the next module?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              className="w-full h-11 gap-2"
              onClick={() => {
                setShowModuleCompleteModal(false);
                setShareContent({
                  title: `I completed module "${activeModule?.title}"!`,
                  preview: `Just finished the "${activeModule?.title}" module in "${experiment.title}" on 11x LOVE LaB!`,
                });
                setTimeout(() => setShowShareDialog(true), 300);
              }}
              data-testid="button-share-module-win"
            >
              <Share2 className="w-4 h-4" /> Share Your Progress
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setShowModuleCompleteModal(false);
                if (activeModuleIndex < modules.length - 1) {
                  navigateToStep(activeModuleIndex + 1, 0);
                }
              }}
              data-testid="button-next-module-modal"
            >
              Continue to Next Module <MoveRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

            {quizResults.length > 0 && (
              <div className="bg-muted/50 rounded-xs p-3">
                <p className="text-sm text-muted-foreground mb-1">Quiz Performance</p>
                <p className="text-lg font-medium">
                  {quizResults.reduce((s, r) => s + r.score, 0)}/{quizResults.reduce((s, r) => s + r.total, 0)} correct
                </p>
              </div>
            )}

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
                setShareContent({
                  title: `I completed "${experiment.title}"!`,
                  preview: `I just finished the "${experiment.title}" experiment on 11x LOVE LaB! ${experiment.description || ""}`,
                });
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
        contentTitle={shareContent.title}
        contentPreview={shareContent.preview}
      />
    </Layout>
  );
}
