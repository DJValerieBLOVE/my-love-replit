import {
  ArrowLeft, CheckCircle, PlayCircle, Clock, BookOpen, Zap, Download, FileText,
  MessageCircle, Send, FlaskConical, Lightbulb, Circle, Check, Heart, Bookmark,
  ChevronDown, ChevronUp, ChevronRight, MoveRight, Trophy, Lock, User as UserIcon,
  HelpCircle, PartyPopper, NotebookPen, Save, Trash2, Sparkles, Star
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
import { Textarea } from "@/components/ui/textarea";
import { useNostr } from "@/contexts/nostr-context";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExperiment, enrollInExperiment, getExperimentEnrollment, completeStep, saveQuizResult, createLabNote } from "@/lib/api";
import { ELEVEN_DIMENSIONS } from "@/lib/mock-data";
import { EditorPreview, richTextEditorStyles } from "@/components/rich-text-editor";
import type { Experiment, ExperimentModule, ExperimentStep, UserExperiment, StepQuizResult, QuizQuestion, StepResource } from "@shared/schema";

let _celebrationCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_celebrationCtx) {
    _celebrationCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _celebrationCtx;
}

const CELEBRATION_MELODIES = [
  { notes: [523.25, 659.25, 783.99, 1046.50], type: "sine" as OscillatorType, gap: 0.12 },
  { notes: [440, 554.37, 659.25, 880], type: "triangle" as OscillatorType, gap: 0.1 },
  { notes: [392, 493.88, 587.33, 783.99, 1046.50], type: "sine" as OscillatorType, gap: 0.09 },
  { notes: [261.63, 329.63, 392, 523.25, 659.25, 783.99], type: "triangle" as OscillatorType, gap: 0.08 },
];
let _melodyIndex = 0;

function playCelebrationSound() {
  try {
    const ctx = getAudioCtx();
    const melody = CELEBRATION_MELODIES[_melodyIndex % CELEBRATION_MELODIES.length];
    _melodyIndex++;
    melody.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = melody.type;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * melody.gap);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * melody.gap + 0.45);
      osc.start(ctx.currentTime + i * melody.gap);
      osc.stop(ctx.currentTime + i * melody.gap + 0.45);
    });
  } catch {}
}

function playBigCelebrationSound() {
  try {
    const ctx = getAudioCtx();
    const chords = [
      [261.63, 329.63, 392],
      [293.66, 369.99, 440],
      [329.63, 415.30, 523.25],
      [392, 493.88, 587.33],
      [523.25, 659.25, 783.99],
    ];
    chords.forEach((chord, ci) => {
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.12, ctx.currentTime + ci * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ci * 0.2 + 0.5);
        osc.start(ctx.currentTime + ci * 0.2);
        osc.stop(ctx.currentTime + ci * 0.2 + 0.5);
      });
    });
  } catch {}
}

function fireCelebration(intensity: 'small' | 'medium' | 'big' = 'medium') {
  if (intensity === 'small') {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    playCelebrationSound();
  } else if (intensity === 'medium') {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    playCelebrationSound();
    setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { x: 0.2, y: 0.6 } }), 200);
    setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { x: 0.8, y: 0.6 } }), 400);
  } else {
    playBigCelebrationSound();
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { x: 0.1, y: 0.5 } }), 300);
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { x: 0.9, y: 0.5 } }), 500);
    setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } }), 700);
  }
}

