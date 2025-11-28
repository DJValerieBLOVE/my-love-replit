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
  Bookmark
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SatsIcon from "@assets/generated_images/sats_icon.png";
import { toast } from "sonner";

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

  const handleZap = () => {
    setZaps(prev => prev + 100);
    setIsZapped(true);
    toast("Zap Sent! ⚡", {
      description: `You sent 100 sats to ${post.author.name}`,
      action: {
        label: "Undo",
        onClick: () => setZaps(prev => prev - 100),
      },
    });
  };

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
                <h3 className="font-bold text-foreground text-[15px] flex items-center gap-2">
                  {post.author.name}
                  <span className="text-muted-foreground font-normal text-[15px]">
                    {post.timestamp.replace(" ago", "")}
                  </span>
                </h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="mt-2 text-[17px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.image && (
              <div className="mt-3 rounded-xs overflow-hidden border border-border/50">
                <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/30 px-2 h-12">
              {/* 1. Comment */}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 px-2 h-10 gap-1.5 min-w-[60px]">
                <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-[13px] font-medium">{post.comments > 0 ? post.comments : ""}</span>
              </Button>

              {/* 2. Repost */}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 px-2 h-10 gap-1.5 min-w-[60px]">
                <Repeat2 className="w-[22px] h-[22px]" strokeWidth={1.5} />
                <span className="text-[13px] font-medium"></span>
              </Button>

              {/* 3. Zap (Center, Largest) */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZap}
                className={`px-2 h-10 rounded-full transition-all group min-w-[60px] ${isZapped || zaps > 0 ? 'text-orange-500 hover:bg-orange-500/10' : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'}`}
              >
                <Zap 
                  className={`mr-1.5 transition-all ${isZapped || zaps > 0 ? 'text-orange-500 w-[28px] h-[28px]' : 'w-[28px] h-[28px] group-hover:scale-110'}`} 
                  strokeWidth={1.5}
                  fill="none" // Explicitly no fill
                />
                <span className={`text-[13px] font-medium ${isZapped || zaps > 0 ? 'font-bold' : ''}`}>
                  {zaps > 0 ? zaps.toLocaleString() : ""}
                </span>
              </Button>

              {/* 4. Like */}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2 h-10 gap-1.5 min-w-[60px]">
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-[13px] font-medium">{post.likes > 0 ? post.likes : ""}</span>
              </Button>

              {/* 5. Share/Bookmark */}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 px-2 h-10 gap-1.5 min-w-[60px]">
                <Bookmark className="w-[20px] h-[20px]" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
