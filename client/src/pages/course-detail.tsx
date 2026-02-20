import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, PlayCircle, CheckCircle, Clock, Users, MessageCircle, Send, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourse, enrollInCourse, unenrollFromCourse, getCourseEnrollment, updateCourseEnrollment, getCourseComments, createCourseComment } from "@/lib/api";

const LOVE_CODE_COLORS: Record<string, string> = {
  "god-love": "#eb00a8",
  "romance": "#e60023",
  "family": "#ff6600",
  "community": "#ffdf00",
  "mission": "#a2f005",
  "money": "#00d81c",
  "time": "#00ccff",
  "environment": "#0033ff",
  "body": "#6600ff",
  "mind": "#9900ff",
  "soul": "#cc00ff",
};

export default function CourseDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/experiments/course/:id");
  const { isConnected } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [comment, setComment] = useState("");

  const courseId = params?.id;

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["courseEnrollment", courseId],
    queryFn: () => getCourseEnrollment(courseId!),
    enabled: !!courseId && isConnected,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseEnrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast({
        title: "Enrolled!",
        description: "You are now enrolled in this course.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enroll. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: () => unenrollFromCourse(courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseEnrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast({
        title: "Unenrolled",
        description: "You have been unenrolled from this course.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unenroll. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const existingCompleted = enrollment?.completedLessons || [];
      if (existingCompleted.includes(lessonId)) {
        return enrollment;
      }
      const newCompleted = [...existingCompleted, lessonId];
      return updateCourseEnrollment(courseId!, {
        completedLessons: newCompleted,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseEnrollment", courseId] });
      toast({
        title: "Lesson Complete!",
        description: "Great job! Keep going.",
      });
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["courseComments", courseId],
    queryFn: () => getCourseComments(courseId!),
    enabled: !!courseId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createCourseComment(courseId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseComments", courseId] });
      setComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading course...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Course not found.</p>
            <Button onClick={() => setLocation("/experiments")}>Back to Experiments</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentLesson = course.lessons?.[selectedLesson];
  const isEnrolled = !!enrollment;
  const completedLessons = enrollment?.completedLessons || [];
  const isCurrentLessonComplete = currentLesson && completedLessons.includes(currentLesson.id);
  const categoryColor = course.loveCodeArea ? LOVE_CODE_COLORS[course.loveCodeArea] : "#6600ff";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/experiments")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {course.thumbnail && (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-48 md:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl md:text-3xl font-normal text-white">{course.title}</h1>
                  {course.loveCodeArea && (
                    <Badge 
                      style={{ backgroundColor: categoryColor }}
                      className="mt-2 text-white"
                    >
                      {course.loveCodeArea.replace("-", " ").toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {!course.thumbnail && (
              <div>
                <h1 className="text-2xl md:text-3xl font-normal text-muted-foreground">{course.title}</h1>
                {course.loveCodeArea && (
                  <Badge 
                    style={{ backgroundColor: categoryColor }}
                    className="mt-2 text-white"
                  >
                    {course.loveCodeArea.replace("-", " ").toUpperCase()}
                  </Badge>
                )}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.totalEnrollments} enrolled
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    {course.totalLessons} lessons
                  </span>
                  {course.accessType !== "public" && (
                    <Badge variant="secondary">{course.accessType}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {currentLesson && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isCurrentLessonComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {currentLesson.title}
                  </CardTitle>
                  {currentLesson.duration && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentLesson.duration} min
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentLesson.videoUrl && (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <iframe
                        src={currentLesson.videoUrl.includes("youtube") 
                          ? currentLesson.videoUrl.replace("watch?v=", "embed/")
                          : currentLesson.videoUrl
                        }
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {currentLesson.content && (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground">{currentLesson.content}</p>
                    </div>
                  )}
                  {isEnrolled && !isCurrentLessonComplete && (
                    <Button 
                      onClick={() => markCompleteMutation.mutate(currentLesson.id)}
                      disabled={markCompleteMutation.isPending}
                      className="w-full"
                      data-testid="button-mark-complete"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Discussion ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      data-testid="input-comment"
                    />
                    <Button 
                      disabled={!comment.trim() || addCommentMutation.isPending}
                      onClick={() => addCommentMutation.mutate(comment.trim())}
                      data-testid="button-send-comment"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {comments.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {comments.map((c: any) => (
                      <div key={c.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          {c.author?.avatar ? (
                            <img src={c.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 text-xs font-normal">
                                {c.author?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-normal">{c.author?.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-8">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No comments yet. {isConnected ? "Be the first to share!" : "Login to comment."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {isEnrolled ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment?.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment?.progress || 0} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => unenrollMutation.mutate()}
                      disabled={unenrollMutation.isPending}
                      data-testid="button-unenroll"
                    >
                      Unenroll
                    </Button>
                  </>
                ) : (
                  <>
                    {course.accessType === "paid" && course.price > 0 ? (
                      <div className="text-center">
                        <p className="text-2xl font-normal text-yellow-500 flex items-center justify-center gap-1">
                          <Zap className="w-5 h-5" />
                          {course.price.toLocaleString()} sats
                        </p>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => enrollMutation.mutate()}
                          disabled={enrollMutation.isPending || !isConnected}
                          data-testid="button-enroll-paid"
                        >
                          {isConnected ? "Pay & Enroll" : "Login to Enroll"}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending || !isConnected}
                        data-testid="button-enroll"
                      >
                        {isConnected ? "Enroll Now (Free)" : "Login to Enroll"}
                      </Button>
                    )}
                  </>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  Value for Value - zap the creator if you find this valuable
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson: any, index: number) => {
                    const isComplete = completedLessons.includes(lesson.id);
                    const isSelected = index === selectedLesson;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                          isSelected ? "bg-purple-100 border border-purple-200" : "hover:bg-muted"
                        }`}
                        data-testid={`lesson-${index}`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isComplete ? "bg-green-500 text-white" : "bg-muted"
                        }`}>
                          {isComplete ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-normal truncate">{lesson.title}</p>
                          {lesson.duration && (
                            <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lessons yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Created by</p>
                <div className="flex items-center gap-3">
                  {course.creator?.avatar ? (
                    <img src={course.creator.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-normal">
                        {course.creator?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-normal">{course.creator?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{course.creator?.handle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
