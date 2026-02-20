import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, GripVertical, Trash2, Save, ArrowLeft, Video, FileText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse, createLesson } from "@/lib/api";

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

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number | null;
  order: number;
}

export default function CourseBuilder() {
  const [, setLocation] = useLocation();
  const { isConnected } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loveCodeArea, setLoveCodeArea] = useState<string>("");
  const [accessType, setAccessType] = useState("public");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      return createCourse(courseData);
    },
    onSuccess: async (course) => {
      for (const lesson of lessons) {
        await createLesson(course.id, {
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl || null,
          duration: lesson.duration,
          order: lesson.order,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({
        title: "Course Created",
        description: "Your course has been created successfully.",
      });
      setLocation(`/experiments/course/${course.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addLesson = () => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      videoUrl: "",
      duration: null,
      order: lessons.length,
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i })));
  };

  const moveLesson = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === lessons.length - 1) return;
    const newLessons = [...lessons];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];
    setLessons(newLessons.map((l, i) => ({ ...l, order: i })));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a course title.",
        variant: "destructive",
      });
      return;
    }
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a course description.",
        variant: "destructive",
      });
      return;
    }

    createCourseMutation.mutate({
      title,
      description,
      thumbnail: thumbnail || null,
      loveCodeArea: loveCodeArea || null,
      accessType,
      price: accessType === "paid" ? price : 0,
      isPublished,
    });
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Please log in to create a course.</p>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/experiments")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-normal text-muted-foreground">Create Course</h1>
            <p className="text-muted-foreground text-sm">Share your knowledge with the community</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter course title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                placeholder="https://example.com/image.jpg"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                data-testid="input-thumbnail"
              />
              {thumbnail && (
                <img src={thumbnail} alt="Thumbnail preview" className="w-full h-40 object-cover rounded-md mt-2" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LOVE Code Area</Label>
                <Select value={loveCodeArea} onValueChange={setLoveCodeArea}>
                  <SelectTrigger data-testid="select-love-code">
                    <SelectValue placeholder="Select area..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LOVE_CODE_AREAS.map(area => (
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

              <div className="space-y-2">
                <Label>Access Type</Label>
                <Select value={accessType} onValueChange={setAccessType}>
                  <SelectTrigger data-testid="select-access-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Value for Value)</SelectItem>
                    <SelectItem value="community">Community Only</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
                data-testid="switch-published"
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lessons</CardTitle>
            <Button onClick={addLesson} size="sm" data-testid="button-add-lesson">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No lessons yet. Click "Add Lesson" to get started.</p>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveLesson(index, "up")}
                        disabled={index === 0}
                        className="p-1 h-auto"
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground text-center">{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Lesson title..."
                        value={lesson.title}
                        onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                        data-testid={`input-lesson-title-${index}`}
                      />
                      <Textarea
                        placeholder="Lesson content (Markdown supported)..."
                        value={lesson.content}
                        onChange={(e) => updateLesson(lesson.id, { content: e.target.value })}
                        rows={3}
                        data-testid={`input-lesson-content-${index}`}
                      />
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Video className="w-3 h-3" /> Video URL
                          </Label>
                          <Input
                            placeholder="https://youtube.com/..."
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                            data-testid={`input-lesson-video-${index}`}
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs text-muted-foreground mb-1 block">Duration (min)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={lesson.duration || ""}
                            onChange={(e) => updateLesson(lesson.id, { duration: parseInt(e.target.value) || null })}
                            data-testid={`input-lesson-duration-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLesson(lesson.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-remove-lesson-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setLocation("/experiments")} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createCourseMutation.isPending}
            data-testid="button-save-course"
          >
            <Save className="w-4 h-4 mr-2" />
            {createCourseMutation.isPending ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