const CELEBRATION_ICONS = [PartyPopper, Trophy, Star, Heart, FlaskConical];
const CELEBRATION_MESSAGES = [
  "You crushed it!",
  "Knowledge unlocked!",
  "Brilliant work!",
  "You're on fire!",
  "Level up!",
];

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
      <div className="bg-[#F5F5F5] border border-gray-200 rounded-xs p-4 mt-6" data-testid="quiz-result-summary">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Quiz Completed</span>
        </div>
        <p className="text-sm text-muted-foreground">
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

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((c) => c + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        setFinished(true);
        quizResultMutation.mutate({ s: finalScore, t: questions.length });
        onComplete(finalScore, questions.length);
        if (finalScore === questions.length) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      }
    }, 1200);
  };

  return (
    <div className="mt-6 border rounded-xs p-5 space-y-4 bg-card" data-testid="step-quiz">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
          <HelpCircle className="w-4 h-4" /> Quiz
        </h4>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>
      <Progress value={((currentQ + (answered ? 1 : 0)) / questions.length) * 100} className="h-1.5" />
      <p className="text-base" data-testid="quiz-question-text">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, optIdx) => {
          let cls = "w-full text-left p-3 rounded-xs border text-sm transition-all ";
          if (answered) {
            if (optIdx === q.correctIndex) {
              cls += "border-foreground bg-foreground/5 text-foreground font-medium";
            } else if (optIdx === selectedAnswer) {
              cls += "border-gray-300 bg-[#F5F5F5] text-muted-foreground line-through";
            } else {
              cls += "border-gray-200 text-muted-foreground opacity-50";
            }
          } else {
            cls += "border-gray-200 hover:border-foreground/40 hover:bg-[#F5F5F5] cursor-pointer";
          }
          return (
            <button
              key={optIdx}
              onClick={() => handleSelect(optIdx)}
              className={cls}
              disabled={answered}
              data-testid={`quiz-option-${optIdx}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex items-center gap-2 pt-1">
          <p className={`text-sm ${selectedAnswer === q.correctIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {selectedAnswer === q.correctIndex ? 'Correct!' : `The answer is: ${q.options[q.correctIndex]}`}
          </p>
          <span className="text-xs text-muted-foreground ml-auto">
            {currentQ < questions.length - 1 ? 'Next question loading...' : 'Finishing...'}
          </span>
        </div>
      )}
    </div>
  );
}

