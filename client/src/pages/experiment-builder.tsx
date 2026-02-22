import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus, GripVertical, Trash2, Save, ArrowLeft, FlaskConical, Loader2,
  ChevronUp, ChevronDown, ChevronRight, Video, User as UserIcon, Upload, Image as ImageIcon,
  HelpCircle, X
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExperiment, updateExperiment, getExperiment, getAllCommunities } from "@/lib/api";
import { MembershipGate } from "@/components/membership-gate";
import { ELEVEN_DIMENSIONS, EXPERIMENT_TAGS } from "@/lib/mock-data";
import { useRichTextEditor, RichTextEditorContent, richTextEditorStyles } from "@/components/rich-text-editor";
import type { ExperimentModule, ExperimentStep } from "@shared/schema";

function isValidVideoUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/.test(url);
}

interface ModuleState extends ExperimentModule {}

function StepEditor({
  step,
  stepIndex,
  moduleIndex,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  step: ExperimentStep;
  stepIndex: number;
  moduleIndex: number;
  onUpdate: (updates: Partial<ExperimentStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const editor = useRichTextEditor({
    content: step.content || "",
    placeholder: "Write the lesson content here...",
    onUpdate: (html) => onUpdate({ content: html }),
  });

  return (
    <div className="border rounded-xs p-3 space-y-3 bg-white" data-testid={`step-${moduleIndex}-${stepIndex}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onMoveUp} disabled={isFirst} data-testid={`button-move-step-up-${moduleIndex}-${stepIndex}`}>
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onMoveDown} disabled={isLast} data-testid={`button-move-step-down-${moduleIndex}-${stepIndex}`}>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Step {stepIndex + 1}</span>
        <button
          type="button"
          className="ml-auto mr-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={`button-toggle-step-${moduleIndex}-${stepIndex}`}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </button>
        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          data-testid={`button-remove-step-${moduleIndex}-${stepIndex}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pl-10">
          <Input
            value={step.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Step title (e.g., Day 1: Morning Reflection)"
            data-testid={`input-step-title-${moduleIndex}-${stepIndex}`}
          />

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Video className="w-3 h-3" /> Lesson Video <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              value={step.videoUrl || ""}
              onChange={(e) => {
                const url = e.target.value;
                onUpdate({ videoUrl: url });
              }}
              onBlur={(e) => {
                const url = e.target.value.trim();
                if (url && !isValidVideoUrl(url)) {
                  onUpdate({ videoUrl: "" });
                  alert("Please enter a valid YouTube or Vimeo URL.");
                }
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              data-testid={`input-step-video-${moduleIndex}-${stepIndex}`}
            />
          </div>

          <div>
            <style>{richTextEditorStyles}</style>
            {editor && <RichTextEditorContent editor={editor} className="min-h-[250px] border rounded-xs p-3" />}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Quiz Questions <span className="text-destructive">*</span>
            </Label>
            {(!step.quizQuestions || step.quizQuestions.length === 0) && (
              <p className="text-xs text-destructive">At least 1 quiz question is required per step</p>
            )}
            {(step.quizQuestions || []).map((q, qIdx) => (
              <div key={qIdx} className="border rounded-xs p-3 space-y-2 bg-[#F5F5F5]" data-testid={`quiz-question-${moduleIndex}-${stepIndex}-${qIdx}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Question {qIdx + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => {
                      const updated = [...(step.quizQuestions || [])];
                      updated.splice(qIdx, 1);
                      onUpdate({ quizQuestions: updated });
                    }}
                    data-testid={`button-remove-quiz-${moduleIndex}-${stepIndex}-${qIdx}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...(step.quizQuestions || [])];
                    updated[qIdx] = { ...updated[qIdx], question: e.target.value };
                    onUpdate({ quizQuestions: updated });
                  }}
                  placeholder="Enter your question..."
                  data-testid={`input-quiz-question-${moduleIndex}-${stepIndex}-${qIdx}`}
                />
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(step.quizQuestions || [])];
                          updated[qIdx] = { ...updated[qIdx], correctIndex: optIdx };
                          onUpdate({ quizQuestions: updated });
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          q.correctIndex === optIdx
                            ? 'border-primary bg-primary'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        data-testid={`button-correct-${moduleIndex}-${stepIndex}-${qIdx}-${optIdx}`}
                      >
                        {q.correctIndex === optIdx && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...(step.quizQuestions || [])];
                          const newOptions = [...updated[qIdx].options];
                          newOptions[optIdx] = e.target.value;
                          updated[qIdx] = { ...updated[qIdx], options: newOptions };
                          onUpdate({ quizQuestions: updated });
                        }}
                        placeholder={`Option ${optIdx + 1}`}
                        className="flex-1"
                        data-testid={`input-quiz-option-${moduleIndex}-${stepIndex}-${qIdx}-${optIdx}`}
                      />
                      {q.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => {
                            const updated = [...(step.quizQuestions || [])];
                            const newOptions = [...updated[qIdx].options];
                            newOptions.splice(optIdx, 1);
                            let newCorrect = updated[qIdx].correctIndex;
                            if (optIdx < newCorrect) newCorrect--;
                            else if (optIdx === newCorrect) newCorrect = 0;
                            updated[qIdx] = { ...updated[qIdx], options: newOptions, correctIndex: newCorrect };
                            onUpdate({ quizQuestions: updated });
                          }}
                          data-testid={`button-remove-option-${moduleIndex}-${stepIndex}-${qIdx}-${optIdx}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground"
                      onClick={() => {
                        const updated = [...(step.quizQuestions || [])];
                        updated[qIdx] = { ...updated[qIdx], options: [...updated[qIdx].options, ""] };
                        onUpdate({ quizQuestions: updated });
                      }}
                      data-testid={`button-add-option-${moduleIndex}-${stepIndex}-${qIdx}`}
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Click the circle to mark the correct answer</p>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                const newQuestion = { question: "", options: ["", ""], correctIndex: 0 };
                onUpdate({ quizQuestions: [...(step.quizQuestions || []), newQuestion] });
              }}
              data-testid={`button-add-quiz-${moduleIndex}-${stepIndex}`}
            >
              <HelpCircle className="w-3 h-3" /> Add Quiz Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperimentBuilder() {
  const [, setLocation] = useLocation();
  const [, editParams] = useRoute("/experiments/edit/:id");
  const editId = editParams?.id;
  const isEditMode = !!editId;
  const { isConnected, profile } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [dimension, setDimension] = useState<string>("");
  const [benefitsFor, setBenefitsFor] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [accessType, setAccessType] = useState("public");
  const [communityId, setCommunityId] = useState<string>("");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved" | "idle">("idle");
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const lastSavedRef = useRef<string>("");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: existingExperiment, isLoading: isLoadingExperiment } = useQuery({
    queryKey: ["experiment", editId],
    queryFn: () => getExperiment(editId!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingExperiment && !hasLoadedDraft) {
      setTitle(existingExperiment.title || "");
      setDescription(existingExperiment.description || "");
      setImage(existingExperiment.image || "");
      setDimension(existingExperiment.dimension || "");
      setBenefitsFor(existingExperiment.benefitsFor || "");
      setOutcomes(existingExperiment.outcomes || "");
      setSelectedTags(existingExperiment.tags || []);
      setAccessType(existingExperiment.accessType || "public");
      setCommunityId(existingExperiment.communityId || "");
      setPrice(existingExperiment.price || 0);
      setIsPublished(existingExperiment.isPublished || false);
      setModules(existingExperiment.modules || []);
      if (existingExperiment.modules?.length > 0) {
        setExpandedModules(new Set([existingExperiment.modules[0].id]));
      }
      setHasLoadedDraft(true);
      setAutoSaveStatus("saved");
    }
  }, [existingExperiment, hasLoadedDraft]);

  const getCurrentData = useCallback(() => ({
    title, description, image, dimension: dimension || "mind",
    benefitsFor: benefitsFor || undefined, outcomes: outcomes || undefined,
    tags: selectedTags, modules, accessType,
    communityId: accessType === "community" ? communityId : undefined,
    price: 0,
    isPublished,
  }), [title, description, image, dimension, benefitsFor, outcomes, selectedTags, modules, accessType, communityId, isPublished]);

  useEffect(() => {
    if (hasLoadedDraft && isEditMode) {
      lastSavedRef.current = JSON.stringify(getCurrentData());
    }
  }, [hasLoadedDraft, isEditMode, getCurrentData]);

  const autoSave = useCallback(async () => {
    if (!editId || !title.trim()) return;
    const currentSnapshot = JSON.stringify(getCurrentData());
    if (currentSnapshot === lastSavedRef.current) return;
    setAutoSaveStatus("saving");
    try {
      await updateExperiment(editId, getCurrentData());
      lastSavedRef.current = currentSnapshot;
      setAutoSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["experiment", editId] });
    } catch {
      setAutoSaveStatus("unsaved");
    }
  }, [editId, title, getCurrentData, queryClient]);

  useEffect(() => {
    if (!isEditMode || !hasLoadedDraft) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus("unsaved");
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 5000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, description, image, dimension, benefitsFor, outcomes, selectedTags, modules, accessType, communityId, isPublished, isEditMode, hasLoadedDraft, autoSave]);

  const handleThumbnailUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImage(data.url);
    } catch {} finally {
      setIsUploadingThumb(false);
    }
  }, []);

  const { data: communities = [] } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const createExperimentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return updateExperiment(editId, data);
      }
      return createExperiment(data);
    },
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
      queryClient.invalidateQueries({ queryKey: ["creatorExperiments"] });
      if (isEditMode) {
        toast({
          title: "Experiment Updated",
          description: "Your changes have been saved.",
        });
      } else {
        toast({
          title: "Experiment Created",
          description: "Your experiment has been created successfully.",
        });
      }
      setLocation(`/experiments/${experiment.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update experiment." : "Failed to create experiment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const addModule = () => {
    const newModule: ModuleState = {
      id: crypto.randomUUID(),
      order: modules.length,
      title: "",
      description: "",
      steps: [],
    };
    setModules([...modules, newModule]);
    setExpandedModules((prev) => new Set(prev).add(newModule.id));
  };

  const updateModule = (id: string, updates: Partial<ModuleState>) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i })));
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const moveModule = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === modules.length - 1) return;
    const newModules = [...modules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    setModules(newModules.map((m, i) => ({ ...m, order: i })));
  };

  const addStep = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const newStep: ExperimentStep = {
      id: crypto.randomUUID(),
      order: mod.steps.length,
      title: "",
      content: "",
      videoUrl: "",
      quizQuestions: [],
    };
    updateModule(moduleId, { steps: [...mod.steps, newStep] });
  };

  const updateStep = (moduleId: string, stepId: string, updates: Partial<ExperimentStep>) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    updateModule(moduleId, {
      steps: mod.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    });
  };

  const removeStep = (moduleId: string, stepId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    updateModule(moduleId, {
      steps: mod.steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, order: i })),
    });
  };

  const moveStep = (moduleId: string, index: number, direction: "up" | "down") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === mod.steps.length - 1) return;
    const newSteps = [...mod.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    updateModule(moduleId, { steps: newSteps.map((s, i) => ({ ...s, order: i })) });
  };

  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return updateExperiment(editId, data);
      }
      return createExperiment(data);
    },
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
      queryClient.invalidateQueries({ queryKey: ["creatorExperiments"] });
      toast({ title: "Draft Saved", description: "Your progress has been saved." });
      if (!isEditMode) {
        setLocation(`/experiments/edit/${experiment.id}`);
      }
      lastSavedRef.current = JSON.stringify(getCurrentData());
      setAutoSaveStatus("saved");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    },
  });

  const handleSubmit = (asDraft: boolean = false) => {
    if (!title.trim()) {
      toast({ title: "Missing Title", description: "Please enter an experiment title.", variant: "destructive" });
      return;
    }
    if (!asDraft && !dimension) {
      toast({ title: "Missing Dimension", description: "Please select a dimension.", variant: "destructive" });
      return;
    }
    if (!asDraft && modules.length === 0) {
      toast({ title: "No Modules", description: "Please add at least one module to your experiment.", variant: "destructive" });
      return;
    }
    if (!asDraft && selectedTags.length < 2) {
      toast({ title: "Missing Tags", description: "Please select at least 2 tags.", variant: "destructive" });
      return;
    }
    if (!asDraft) {
      const missingQuiz = modules.some((m) =>
        m.steps.some((s) => !s.quizQuestions || s.quizQuestions.length === 0)
      );
      if (missingQuiz) {
        toast({ title: "Missing Quiz", description: "Every step must have at least 1 quiz question.", variant: "destructive" });
        return;
      }
    }

    const data = {
      title,
      description: description || undefined,
      image: image || undefined,
      dimension: dimension || "mind",
      benefitsFor: benefitsFor || undefined,
      outcomes: outcomes || undefined,
      tags: selectedTags,
      modules,
      accessType,
      communityId: accessType === "community" ? communityId : undefined,
      price: 0,
      isPublished: asDraft ? false : isPublished,
    };

    if (asDraft) {
      saveDraftMutation.mutate(data);
    } else {
      createExperimentMutation.mutate(data);
    }
  };

  const selectedDimension = ELEVEN_DIMENSIONS.find((d) => d.id === dimension);

  if (isEditMode && isLoadingExperiment) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8 flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Please log in to create an experiment.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">Go Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MembershipGate feature="createExperiments" fallback={
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <FlaskConical className="w-12 h-12 mx-auto mb-4" style={{ color: '#6600ff' }} />
            <h2 className="text-xl mb-2" style={{ fontFamily: 'Marcellus, serif' }}>Creator Access Required</h2>
            <p className="text-muted-foreground mb-4">Creating experiments is available with a Creator membership.</p>
            <Button onClick={() => setLocation("/settings")} data-testid="button-upgrade">View Membership Options</Button>
          </Card>
        </div>
      }>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/experiments")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-normal text-muted-foreground">
                {isEditMode ? "Edit Experiment" : "Create Experiment"}
              </h1>
              <p className="text-muted-foreground">Design a transformative life experiment</p>
            </div>
          </div>
          {isEditMode && (
            <div className="text-xs text-muted-foreground" data-testid="text-autosave-status">
              {autoSaveStatus === "saving" && "Saving..."}
              {autoSaveStatus === "saved" && "All changes saved"}
              {autoSaveStatus === "unsaved" && "Unsaved changes"}
            </div>
          )}
        </div>

        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="w-5 h-5" />
              Experiment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xs">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                {profile?.picture ? (
                  <img src={profile.picture} alt={profile.name || "Guide"} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guide</p>
                <p className="text-sm font-serif" data-testid="text-guide-name">{profile?.name || "Your Name"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 7-Day Gratitude Challenge"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimension">11 Dimensions <span className="text-destructive">*</span></Label>
              <Select value={dimension} onValueChange={setDimension} data-testid="select-dimension">
                <SelectTrigger id="dimension">
                  <SelectValue placeholder="Select dimension">
                    {selectedDimension && (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedDimension.hex }} />
                        {selectedDimension.name}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="max-h-[220px]">
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
            </div>

            <div className="space-y-2">
              <Label>Tags <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground ml-1">(minimum 2, up to 5)</span></Label>
              <div className="flex flex-wrap gap-2">
                {EXPERIMENT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        } else if (selectedTags.length < 5) {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${isSelected ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                      data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedTags.length}/5 tags selected</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what participants will experience and learn..."
                rows={3}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefitsFor">Who Could Benefit</Label>
              <Textarea
                id="benefitsFor"
                value={benefitsFor}
                onChange={(e) => setBenefitsFor(e.target.value)}
                placeholder="Describe who this experiment is designed for..."
                rows={2}
                data-testid="input-benefits"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcomes">Outcomes & Goals</Label>
              <Textarea
                id="outcomes"
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                placeholder="What outcomes could participants hope to achieve..."
                rows={2}
                data-testid="input-outcomes"
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {image ? (
                <div className="flex items-center gap-3">
                  <div className="w-40 h-[90px] border border-gray-200 overflow-hidden flex-shrink-0">
                    <img src={image} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">Thumbnail uploaded</p>
                    <p className="text-[11px] text-muted-foreground">16:9 aspect ratio</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setImage("")} data-testid="button-remove-thumbnail">
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    disabled={isUploadingThumb}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-dashed border-gray-300 hover:border-gray-400 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    data-testid="button-upload-thumbnail"
                  >
                    {isUploadingThumb ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Upload Thumbnail
                        <span className="text-xs text-muted-foreground ml-auto">16:9</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground">Modules & Steps</CardTitle>
            <Button onClick={addModule} size="sm" className="gap-1" data-testid="button-add-module">
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xs">
                <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No modules yet. Add modules to build your experiment curriculum.</p>
                <p className="text-xs mt-1">Each module contains one or more steps/lessons.</p>
              </div>
            ) : (
              modules.map((mod, modIndex) => {
                const isExpanded = expandedModules.has(mod.id);
                return (
                  <div key={mod.id} className="border rounded-xs overflow-hidden bg-muted/30" data-testid={`module-${modIndex}`}>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveModule(modIndex, "up")} disabled={modIndex === 0} data-testid={`button-move-module-up-${modIndex}`}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveModule(modIndex, "down")} disabled={modIndex === modules.length - 1} data-testid={`button-move-module-down-${modIndex}`}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-serif">Module {modIndex + 1}</span>
                      <div className="flex-1 mx-2">
                        <Input
                          value={mod.title}
                          onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                          placeholder="Module title"
                          className="h-8 text-sm bg-white"
                          data-testid={`input-module-title-${modIndex}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{mod.steps.length} step{mod.steps.length !== 1 ? "s" : ""}</span>
                      <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => toggleModule(mod.id)} data-testid={`button-toggle-module-${modIndex}`}>
                        <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeModule(mod.id)}
                        data-testid={`button-remove-module-${modIndex}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="p-3 space-y-3">
                        <Textarea
                          value={mod.description}
                          onChange={(e) => updateModule(mod.id, { description: e.target.value })}
                          placeholder="Module description (optional)"
                          rows={1}
                          className="text-sm"
                          data-testid={`input-module-description-${modIndex}`}
                        />

                        {mod.steps.map((step, stepIndex) => (
                          <StepEditor
                            key={step.id}
                            step={step}
                            stepIndex={stepIndex}
                            moduleIndex={modIndex}
                            onUpdate={(updates) => updateStep(mod.id, step.id, updates)}
                            onRemove={() => removeStep(mod.id, step.id)}
                            onMoveUp={() => moveStep(mod.id, stepIndex, "up")}
                            onMoveDown={() => moveStep(mod.id, stepIndex, "down")}
                            isFirst={stepIndex === 0}
                            isLast={stepIndex === mod.steps.length - 1}
                          />
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full border-dashed"
                          onClick={() => addStep(mod.id)}
                          data-testid={`button-add-step-${modIndex}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add Step
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Access & Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessType">Access Type</Label>
              <Select value={accessType} onValueChange={setAccessType}>
                <SelectTrigger id="accessType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="community">Tribe - Members only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accessType === "community" && (
              <div className="space-y-2">
                <Label htmlFor="communityId">Tribe</Label>
                <Select value={communityId} onValueChange={setCommunityId}>
                  <SelectTrigger id="communityId">
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community: any) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="published">Publish Immediately</Label>
                <p className="text-sm text-muted-foreground">Make this experiment visible to others</p>
              </div>
              <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} data-testid="switch-published" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/experiments")} data-testid="button-cancel">
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={saveDraftMutation.isPending}
              className="gap-2"
              data-testid="button-save-draft"
            >
              <Save className="w-4 h-4" />
              {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={createExperimentMutation.isPending}
              className="gap-2"
              data-testid="button-publish"
            >
              <Save className="w-4 h-4" />
              {createExperimentMutation.isPending
                ? (isEditMode ? "Saving..." : "Creating...")
                : (isEditMode ? "Publish Experiment" : "Create Experiment")}
            </Button>
          </div>
        </div>
      </div>
      </MembershipGate>
    </Layout>
  );
}
