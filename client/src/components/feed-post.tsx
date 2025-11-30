import { useState } from "react";
import { 
  Clock, 
  Heart, 
  MoreHorizontal, 
  Video, 
  ArrowRight,
  Calendar as CalendarIcon,
  Zap,
  MessageSquare,
  Repeat2,
  Share,
  Bookmark,
  Minus,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SatsIcon from "@assets/generated_images/sats_icon.png";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FeedPostProps {
  post: {
    id: string;
    author: {
      name: string;
      handle: string;
      avatar: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    zaps: number;
    timestamp: string;
  };
}

export function FeedPost({ post }: FeedPostProps) {
  const [zaps, setZaps] = useState(post.zaps);
  const [isZapped, setIsZapped] = useState(false);
  const [zapAmount, setZapAmount] = useState(21);
  const [zapComment, setZapComment] = useState("");
  const [isZapOpen, setIsZapOpen] = useState(false);

  const handleZap = () => {
    setZaps(prev => prev + zapAmount);
    setIsZapped(true);
    setIsZapOpen(false);
    
    toast("Zap Sent! ⚡", {
      description: `You sent ${zapAmount} sats to ${post.author.name}`,
      action: {
        label: "Undo",
        onClick: () => setZaps(prev => prev - zapAmount),
      },
    });
    
    // Reset for next time
    setZapComment("");
    setZapAmount(21);
  };

  const ZAP_PRESETS = [21, 50, 100, 500, 1000, 5000];

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card mb-4">
      <CardContent className="p-0">
        <div className="p-4 flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-border">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-muted-foreground text-sm flex items-center gap-2">
                  {post.author.name}
                  <span className="text-muted-foreground font-normal text-sm">
                    {post.timestamp.replace(" ago", "")}
                  </span>
                </h3>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="mt-2 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.image && (
              <div className="mt-3 rounded-xs overflow-hidden border border-[#E5E5E5]">
                <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border px-2 h-12">
              {/* 1. Comment */}
              <Button variant="ghost" className="text-muted-foreground hover:text-love-time hover:bg-love-time-light px-2 gap-1.5 min-w-[60px]">
                <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-sm font-medium">{post.comments > 0 ? post.comments : ""}</span>
              </Button>

              {/* 2. Repost */}
              <Button variant="ghost" className="text-muted-foreground hover:text-love-mission hover:bg-love-mission-light px-2 gap-1.5 min-w-[60px]">
                <Repeat2 className="w-[22px] h-[22px]" strokeWidth={1.5} />
                <span className="text-sm font-medium"></span>
              </Button>

              {/* 3. Zap (Center, Largest) - Now with Dialog */}
              <Dialog open={isZapOpen} onOpenChange={setIsZapOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`px-2 rounded-full transition-all group min-w-[60px] ${isZapped || zaps > 0 ? 'text-love-family hover:bg-love-family-light' : 'text-muted-foreground hover:text-love-family hover:bg-love-family-light'}`}
                  >
                    <Zap 
                      className={`mr-1.5 transition-all ${isZapped || zaps > 0 ? 'text-love-family w-[28px] h-[28px]' : 'w-[28px] h-[28px] group-hover:scale-110'}`} 
                      strokeWidth={1.5}
                      fill={isZapped ? "currentColor" : "none"}
                    />
                    <span className={`text-sm font-medium ${isZapped || zaps > 0 ? 'font-bold' : ''}`}>
                      {zaps > 0 ? zaps.toLocaleString() : ""}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-love-family-light">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
                      <span className="text-love-family">⚡</span> Zap {post.author.name}
                    </DialogTitle>
                    <DialogDescription>
                      Send sats directly to their Lightning Address.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex flex-col gap-6 py-4">
                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-3">
                      {ZAP_PRESETS.map((amount) => (
                        <Button
                          key={amount}
                          variant={zapAmount === amount ? "default" : "outline"}
                          className={`text-lg font-bold ${
                            zapAmount === amount 
                              ? "bg-love-family hover:bg-[#E65C00] text-white border-love-family" 
                              : "border-[#E5E5E5] hover:border-love-family hover:bg-love-family-light text-muted-foreground"
                          }`}
                          onClick={() => setZapAmount(amount)}
                        >
                          ⚡ {amount}
                        </Button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount" className="text-muted-foreground font-serif">Custom Amount (Sats)</Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-love-family font-bold">⚡</div>
                        <Input 
                          id="custom-amount" 
                          type="number" 
                          value={zapAmount}
                          onChange={(e) => setZapAmount(Number(e.target.value))}
                          className="pl-9 text-lg font-bold bg-[#FAFAFA] border-muted" 
                        />
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="zap-comment" className="text-muted-foreground font-serif">Comment (Optional)</Label>
                      <Input 
                        id="zap-comment" 
                        placeholder="Great post! 🔥" 
                        value={zapComment}
                        onChange={(e) => setZapComment(e.target.value)}
                        className="bg-[#FAFAFA] border-muted"
                      />
                    </div>
                  </div>

                  <DialogFooter className="sm:justify-between gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      onClick={handleZap}
                      className="bg-love-family hover:bg-[#E65C00] text-white font-bold px-8 w-full sm:w-auto"
                    >
                      Zap {zapAmount} Sats ⚡
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* 4. Like */}
              <Button variant="ghost" className="text-muted-foreground hover:text-love-romance hover:bg-love-romance-light px-2 gap-1.5 min-w-[60px]">
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-sm font-medium">{post.likes > 0 ? post.likes : ""}</span>
              </Button>

              {/* 5. Share/Bookmark */}
              <Button variant="ghost" className="text-muted-foreground hover:text-love-body hover:bg-love-body-light px-2 gap-1.5 min-w-[60px]">
                <Bookmark className="w-[20px] h-[20px]" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
