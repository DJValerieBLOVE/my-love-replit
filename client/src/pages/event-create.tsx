import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, Save } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/lib/api";
import { toast } from "sonner";

const EVENT_CATEGORIES = [
  "Gathering",
  "Workshop",
  "Support",
  "Meditation",
  "Masterclass",
  "Social",
  "Q&A",
  "Ceremony",
];

const EVENT_TYPES = [
  "Live Workshop",
  "Repeat Event",
  "One-Time Event",
  "Drop-In",
  "Series",
];

const RECURRENCE_OPTIONS = [
  "None",
  "Daily",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
];

export default function EventCreate() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Live Workshop");
  const [recurrence, setRecurrence] = useState("None");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Gathering");

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created!");
      setLocation("/events");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !host.trim() || !date.trim() || !time.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      host: host.trim(),
      date: date.trim(),
      time: time.trim(),
      type,
      recurrence: recurrence === "None" ? undefined : recurrence,
      image: image.trim() || undefined,
      description: description.trim() || undefined,
      category,
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground gap-2"
          onClick={() => setLocation("/events")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Button>

        <div>
          <h1 className="text-2xl font-serif text-muted-foreground" data-testid="text-page-title">Create Event</h1>
          <p className="text-muted-foreground">Host a gathering for the community</p>
        </div>

        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Morning Meditation Circle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host">Host Name *</Label>
              <Input
                id="host"
                placeholder="Your name or organization"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="bg-white"
                data-testid="input-host"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 bg-white"
                    data-testid="input-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10 bg-white"
                    data-testid="input-time"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white" data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="bg-white" data-testid="select-recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <ImageUpload
                value={image}
                onChange={setImage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell people what this event is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-white"
                data-testid="input-description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/events")}
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
                {createMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