function QuizSuccessModal({
  open,
  data,
  celebrationIconIndex,
  onContinue,
}: {
  open: boolean;
  data: { score: number; total: number; stepsCompleted: number; totalSteps: number } | null;
  celebrationIconIndex: number;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onContinue, 5000);
    return () => clearTimeout(timer);
  }, [open, onContinue]);

  const CelebIcon = CELEBRATION_ICONS[celebrationIconIndex % CELEBRATION_ICONS.length];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onContinue(); }}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-3 animate-bounce">
            <CelebIcon className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-3xl font-serif font-normal text-center">
            {data && data.score === data.total ? "Perfect!" : "Lesson Complete!"}
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-1">
            {CELEBRATION_MESSAGES[celebrationIconIndex % CELEBRATION_MESSAGES.length]}
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="py-4 space-y-4">
            <div className="text-center">
              <p className="text-5xl font-serif font-normal text-foreground">
                {Math.round((data.score / data.total) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.score} out of {data.total} correct
              </p>
            </div>

            <div className="bg-[#F5F5F5] rounded-xs p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Experiment Progress</span>
                <span className="text-xs font-medium">{data.stepsCompleted}/{data.totalSteps}</span>
              </div>
              <Progress value={(data.stepsCompleted / data.totalSteps) * 100} className="h-2" />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            className="w-full h-11 gap-2"
            onClick={onContinue}
            data-testid="button-quiz-continue"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DiscussionPanel({ profile, experimentTitle }: { profile: any; experimentTitle: string }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{
        id: String(Date.now()),
        author: {
          name: profile?.name || "You",
          handle: profile?.npub ? `@${profile.npub.slice(0, 8)}...` : "@anon",
          avatar: profile?.picture || ""
        },
        content: newComment,
        timestamp: "just now",
        likes: 0,
        zaps: 0
      }, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif font-normal text-lg">Lesson Discussion</h3>
        <p className="text-sm text-muted-foreground mt-1">Share insights with the Tribe</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {profile?.picture ? (
            <img src={profile.picture} alt="" className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="text-sm resize-none flex-1"
            data-testid="textarea-discussion"
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="gap-1.5"
            data-testid="button-post-comment"
          >
            <Send className="w-3.5 h-3.5" /> Post
          </Button>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="space-y-0">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4 border-t border-gray-100" data-testid={`discussion-note-${comment.id}`}>
              <div className="flex items-start gap-3">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.author.handle}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground mb-3">{comment.content}</p>
                  <div className="flex items-center gap-5 text-muted-foreground">
                    <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors" data-testid={`button-like-${comment.id}`}>
                      <Heart className="w-4 h-4" strokeWidth={1.5} />
                      {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors" data-testid={`button-zap-${comment.id}`}>
                      <Zap className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors" data-testid={`button-reply-${comment.id}`}>
                      <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button className="ml-auto flex items-center gap-1.5 text-sm hover:text-foreground transition-colors" data-testid={`button-bookmark-${comment.id}`}>
                      <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center italic pt-2">Comments will load from Nostr relay</p>
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
  const [collapsedModules, setCollapsedModules] = useState<Set<number>>(new Set());
  const [showLabNotePrompt, setShowLabNotePrompt] = useState(false);
  const [labNotePromptContent, setLabNotePromptContent] = useState("");
  const [showQuizSuccessModal, setShowQuizSuccessModal] = useState(false);
  const [quizSuccessData, setQuizSuccessData] = useState<{ score: number; total: number; stepsCompleted: number; totalSteps: number } | null>(null);
  const [celebrationIconIndex] = useState(() => Math.floor(Math.random() * CELEBRATION_ICONS.length));

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

  const completedSteps: string[] = (enrollment?.completedSteps as string[]) || [];
  const quizResults: StepQuizResult[] = (enrollment?.quizResults as StepQuizResult[]) || [];

  const isStepCompleted = useCallback((stepId: string) => completedSteps.includes(stepId), [completedSteps]);

  const getQuizResult = useCallback(
    (stepId: string) => quizResults.find((r) => r.stepId === stepId),
    [quizResults]
  );

  const navigateToStep = (modIndex: number, stepIndex: number) => {
    setActiveModuleIndex(modIndex);
    setActiveStepIndex(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModuleCollapse = (modIdx: number) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(modIdx)) next.delete(modIdx);
      else next.add(modIdx);
      return next;
    });
  };

  const labNotePromptMutation = useMutation({
    mutationFn: () => {
      if (!experiment?.id || !labNotePromptContent.trim()) {
        return Promise.reject(new Error("Missing data"));
      }
      return createLabNote({
        experimentId: experiment.id,
        stepId: activeStep?.id || undefined,
        title: activeStep?.title || "Lab Note",
        content: labNotePromptContent,
        isPrivate: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labNotes", experiment?.id] });
      toast.success("Lab note saved to your Vault!");
      handleLabNoteDone();
    },
    onError: () => {
      toast.error("Failed to save lab note");
    },
  });

  const handleQuizComplete = useCallback((score: number, total: number) => {
    if (!enrollment || !activeStep?.id) return;

    fireCelebration(score === total ? 'medium' : 'small');

    completeStepMutation.mutate(
      { stepId: activeStep.id, totalSteps },
      {
        onSuccess: (data) => {
          const completed = (data.completedSteps as string[]) || [];
          setQuizSuccessData({
            score,
            total,
            stepsCompleted: completed.length,
            totalSteps,
          });
          setShowQuizSuccessModal(true);
          fireCelebration('medium');

          const moduleStepIds = activeModule?.steps?.map((s) => s.id).filter(Boolean) as string[];
          const allModuleStepsDone = moduleStepIds.every((id) => completed.includes(id));

          if (data.progress >= 100) {
            setTimeout(() => {
              fireCelebration('big');
              setShowQuizSuccessModal(false);
              setShowCompletionModal(true);
            }, 3000);
          } else if (allModuleStepsDone && activeModuleIndex < modules.length - 1) {
            setTimeout(() => {
              setShowQuizSuccessModal(false);
              setShowModuleCompleteModal(true);
            }, 3000);
          }
        },
      }
    );
  }, [enrollment, activeStep, activeModule, activeModuleIndex, activeStepIndex, modules, totalSteps, completeStepMutation]);

  const handleQuizSuccessContinue = useCallback(() => {
    setShowQuizSuccessModal(false);
    setShowLabNotePrompt(true);
  }, []);

  const handleLabNoteDone = useCallback(() => {
    setShowLabNotePrompt(false);
    setLabNotePromptContent("");
    if (activeModule && activeStepIndex < (activeModule.steps?.length || 0) - 1) {
      navigateToStep(activeModuleIndex, activeStepIndex + 1);
    } else if (activeModuleIndex < modules.length - 1) {
      navigateToStep(activeModuleIndex + 1, 0);
    }
  }, [activeModule, activeModuleIndex, activeStepIndex, modules]);

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

  const isEnrolled = !!enrollment;
  const progressPercent = enrollment?.progress || 0;
  const currentStepCompleted = activeStep?.id ? isStepCompleted(activeStep.id) : false;

  if (!isConnected || !isEnrolled) {
    return (
      <Layout>
        <style>{richTextEditorStyles}</style>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <div className="mb-6">
            <Link href="/experiments">
              <Button variant="ghost" className="gap-2 pl-0 text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" /> Back to Experiments
              </Button>
            </Link>
          </div>

          {experiment.image && (
            <div className="relative rounded-xs overflow-hidden aspect-video bg-black mb-6 shadow-sm">
              <img src={experiment.image} alt={experiment.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            {dimensionData && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground" data-testid="badge-dimension">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dimensionData.hex }} />
                {dimensionData.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-normal text-muted-foreground mb-4" data-testid="text-experiment-title">{experiment.title}</h1>

          {experiment.description && (
            <p className="text-lg text-muted-foreground mb-6">{experiment.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F5F5F5] rounded-xs p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider">Modules</span>
              </div>
              <p className="font-normal text-sm">{modules.length}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xs p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider">Steps</span>
              </div>
              <p className="font-normal text-sm">{totalSteps}</p>
            </div>
          </div>

          {experiment.benefitsFor && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Who Could Benefit</p>
              <p className="text-sm text-muted-foreground">{experiment.benefitsFor}</p>
            </div>
          )}

          {experiment.outcomes && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Outcomes & Goals</p>
              <p className="text-sm text-muted-foreground">{experiment.outcomes}</p>
            </div>
          )}

          <Card className="p-8 text-center border-dashed" data-testid="enrollment-card">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-serif mb-2">
              {!isConnected ? "Login to Start This Experiment" : "Ready to Begin?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!isConnected
                ? "Sign in to access the full curriculum, track your progress, and join the discussion."
                : "Enroll to track your progress, take quizzes, and write Lab Notes."}
            </p>
            <Button
              className="gap-2"
              onClick={() => isConnected ? enrollMutation.mutate() : undefined}
              disabled={enrollMutation.isPending}
              data-testid="button-enroll"
            >
              {enrollMutation.isPending ? "Enrolling..." : "Start Experiment"}
            </Button>
          </Card>

          {modules.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif font-normal text-lg mb-4 text-muted-foreground">Curriculum Preview</h3>
              <div className="space-y-2">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id || modIdx} className="border rounded-xs p-3">
                    <p className="text-sm font-medium text-muted-foreground">Module {modIdx + 1}: {mod.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mod.steps?.length || 0} steps</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experiment.tags && (experiment.tags as string[]).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {(experiment.tags as string[]).map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{richTextEditorStyles}</style>
      <div className="flex h-[calc(100vh-64px)]">

        {/* LEFT COLUMN - Curriculum Sidebar (25%) */}
        <div className="w-[25%] flex-shrink-0 border-r bg-white overflow-y-auto hidden lg:block" data-testid="curriculum-sidebar">
          <div className="p-5 space-y-5">
            <div>
              <h2 className="font-serif font-normal text-base text-foreground leading-tight" data-testid="text-sidebar-title">
                {experiment.title}
              </h2>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground ml-2">{progressPercent}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {completedSteps.length} of {totalSteps} lessons complete
                </p>
              </div>
            </div>

            <Link href="/vault">
              <Button variant="outline" className="w-full gap-2 text-sm h-9" data-testid="button-view-journal">
                <NotebookPen className="w-4 h-4" strokeWidth={1.5} /> View My Journal
              </Button>
            </Link>

            <div className="space-y-1">
              {modules.map((mod, modIdx) => {
                const moduleStepIds = (mod.steps || []).map((s) => s.id).filter(Boolean) as string[];
                const moduleComplete = moduleStepIds.length > 0 && moduleStepIds.every((id) => completedSteps.includes(id));
                const isCollapsed = collapsedModules.has(modIdx);

                return (
                  <div key={mod.id || modIdx}>
                    <button
                      onClick={() => toggleModuleCollapse(modIdx)}
                      className="w-full flex items-center gap-2 py-2 text-left"
                      data-testid={`module-toggle-${modIdx}`}
                    >
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${!isCollapsed ? 'rotate-90' : ''}`} />
                      <span className={`text-sm uppercase tracking-wider font-normal ${moduleComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Module {modIdx + 1}
                      </span>
                      {moduleComplete && <CheckCircle className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
                    </button>

                    {!isCollapsed && (
                      <div className="ml-3 space-y-0.5">
                        {mod.steps?.map((step, stepIdx) => {
                          const isActive = modIdx === activeModuleIndex && stepIdx === activeStepIndex;
                          const completed = step.id ? isStepCompleted(step.id) : false;
                          return (
                            <button
                              key={step.id || stepIdx}
                              onClick={() => navigateToStep(modIdx, stepIdx)}
                              className={`
                                w-full text-left flex items-center gap-2.5 py-2 px-2.5 rounded-xs transition-all text-sm
                                ${isActive ? 'bg-[#F5F5F5] font-medium text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[#F5F5F5]'}
                              `}
                              data-testid={`step-nav-${modIdx}-${stepIdx}`}
                            >
                              {completed ? (
                                <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : isActive ? (
                                <PlayCircle className="w-4 h-4 text-foreground flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                              )}
                              <span className="truncate">{step.title || `Day ${stepIdx + 1}`}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - Content (50%) */}
        <div className="w-[50%] flex-shrink-0 overflow-y-auto" data-testid="content-area">
          <div className="max-w-none mx-auto p-6 lg:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>{activeModule?.title || "Module"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{activeStep?.title || `Step ${activeStepIndex + 1}`}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-normal text-foreground mb-4" data-testid="text-active-step-title">
              {activeStep?.title || `Step ${activeStepIndex + 1}`}
            </h1>

            {dimensionData && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground mb-5" data-testid="badge-dimension">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dimensionData.hex }} />
                {dimensionData.name}
              </span>
            )}

            {activeStep?.videoUrl && (
              <div className="mb-4">
                <YouTubeEmbed url={activeStep.videoUrl} />
                <div className="flex justify-end -mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground gap-1"
                    onClick={() => {
                      setShareContent({
                        title: `Check out "${activeStep?.title}" in "${experiment.title}"`,
                        preview: activeStep?.content?.substring(0, 200) || "",
                      });
                      setShowShareDialog(true);
                    }}
                    data-testid="button-share-step"
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </Button>
                </div>
              </div>
            )}

            {/* Downloadable Resources */}
            {activeStep?.resources && activeStep.resources.length > 0 && (
              <Card className="mb-6 border-none shadow-sm" data-testid="downloadable-resources">
                <CardContent className="p-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Download className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    Downloadable Resources
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {activeStep.resources.map((resource: StepResource, rIdx: number) => (
                      <a
                        key={resource.id || rIdx}
                        href={resource.url}
                        download={resource.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-2.5 hover:bg-[#F5F5F5] rounded-xs px-2 -mx-2 transition-colors group"
                        data-testid={`resource-download-${rIdx}`}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{resource.name}</p>
                          {resource.size && <p className="text-[10px] text-muted-foreground">{resource.size}</p>}
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep?.content && (
              <div className="mb-6" data-testid="step-content">
                <EditorPreview html={activeStep.content} />
              </div>
            )}

            {/* Quiz section - styled like reference */}
            {activeStep?.quizQuestions && activeStep.quizQuestions.length > 0 && activeStep.id && (
              <StepQuiz
                key={activeStep.id}
                questions={activeStep.quizQuestions}
                stepId={activeStep.id}
                enrollmentId={enrollment!.id}
                existingResult={getQuizResult(activeStep.id)}
                onComplete={handleQuizComplete}
              />
            )}

            {currentStepCompleted && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-4 bg-[#F5F5F5] rounded-xs p-3" data-testid="text-step-done">
                <CheckCircle className="w-4 h-4" /> Step completed
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-8 pb-8 border-t pt-6">
              {(activeStepIndex > 0 || activeModuleIndex > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeStepIndex > 0) {
                      navigateToStep(activeModuleIndex, activeStepIndex - 1);
                    } else if (activeModuleIndex > 0) {
                      const prevMod = modules[activeModuleIndex - 1];
                      navigateToStep(activeModuleIndex - 1, (prevMod?.steps?.length || 1) - 1);
                    }
                  }}
                  data-testid="button-prev-step"
                >
                  Previous
                </Button>
              )}
              <div className="flex-1" />
              {activeModule && activeStepIndex < (activeModule.steps?.length || 0) - 1 ? (
                <Button onClick={() => navigateToStep(activeModuleIndex, activeStepIndex + 1)} className="gap-2" size="sm" data-testid="button-next-step">
                  Next Step <MoveRight className="w-4 h-4" />
                </Button>
              ) : activeModuleIndex < modules.length - 1 ? (
                <Button onClick={() => navigateToStep(activeModuleIndex + 1, 0)} className="gap-2" size="sm" data-testid="button-next-module">
                  Next Module <MoveRight className="w-4 h-4" />
                </Button>
              ) : progressPercent >= 100 ? (
                <Button onClick={() => setShowCompletionModal(true)} className="gap-2" size="sm" data-testid="button-complete">
                  <Trophy className="w-4 h-4" /> View Completion
                </Button>
              ) : null}
            </div>

            {/* Mobile: show curriculum below content */}
            <div className="lg:hidden mt-4 border-t pt-6">
              <h3 className="font-serif font-normal text-base mb-3 text-muted-foreground">Curriculum</h3>
              <div className="space-y-1">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id || modIdx}>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground py-1">
                      Module {modIdx + 1}: {mod.title || "Untitled"}
                    </p>
                    <div className="space-y-0.5 ml-2">
                      {mod.steps?.map((step, stepIdx) => {
                        const isActive = modIdx === activeModuleIndex && stepIdx === activeStepIndex;
                        const completed = step.id ? isStepCompleted(step.id) : false;
                        return (
                          <button
                            key={step.id || stepIdx}
                            onClick={() => navigateToStep(modIdx, stepIdx)}
                            className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-xs text-xs ${isActive ? 'bg-foreground/5 font-medium text-foreground' : 'text-muted-foreground'}`}
                            data-testid={`step-nav-mobile-${modIdx}-${stepIdx}`}
                          >
                            {completed ? <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />}
                            <span className="truncate">{step.title || `Step ${stepIdx + 1}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Discussion (25%) */}
        <div className="w-[25%] flex-shrink-0 border-l bg-white overflow-y-auto hidden lg:block" data-testid="right-sidebar">
          <div className="p-5">
            <DiscussionPanel
              profile={profile}
              experimentTitle={experiment.title}
            />
          </div>
        </div>
      </div>

      {/* Quiz Success Modal */}
      <QuizSuccessModal
        open={showQuizSuccessModal}
        data={quizSuccessData}
        celebrationIconIndex={celebrationIconIndex}
        onContinue={handleQuizSuccessContinue}
      />

      {/* Module Complete Modal */}
      <Dialog open={showModuleCompleteModal} onOpenChange={setShowModuleCompleteModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="w-10 h-10 text-muted-foreground" />
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

      {/* Experiment Complete Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Trophy className="w-12 h-12 text-muted-foreground" />
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
              <div className="bg-[#F5F5F5] rounded-xs p-3">
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
              <Share2 className="w-5 h-5" /> Share Your Win
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

      {/* Lab Notes Prompt Modal */}
      <Dialog open={showLabNotePrompt} onOpenChange={setShowLabNotePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif font-normal flex items-center gap-2 text-muted-foreground">
              <NotebookPen className="w-5 h-5" strokeWidth={1.5} />
              Capture Your Insights
            </DialogTitle>
            <DialogDescription>
              What did you learn from this step? Write a quick Lab Note to save to your Vault.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={labNotePromptContent}
            onChange={(e) => setLabNotePromptContent(e.target.value)}
            placeholder="What stood out to you? Any insights, reflections, or action items..."
            rows={4}
            className="resize-none"
            data-testid="textarea-lab-note-prompt"
          />
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="ghost"
              onClick={handleLabNoteDone}
              data-testid="button-skip-lab-note"
            >
              Skip
            </Button>
            <Button
              onClick={() => labNotePromptMutation.mutate()}
              disabled={!labNotePromptContent.trim() || labNotePromptMutation.isPending}
              className="gap-1.5"
              data-testid="button-save-lab-note-prompt"
            >
              <Save className="w-3.5 h-3.5" />
              {labNotePromptMutation.isPending ? "Saving..." : "Save to Vault"}
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
