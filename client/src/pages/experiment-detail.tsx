import { useRoute } from "wouter";
import Layout from "@/components/layout";
import { EXPERIMENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, PlayCircle, Award, Clock, BookOpen, Zap, MessageCircle, Send, Video, FlaskConical, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ExperimentDetail() {
  const [, params] = useRoute("/experiments/:id");
  const experiment = EXPERIMENTS.find(m => m.id === params?.id);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", text: "This discovery really shifted my perspective! 🙌", time: "2h ago", likes: 12 },
    { id: 2, author: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", text: "Anyone else testing this hypothesis?", time: "1h ago", likes: 5 },
  ]);

  if (!experiment) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <p className="text-muted-foreground">Experiment not found</p>
        </div>
      </Layout>
    );
  }

  const discoveries = [
    { num: 1, title: "Hypothesis", duration: "Day 1", locked: false },
    { num: 2, title: "Method Setup", duration: "Day 2", locked: false },
    { num: 3, title: "First Findings", duration: "Day 3", locked: false },
    { num: 4, title: "Deep Dive Analysis", duration: "Day 4", locked: experiment.completedDiscoveries < 3 },
    { num: 5, title: "Conclusion & Results", duration: "Day 5", locked: experiment.completedDiscoveries < 4 },
  ];

  const isInProgress = experiment.progress > 0 && experiment.progress < 100;
  const isCompleted = experiment.progress === 100;

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
        <Link href="/experiments">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Experiments
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-md overflow-hidden h-80">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img 
            src={experiment.image} 
            alt={experiment.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-3 bg-white/90 text-black hover:bg-white" data-testid={`badge-category-${experiment.id}`}>
                  {experiment.category}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-white mb-2">{experiment.title}</h1>
                <p className="text-white/90 text-lg">Guided by {experiment.guide}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" data-testid={`text-progress-${experiment.id}`}>Your Progress</h3>
                <div className="text-3xl font-black text-primary">{experiment.progress}%</div>
              </div>
              <Progress value={experiment.progress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {experiment.completedDiscoveries} of {experiment.totalDiscoveries} discoveries made
              </p>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-cyan-500" />
                <h3 className="font-bold text-lg">Duration</h3>
              </div>
              <p className="text-3xl font-black text-cyan-500 mb-2">5 Days</p>
              <p className="text-sm text-muted-foreground">Weekly Experiment</p>
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
              <p className="text-sm text-muted-foreground">+ Science Badge</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          className="mb-8 px-8 py-3 font-semibold gap-2 rounded-full" 
          data-testid={`button-${isCompleted ? 'review' : isInProgress ? 'resume' : 'start'}-experiment`}
        >
          {isCompleted ? (
            <><CheckCircle className="w-5 h-5" /> Review Experiment</>
          ) : isInProgress ? (
            <><FlaskConical className="w-5 h-5" /> Resume Experiment</>
          ) : (
            <><FlaskConical className="w-5 h-5" /> Begin Experiment</>
          )}
        </Button>

        {/* Discoveries */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-serif mb-6">Daily Discoveries</h2>
          <div className="space-y-3">
            {discoveries.map((discovery, idx) => (
              <Card 
                key={discovery.num} 
                className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  idx < experiment.completedDiscoveries ? 'bg-primary/5' : ''
                }`}
                data-testid={`card-discovery-${experiment.id}-${discovery.num}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {idx < experiment.completedDiscoveries ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold" data-testid={`text-discovery-title-${discovery.num}`}>{discovery.title}</h3>
                      <p className="text-sm text-muted-foreground">{discovery.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {discovery.locked && (
                      <Badge variant="secondary" className="text-xs">Locked</Badge>
                    )}
                    <div className="text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Experiment Description */}
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              About This Experiment
            </h3>
            <p className="text-foreground leading-relaxed mb-4">
              This experiment invites you to explore {experiment.category.toLowerCase()} principles in your daily life. 
              You'll test hypotheses, gather data on yourself, and record your findings.
            </p>
            <p className="text-foreground leading-relaxed">
              By completing this experiment, you'll gain valuable insights into your own "Human Operating System" 
              and earn rewards that contribute to your growth.
            </p>
          </CardContent>
        </Card>

        {/* Lab Notes / Discussion */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Lab Partners Discussion
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
                    placeholder="Share your findings, questions, or ahas with the community..."
                    className="w-full p-3 rounded-xs bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    data-testid="textarea-discussion"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      className="gap-2 rounded-md"
                      data-testid="button-post-comment"
                    >
                      <Send className="w-4 h-4" /> Share Findings
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
                        className="text-muted-foreground hover:text-primary rounded-md"
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
