import { useRoute } from "wouter";
import Layout from "@/components/layout";
import { MISSIONS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, PlayCircle, Award, Clock, BookOpen, Zap, MessageCircle, Send, Video } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function MissionDetail() {
  const [, params] = useRoute("/missions/:id");
  const mission = MISSIONS.find(m => m.id === params?.id);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", text: "This lesson really helped me understand the core concepts! 🙌", time: "2h ago", likes: 12 },
    { id: 2, author: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", text: "Anyone stuck on the practical application? Let's discuss!", time: "1h ago", likes: 5 },
  ]);

  if (!mission) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <p className="text-muted-foreground">Mission not found</p>
        </div>
      </Layout>
    );
  }

  const lessons = [
    { num: 1, title: "Introduction", duration: "8 min", locked: false },
    { num: 2, title: "Core Concepts", duration: "12 min", locked: false },
    { num: 3, title: "Practical Application", duration: "15 min", locked: false },
    { num: 4, title: "Deep Dive", duration: "20 min", locked: mission.completedLessons < 3 },
    { num: 5, title: "Workshop Challenge", duration: "25 min", locked: mission.completedLessons < 4 },
  ];

  const isInProgress = mission.progress > 0 && mission.progress < 100;
  const isCompleted = mission.progress === 100;
  const notStarted = mission.progress === 0;

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        author: "You",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        text: newComment,
        time: "now",
        likes: 0
      }]);
      setNewComment("");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Missions
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden h-80">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img 
            src={mission.image} 
            alt={mission.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-3 bg-white/90 text-black hover:bg-white" data-testid={`badge-category-${mission.id}`}>
                  {mission.category}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-white mb-2">{mission.title}</h1>
                <p className="text-white/90 text-lg">with {mission.instructor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" data-testid={`text-progress-${mission.id}`}>Your Progress</h3>
                <div className="text-3xl font-black text-primary">{mission.progress}%</div>
              </div>
              <Progress value={mission.progress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {mission.completedLessons} of {mission.totalLessons} lessons completed
              </p>
            </CardContent>
          </Card>

          {/* Time Investment */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-cyan-500" />
                <h3 className="font-bold text-lg">Time Investment</h3>
              </div>
              <p className="text-3xl font-black text-cyan-500 mb-2">~{mission.totalLessons * 2}h</p>
              <p className="text-sm text-muted-foreground">Average completion time</p>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-500" />
                <h3 className="font-bold text-lg">Rewards</h3>
              </div>
              <p className="text-3xl font-black text-yellow-500 mb-2">5000 Sats</p>
              <p className="text-sm text-muted-foreground">+ Exclusive Badge</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          className="mb-8 px-8 py-3 font-semibold gap-2 bg-primary hover:bg-primary/90 rounded-full" 
          data-testid={`button-${isCompleted ? 'review' : isInProgress ? 'resume' : 'start'}-mission`}
        >
          {isCompleted ? (
            <><CheckCircle className="w-5 h-5" /> Review Mission</>
          ) : isInProgress ? (
            <><PlayCircle className="w-5 h-5" /> Resume Mission</>
          ) : (
            <><PlayCircle className="w-5 h-5" /> Start Mission</>
          )}
        </Button>

        {/* Lessons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-serif mb-6">Mission Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <Card 
                key={lesson.num} 
                className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  idx < mission.completedLessons ? 'bg-primary/5' : ''
                }`}
                data-testid={`card-lesson-${mission.id}-${lesson.num}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {idx < mission.completedLessons ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {lesson.num}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold" data-testid={`text-lesson-title-${lesson.num}`}>{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.locked && (
                      <Badge variant="secondary" className="text-xs">Locked</Badge>
                    )}
                    <div className="text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Description */}
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              About This Mission
            </h3>
            <p className="text-foreground leading-relaxed mb-4">
              This comprehensive mission guides you through {mission.category.toLowerCase()} principles and practices. 
              You'll learn from industry experts, engage with real-world examples, and complete hands-on challenges to solidify your knowledge.
            </p>
            <p className="text-foreground leading-relaxed">
              By completing this mission, you'll gain valuable skills aligned with the 11x LOVE Code methodology and earn rewards 
              that contribute to your overall growth across all life dimensions.
            </p>
          </CardContent>
        </Card>

        {/* Gamification Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-lg">12</p>
              <p className="text-xs text-muted-foreground">XP Points</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="font-bold text-lg">1</p>
              <p className="text-xs text-muted-foreground">Badge Unlock</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <PlayCircle className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
              <p className="font-bold text-lg">{mission.totalLessons - mission.completedLessons}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-lg">{mission.progress === 100 ? '✓' : '−'}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Video Area */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-serif mb-6">Lesson Video</h2>
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="relative w-full bg-black/80 aspect-video flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Video className="w-20 h-20 text-primary/40 group-hover:text-primary/60 transition-colors" />
              <Button 
                className="absolute gap-2 bg-primary hover:bg-primary/90 rounded-2xl px-6 py-3"
                data-testid="button-play-video"
              >
                <PlayCircle className="w-5 h-5" /> Play Lesson
              </Button>
            </div>
            <CardContent className="p-6 bg-card">
              <h3 className="font-bold text-lg mb-2" data-testid="text-video-title">Lesson 1: Introduction to {mission.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">Duration: 8 minutes</p>
              <p className="text-foreground">Watch this comprehensive introduction to understand the fundamentals and learning objectives for this mission.</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Materials */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-serif mb-6">Course Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid="card-material-slides">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Presentation Slides</h3>
                  <p className="text-sm text-muted-foreground">PDF • 2.4 MB</p>
                </div>
                <Button variant="ghost" className="rounded-lg" data-testid="button-download-slides">Download</Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid="card-material-workbook">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Student Workbook</h3>
                  <p className="text-sm text-muted-foreground">DOCX • 1.8 MB</p>
                </div>
                <Button variant="ghost" className="rounded-2xl" data-testid="button-download-workbook">Download</Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid="card-material-resources">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Additional Resources</h3>
                  <p className="text-sm text-muted-foreground">LINK • External</p>
                </div>
                <Button variant="ghost" className="rounded-2xl" data-testid="button-view-resources">View</Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid="card-material-transcript">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Video Transcript</h3>
                  <p className="text-sm text-muted-foreground">TXT • 285 KB</p>
                </div>
                <Button variant="ghost" className="rounded-2xl" data-testid="button-download-transcript">Download</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student Discussion */}
        <div>
          <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Student Discussion
          </h2>
          
          {/* Comment Input */}
          <Card className="border-none shadow-sm bg-card/50 mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" 
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, questions, or insights with the community..."
                    className="w-full p-3 rounded-2xl bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    data-testid="textarea-discussion"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      className="gap-2 bg-primary hover:bg-primary/90 rounded-2xl"
                      data-testid="button-post-comment"
                    >
                      <Send className="w-4 h-4" /> Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="border-none shadow-sm" data-testid={`card-comment-${comment.id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img 
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-foreground" data-testid={`text-commenter-${comment.id}`}>{comment.author}</p>
                          <p className="text-xs text-muted-foreground">{comment.time}</p>
                        </div>
                      </div>
                      <p className="text-foreground mb-3">{comment.text}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-primary rounded-2xl"
                        data-testid={`button-like-comment-${comment.id}`}
                      >
                        ❤️ {comment.likes}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
