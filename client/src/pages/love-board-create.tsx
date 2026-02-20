import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLoveBoardPost } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";
import { toast } from "sonner";
import { MembershipGate } from "@/components/membership-gate";

const CATEGORIES = [
  { value: "for_sale", label: "For Sale" },
  { value: "help_wanted", label: "Help Wanted" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

export default function LoveBoardCreate() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { profile } = useNostr();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("for_sale");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const createMutation = useMutation({
    mutationFn: createLoveBoardPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loveBoardPosts"] });
      toast.success("Listing created!");
      setLocation("/leaderboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create listing");
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in the title and description");
      return;
    }
    if (!profile?.userId) {
      toast.error("Please sign in to create a listing");
      return;
    }

    createMutation.mutate({
      authorId: profile.userId,
      title: title.trim(),
      description: description.trim(),
      category,
      price: price.trim() || undefined,
      image: image.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground gap-2"
          onClick={() => setLocation("/leaderboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Love Board
        </Button>

        <div>
          <h1 className="text-2xl font-serif text-muted-foreground" data-testid="text-page-title">Create Listing</h1>
          <p className="text-muted-foreground">Post something for the community marketplace</p>
        </div>

        <MembershipGate feature="loveBoard">
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What are you offering or looking for?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're offering, looking for, or sharing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-white"
                  data-testid="input-description"
                />
              </div>

              {(category === "for_sale" || category === "services") && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    placeholder="e.g. 50 sats, Free, Negotiable"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white"
                    data-testid="input-price"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-white"
                  data-testid="input-image"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Info</Label>
                <Input
                  id="contactInfo"
                  placeholder="How can people reach you? (Nostr npub, email, etc.)"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="bg-white"
                  data-testid="input-contact"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/leaderboard")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="gap-2"
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4" />
                  {createMutation.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </MembershipGate>
      </div>
    </Layout>
  );
}
