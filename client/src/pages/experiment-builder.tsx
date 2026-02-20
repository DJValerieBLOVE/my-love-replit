import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, GripVertical, Trash2, Save, ArrowLeft, FlaskConical, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExperiment, getAllCommunities } from "@/lib/api";
import { MembershipGate } from "@/components/membership-gate";

const LOVE_CODE_AREAS = [
  { id: "god-love", label: "GOD / LOVE", color: "#eb00a8" },
  { id: "romance", label: "Romance", color: "#e60023" },
  { id: "family", label: "Family", color: "#ff6600" },
  { id: "community", label: "Community", color: "#ffdf00" },
  { id: "mission", label: "Mission", color: "#a2f005" },
  { id: "money", label: "Money", color: "#00d81c" },
  { id: "time", label: "Time", color: "#00ccff" },
  { id: "environment", label: "Environment", color: "#0033ff" },
  { id: "body", label: "Body", color: "#6600ff" },
  { id: "mind", label: "Mind", color: "#9900ff" },
  { id: "soul", label: "Soul", color: "#cc00ff" },
];

const CATEGORIES = [
  "Wellness",
  "Mindfulness",
  "Relationships",
  "Money",
  "Business",
  "Creativity",
  "Spirituality",
  "Health",
  "Personal Growth",
];

interface ExperimentStep {
  id: string;
  order: number;
  title: string;
  prompt: string;
}

export default function ExperimentBuilder() {
  const [, setLocation] = useLocation();
  const { isConnected } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [guide, setGuide] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [loveCodeArea, setLoveCodeArea] = useState<string>("");
  const [accessType, setAccessType] = useState("public");
  const [communityId, setCommunityId] = useState<string>("");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [steps, setSteps] = useState<ExperimentStep[]>([]);

  const { data: communities = [] } = useQuery({
    queryKey: ["communities"],
    queryFn: getAllCommunities,
  });

  const createExperimentMutation = useMutation({
    mutationFn: async (data: any) => {
      return createExperiment(data);
    },
    onSuccess: (experiment) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
      toast({
        title: "Experiment Created",
        description: "Your experiment has been created successfully.",
      });
      setLocation(`/experiments/${experiment.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create experiment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newStep: ExperimentStep = {
      id: crypto.randomUUID(),
      order: steps.length,
      title: "",
      prompt: "",
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id: string, updates: Partial<ExperimentStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === steps.length - 1) return;
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps.map((s, i) => ({ ...s, order: i })));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an experiment title.",
        variant: "destructive",
      });
      return;
    }
    if (!guide.trim()) {
      toast({
        title: "Missing Guide",
        description: "Please enter the guide/creator name.",
        variant: "destructive",
      });
      return;
    }
    if (!category) {
      toast({
        title: "Missing Category",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }
    if (steps.length === 0) {
      toast({
        title: "No Steps",
        description: "Please add at least one step to your experiment.",
        variant: "destructive",
      });
      return;
    }

    const formattedSteps = steps.map((s, i) => ({
      order: i,
      title: s.title,
      prompt: s.prompt,
    }));

    createExperimentMutation.mutate({
      title,
      guide,
      description: description || undefined,
      image: image || undefined,
      category,
      loveCodeArea: loveCodeArea || undefined,
      steps: formattedSteps,
      accessType,
      communityId: accessType === "community" ? communityId : undefined,
      price: accessType === "paid" ? price : 0,
      isPublished,
    });
  };

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/experiments")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-normal text-muted-foreground">Create Experiment</h1>
            <p className="text-muted-foreground">Design a transformative life experiment</p>
          </div>
        </div>

        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="w-5 h-5" />
              Experiment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="guide">Guide / Creator</Label>
                <Input
                  id="guide"
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  placeholder="e.g., Dr. Maya Angelou"
                  data-testid="input-guide"
                />
              </div>
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
              <Label htmlFor="image">Cover Image URL (optional)</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                data-testid="input-image"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} data-testid="select-category">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loveCodeArea">LOVE Code Area (optional)</Label>
                <Select value={loveCodeArea} onValueChange={setLoveCodeArea}>
                  <SelectTrigger id="loveCodeArea">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOVE_CODE_AREAS.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                          {area.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground">Experiment Steps</CardTitle>
            <Button onClick={addStep} size="sm" className="gap-1" data-testid="button-add-step">
              <Plus className="w-4 h-4" />
              Add Step
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xs">
                <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No steps yet. Add steps to define the experiment journey.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div
                  key={step.id}
                  className="border rounded-xs p-4 space-y-3 bg-muted/30"
                  data-testid={`step-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        data-testid={`button-move-up-${index}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        data-testid={`button-move-down-${index}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="font-normal text-sm text-muted-foreground">
                      Step {index + 1}
                    </span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeStep(step.id)}
                      data-testid={`button-remove-step-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 pl-10">
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      placeholder="Step title (e.g., Day 1: Morning Reflection)"
                      data-testid={`input-step-title-${index}`}
                    />
                    <Textarea
                      value={step.prompt}
                      onChange={(e) => updateStep(step.id, { prompt: e.target.value })}
                      placeholder="Prompt or instructions for this step..."
                      rows={2}
                      data-testid={`input-step-prompt-${index}`}
                    />
                  </div>
                </div>
              ))
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
                  <SelectItem value="community">Community - Members only</SelectItem>
                  <SelectItem value="paid">Paid - Requires sats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accessType === "community" && (
              <div className="space-y-2">
                <Label htmlFor="communityId">Community</Label>
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

            {accessType === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (sats)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  data-testid="input-price"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="published">Publish Immediately</Label>
                <p className="text-sm text-muted-foreground">
                  Make this experiment visible to others
                </p>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
                data-testid="switch-published"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/experiments")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createExperimentMutation.isPending}
            className="gap-2"
            data-testid="button-create"
          >
            <Save className="w-4 h-4" />
            {createExperimentMutation.isPending ? "Creating..." : "Create Experiment"}
          </Button>
        </div>
      </div>
      </MembershipGate>
    </Layout>
  );
}
