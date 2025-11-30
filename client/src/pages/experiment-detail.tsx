import { useRoute } from "wouter";
import Layout from "@/components/layout";
import { EXPERIMENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle, 
  Award, 
  Clock, 
  BookOpen, 
  Zap, 
  MessageCircle, 
  Send, 
  Video, 
  FlaskConical, 
  Lightbulb,
  Circle,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ExperimentDetail() {
  const [, params] = useRoute("/experiments/:id");
  const experiment = EXPERIMENTS.find(m => m.id === params?.id);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", text: "This discovery really shifted my perspective! 🙌", time: "2h ago", likes: 12 },
    { id: 2, author: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", text: "Anyone else testing this hypothesis?", time: "1h ago", likes: 5 },
  ]);
  
  const [isAboutOpen, setIsAboutOpen] = useState(true);

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
    { num: 1, title: "Hypothesis Formulation", duration: "Day 1", locked: false, completed: true },
    { num: 2, title: "Method Setup & Prep", duration: "Day 2", locked: false, completed: true },
    { num: 3, title: "First Findings", duration: "Day 3", locked: false, completed: false },
    { num: 4, title: "Deep Dive Analysis", duration: "Day 4", locked: experiment.completedDiscoveries < 3, completed: false },
    { num: 5, title: "Conclusion & Results", duration: "Day 5", locked: experiment.completedDiscoveries < 4, completed: false },
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
    <Layout showRightSidebar={false}>
      <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-100px)]">
        {/* Left Column: Main Content */}
        <div className="flex-1 p-4 lg:p-8 lg:pr-12 overflow-y-auto">
          {/* Breadcrumb / Back */}
          <div className="mb-6">
            <Link href="/experiments">
              <Button variant="ghost" className="gap-2 pl-0 text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
                Back to Experiments
              </Button>
            </Link>
          </div>

          {/* Header Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
               <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider border-primary/20 text-primary bg-primary/5">
                  {experiment.category}
               </Badge>
               <span className="text-sm text-muted-foreground">Guided by {experiment.guide}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{experiment.title}</h1>
            
            {/* About Toggle */}
            <div className="border-l-2 border-primary/20 pl-4 py-1 cursor-pointer hover:border-primary transition-colors" onClick={() => setIsAboutOpen(!isAboutOpen)}>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                 <BookOpen className="w-4 h-4" /> About this Experiment
                 {isAboutOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
              {isAboutOpen && (
                <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  This experiment invites you to explore {experiment.category.toLowerCase()} principles in your daily life. 
                  You'll test hypotheses, gather data on yourself, and record your findings to gain insights into your "Human Operating System".
                </p>
              )}
            </div>
          </div>

          {/* Video Player / Hero */}
          <div className="relative rounded-xl overflow-hidden aspect-video bg-black mb-8 shadow-lg ring-1 ring-border/50 group">
             <img 
              src={experiment.image} 
              alt={experiment.title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle className="w-10 h-10 text-white fill-white/20" />
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
               <h3 className="text-white font-bold text-lg">Lesson 3: First Findings</h3>
               <p className="text-white/70 text-sm">Duration: 12:45</p>
            </div>
          </div>

          {/* Discussion Section */}
          <div className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Lab Partners Discussion
            </h2>
            
            {/* Comment Input */}
            <div className="flex gap-4 mb-8">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" 
                alt="Your avatar"
                className="w-10 h-10 rounded-full border border-border"
              />
              <div className="flex-1">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your findings, questions, or ahas..."
                  className="w-full p-3 rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
                  rows={2}
                  data-testid="textarea-discussion"
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    size="sm"
                    className="gap-2 rounded-full px-6"
                    data-testid="button-post-comment"
                  >
                    <Send className="w-3 h-3" /> Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 group">
                  <img 
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-10 h-10 rounded-full flex-shrink-0 border border-border"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground text-[15px]" data-testid={`text-commenter-${comment.id}`}>{comment.author}</span>
                      <span className="text-xs text-muted-foreground">• {comment.time}</span>
                    </div>
                    <p className="text-[17px] text-foreground/90 leading-relaxed mb-2">{comment.text}</p>
                    <button 
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      data-testid={`button-like-comment-${comment.id}`}
                    >
                      <Badge variant="outline" className="h-5 px-1.5 gap-1 hover:bg-primary/5 border-border/50">
                        ❤️ {comment.likes || "Like"}
                      </Badge>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus / Sidebar */}
        <div className="w-full lg:w-[320px] border-l bg-card/30 flex-shrink-0 sticky top-0 h-fit lg:h-auto lg:min-h-[calc(100vh-64px)]">
           <div className="p-6 space-y-8">
              
              {/* Progress Block */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-muted-foreground">Your Progress</span>
                    <span className="font-bold text-primary">{experiment.progress}%</span>
                 </div>
                 <Progress value={experiment.progress} className="h-1.5" />
              </div>

              {/* Action Button - REMOVED */}
              
              {/* Syllabus List */}
              <div>
                 <h3 className="font-serif font-bold text-lg mb-4">Discoveries</h3>
                 <div className="space-y-1">
                    {discoveries.map((discovery, idx) => (
                       <div 
                          key={discovery.num}
                          className={`
                            group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                            ${idx === 2 ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/50 border border-transparent'}
                          `}
                       >
                          {/* Icon / Checkbox */}
                          <div className="mt-0.5 text-muted-foreground transition-colors">
                             {discovery.completed ? (
                                <div className="bg-green-500 rounded-full p-0.5">
                                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                             ) : discovery.locked ? (
                                <Circle className="w-5 h-5 opacity-30" />
                             ) : (
                                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                             )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                             <p className={`text-base font-medium leading-tight mb-1 ${discovery.locked ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {discovery.title}
                             </p>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{discovery.duration}</span>
                                {idx === 2 && <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-primary/10 text-primary border-none">Current</Badge>}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Stats (Minimalist) */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
                 <div>
                    <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <p className="font-medium text-sm">5 Days</p>
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                       <Award className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold uppercase tracking-wider">Reward</span>
                    </div>
                    <p className="font-medium text-sm text-yellow-600 dark:text-yellow-400">5000 Sats</p>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </Layout>
  );
}