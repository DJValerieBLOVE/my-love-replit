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
  ChevronUp,
  MoveRight,
  Trophy
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeedPost } from "@/components/feed-post";
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { EqVisualizer } from "@/components/eq-visualizer";
import { toast } from "sonner";
import Layout from "@/components/layout";
import { EXPERIMENTS, CURRENT_USER } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { SurprisePortal } from "@/components/surprise-portal";

export default function ExperimentDetail() {
  const [, params] = useRoute("/experiments/:id");
  const experiment = EXPERIMENTS.find(m => m.id === params?.id);
  const [newComment, setNewComment] = useState("");
  const [localWalletBalance, setLocalWalletBalance] = useState(CURRENT_USER.walletBalance);
  const [showPortal, setShowPortal] = useState(false);
  
  // Local state for discoveries to handle unlocking/completing
  const [discoveries, setDiscoveries] = useState([
    { num: 1, title: "Hypothesis Formulation", duration: "Day 1", locked: false, completed: true },
    { num: 2, title: "Method Setup & Prep", duration: "Day 2", locked: false, completed: true },
    { num: 3, title: "First Findings", duration: "Day 3", locked: false, completed: false },
    { num: 4, title: "Deep Dive Analysis", duration: "Day 4", locked: true, completed: false },
    { num: 5, title: "Conclusion & Results", duration: "Day 5", locked: true, completed: false },
  ]);
  
  // Unlock logic based on completion
  useEffect(() => {
     const completedCount = discoveries.filter(d => d.completed).length;
     if (completedCount >= 2) { // Start with 2 completed
        const updated = [...discoveries];
        // Unlock logic: if previous is completed, unlock next
        for (let i = 1; i < updated.length; i++) {
           if (updated[i-1].completed) {
              updated[i].locked = false;
           }
        }
        // Avoid infinite loop if nothing changed, but here we are just setting initial state logic or reactive
        // Actually, simpler to do this in the handleComplete
     }
  }, []);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Transformed comments to match FeedPost structure
  const [comments, setComments] = useState([
    { 
      id: "1", 
      author: {
        name: "Alex Chen",
        handle: "@alexc",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
      },
      content: "This discovery really shifted my perspective! 🙌", 
      timestamp: "2h ago", 
      likes: 12,
      comments: 3,
      zaps: 210
    },
    { 
      id: "2", 
      author: {
        name: "Sarah M.",
        handle: "@sarahm",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
      },
      content: "Anyone else testing this hypothesis?", 
      timestamp: "1h ago", 
      likes: 5,
      comments: 1,
      zaps: 50
    },
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

  // Dynamic calculations
  const completedCount = discoveries.filter(d => d.completed).length;
  const totalCount = discoveries.length;
  const currentProgress = Math.round((completedCount / totalCount) * 100);
  const DISCOVERY_REWARD = 500;
  const GRAND_REWARD = 2500; // 500 * 5 + bonus
  
  const handleCompleteDiscovery = (num: number) => {
     const newDiscoveries = [...discoveries];
     const index = newDiscoveries.findIndex(d => d.num === num);
     
     if (index !== -1 && !newDiscoveries[index].completed) {
        // 1. Mark Complete
        newDiscoveries[index].completed = true;
        
        // 2. Unlock Next if exists
        if (index + 1 < newDiscoveries.length) {
           newDiscoveries[index + 1].locked = false;
        }
        
        setDiscoveries(newDiscoveries);
        
        // 3. Add Reward
        const newBalance = localWalletBalance + DISCOVERY_REWARD;
        setLocalWalletBalance(newBalance);
        
        // 4. Feedback (Sound & Toast)
        // Simulated sound
        // new Audio('/sounds/coin.mp3').play().catch(() => {}); 
        toast(`+${DISCOVERY_REWARD} Sats!`, {
           icon: '⚡',
           description: 'Discovery Completed'
        });

        // 5. Trigger EQ Visualizer Animation (Top Global)
        window.dispatchEvent(new CustomEvent('eq-update', { 
           detail: { 
              category: experiment.category,
              progress: Math.min(100, currentProgress + 20) // Simulate jump
           } 
        }));
        
        // 5.5 Check for Surprise Portal (Random Chance)
        // Using 30% chance for demo purposes (normally might be lower)
        if (Math.random() > 0.7) {
           setTimeout(() => {
              setShowPortal(true);
           }, 1500); // Delay slightly so user sees the checkmark first
        }

        // 6. Check for Full Completion
        const allComplete = newDiscoveries.every(d => d.completed);
        if (allComplete) {
           setTimeout(() => {
              handleExperimentComplete(newBalance);
           }, 800); // Slight delay for effect
        }
     }
  };

  const handleExperimentComplete = (currentBalance: number) => {
     // Grand Reward
     const finalBalance = currentBalance + 2500; // Bonus
     setLocalWalletBalance(finalBalance);
     setShowCompletionModal(true);
     
     // Confetti
     const duration = 3000;
     const animationEnd = Date.now() + duration;
     const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

     const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

     const interval: any = setInterval(function() {
       const timeLeft = animationEnd - Date.now();

       if (timeLeft <= 0) {
         return clearInterval(interval);
       }

       const particleCount = 50 * (timeLeft / duration);
       confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
       confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
     }, 250);
  };

  const handlePortalClaim = (amount: number) => {
     const newBalance = localWalletBalance + amount;
     setLocalWalletBalance(newBalance);
     toast(`+${amount} Sats!`, {
        icon: '🌌',
        description: 'Portal Reward Claimed'
     });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{
        id: String(comments.length + 1),
        author: {
          name: CURRENT_USER.name,
          handle: CURRENT_USER.handle,
          avatar: CURRENT_USER.avatar
        },
        content: newComment,
        timestamp: "1m",
        likes: 0,
        comments: 0,
        zaps: 0
      }, ...comments]);
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
               <Badge className="bg-white text-black hover:bg-white/90 font-normal border shadow-sm text-sm px-3 py-0.5">
                  {experiment.category}
               </Badge>
               <span className="text-sm text-muted-foreground">Guided by {experiment.guide}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-muted-foreground mb-4">{experiment.title}</h1>
            
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

          {/* Current Discovery Action Area */}
          {(() => {
             const currentDiscovery = discoveries.find(d => !d.completed && !d.locked);
             if (currentDiscovery) {
                return (
                   <div className="mb-12 p-6 bg-card border border-border rounded-xl shadow-sm">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                         <div>
                            <h3 className="text-lg font-bold text-foreground">Ready to move on?</h3>
                            <p className="text-muted-foreground text-sm">Complete "{currentDiscovery.title}" to unlock the next step.</p>
                         </div>
                         <Button 
                            onClick={() => handleCompleteDiscovery(currentDiscovery.num)}
                            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base font-bold shadow-md active:scale-95 transition-all"
                         >
                            Next Discovery <MoveRight className="w-5 h-5 ml-2" />
                         </Button>
                      </div>
                   </div>
                );
             }
             return null;
          })()}

          {/* Discussion Section */}
          <div className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-6 h-6 text-primary" />
              Lab Partners Discussion
            </h2>
            
            {/* Comment Input */}
            <div className="flex gap-4 mb-8">
              <img 
                src={CURRENT_USER.avatar} 
                alt="Your avatar"
                className="w-10 h-10 rounded-full border border-border"
              />
              <div className="flex-1">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your findings, questions, or ahas..."
                  className="w-full p-3 rounded-lg bg-card text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all text-[17px]"
                  rows={2}
                  data-testid="textarea-discussion"
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    size="sm"
                    className="gap-2 rounded-full px-6 text-base"
                    data-testid="button-post-comment"
                  >
                    <Send className="w-3 h-3" /> Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List (Using FeedPost) */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <FeedPost key={comment.id} post={comment} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus / Sidebar */}
        <div className="w-full lg:w-[320px] border-l bg-card/30 flex-shrink-0 sticky top-0 h-fit lg:h-auto lg:min-h-[calc(100vh-64px)]">
           <div className="p-6 space-y-8">
              
              {/* Stats (Minimalist) */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border/50">
                 <div>
                    <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <p className="font-medium text-sm">5 Days</p>
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                       <Zap className="w-3.5 h-3.5 text-yellow-500" />
                       <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
                    </div>
                    <p className="font-medium text-sm text-yellow-600 dark:text-yellow-400">{localWalletBalance.toLocaleString()} Sats</p>
                 </div>
              </div>

              {/* Progress Block */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-muted-foreground">Your Progress</span>
                    <span className="font-bold text-primary">{currentProgress}%</span>
                 </div>
                 <Progress value={currentProgress} className="h-1.5" />
              </div>

              {/* Syllabus List */}
              <div>
                 <h3 className="font-serif font-bold text-lg mb-4 text-muted-foreground">Discoveries</h3>
                 <div className="space-y-2">
                    {discoveries.map((discovery, idx) => {
                       const isCurrent = !discovery.completed && !discovery.locked;
                       
                       return (
                       <div 
                          key={discovery.num}
                          className={`
                            group relative flex flex-col p-3 rounded-lg transition-all
                            ${isCurrent ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'hover:bg-muted/50 border border-transparent'}
                            ${discovery.completed ? 'opacity-70 hover:opacity-100' : ''}
                          `}
                       >
                          <div className="flex items-start gap-3">
                             {/* Icon / Checkbox */}
                             <div className="mt-0.5 text-muted-foreground transition-colors">
                                {discovery.completed ? (
                                   <div className="bg-green-500 rounded-full p-0.5">
                                     <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                   </div>
                                ) : discovery.locked ? (
                                   <Circle className="w-5 h-5 opacity-30" />
                                ) : (
                                   <Circle className="w-5 h-5 text-primary animate-pulse" />
                                )}
                             </div>
                             
                             {/* Content */}
                             <div className="flex-1">
                                <p className={`text-base font-medium leading-tight mb-1 ${discovery.locked ? 'text-muted-foreground' : 'text-foreground'}`}>
                                   {discovery.title}
                                </p>
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{discovery.duration}</span>
                                </div>
                             </div>
                          </div>

                          {/* Action Button for Current Step - REMOVED */}
                       </div>
                    )})}
                 </div>
              </div>
              
           </div>
        </div>
      </div>

      {/* Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center border-primary/20">
          <DialogHeader>
             <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Trophy className="w-12 h-12 text-primary" />
             </div>
            <DialogTitle className="text-3xl font-serif font-bold text-center text-foreground">Experiment Complete!</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
               You've unlocked the secrets of {experiment.category}!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
             <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Earned</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-2">
                   <Zap className="w-8 h-8 fill-current" />
                   {GRAND_REWARD + (totalCount * DISCOVERY_REWARD)} Sats
                </p>
             </div>

             <div className="flex justify-center">
                 <div className="scale-75 origin-center">
                    <EqVisualizer size={160} isLogo={true} />
                 </div>
             </div>
             
             <p className="text-muted-foreground italic">
                "The only way to discover the limits of the possible is to go beyond them into the impossible."
             </p>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Link href="/experiments">
               <Button className="w-full h-12 text-lg font-bold" size="lg">
                  Back to Experiments
               </Button>
            </Link>
            <DialogClose asChild>
               <Button variant="ghost" className="w-full">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Surprise Portal */}
      <SurprisePortal 
         isOpen={showPortal} 
         onClose={() => setShowPortal(false)} 
         onClaim={handlePortalClaim}
      />

    </Layout>
  );
}