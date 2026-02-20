import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Globe, Lock, Zap, Plus, X, Users } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { useState } from "react";
import { useLocation } from "wouter";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommunity } from "@/lib/api";
import { MembershipGate } from "@/components/membership-gate";
import { EXPERIMENT_CATEGORIES, EXPERIMENT_TAGS } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CommunityCreate() {
  const [, setLocation] = useLocation();
  const { isConnected } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [accessType, setAccessType] = useState("public");
  const [price, setPrice] = useState(0);
  const [approvalQuestions, setApprovalQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: any) => createCommunity(data),
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast({
        title: "Community Created!",
        description: `${name} is now live.`,
      });
      setLocation(`/community/${community.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive",
      });
    },
  });

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setApprovalQuestions([...approvalQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setApprovalQuestions(approvalQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      category: category || undefined,
      tags: selectedTags,
      accessType,
      price: accessType === "paid" ? price : 0,
      approvalQuestions: accessType === "approval" ? approvalQuestions : [],
    });
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Please login to create a community.</p>
            <Button onClick={() => setLocation("/community")}>Back to Communities</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MembershipGate feature="createTribes" fallback={
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#6600ff' }} />
            <h2 className="text-xl mb-2" style={{ fontFamily: 'Marcellus, serif' }}>Annual Membership Required</h2>
            <p className="text-muted-foreground mb-4">Creating Tribes is available with an annual Core or Creator membership.</p>
            <Button onClick={() => setLocation("/settings")} data-testid="button-upgrade">View Membership Options</Button>
          </Card>
        </div>
      }>
      <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/community")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-serif font-normal text-muted-foreground">Create Community</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Info</CardTitle>
              <CardDescription>Give your community a name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Manifesters"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this community about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUpload
                  value={image}
                  onChange={setImage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" data-testid="select-tribe-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIMENT_CATEGORIES.filter(c => c.id !== "all").map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags (select up to 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIMENT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else if (selectedTags.length < 5) {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${isSelected ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                        data-testid={`tag-tribe-${tag.toLowerCase().replace(/\s+/g, "-")}`}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Access Type</CardTitle>
              <CardDescription>Choose who can join your community</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={accessType} onValueChange={setAccessType} className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-[#F5F5F5] cursor-pointer" onClick={() => setAccessType("public")}>
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Public
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Anyone can join instantly</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-[#F5F5F5] cursor-pointer" onClick={() => setAccessType("approval")}>
                  <RadioGroupItem value="approval" id="approval" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="approval" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Approval Required
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">You approve each member manually</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-[#F5F5F5] cursor-pointer" onClick={() => setAccessType("paid")}>
                  <RadioGroupItem value="paid" id="paid" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="paid" className="flex items-center gap-2 cursor-pointer">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      Paid
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Members pay sats to join</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {accessType === "paid" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-32"
                    data-testid="input-price"
                  />
                  <span className="text-muted-foreground">sats</span>
                </div>
              </CardContent>
            </Card>
          )}

          {accessType === "approval" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Questions</CardTitle>
                <CardDescription>Questions to ask when someone requests to join (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvalQuestions.map((q, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="flex-1 text-sm">{q}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveQuestion(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQuestion())}
                    data-testid="input-question"
                  />
                  <Button type="button" variant="outline" onClick={handleAddQuestion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createMutation.isPending || !name.trim() || !description.trim()}
            data-testid="button-create"
          >
            {createMutation.isPending ? "Creating..." : "Create Community"}
          </Button>
        </form>
      </div>
      </MembershipGate>
    </Layout>
  );
}
