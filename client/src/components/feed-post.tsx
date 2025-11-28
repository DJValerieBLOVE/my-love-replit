import { useState } from "react";
import { 
  Clock, 
  Users, 
  MoreHorizontal, 
  Video, 
  ArrowRight,
  Calendar as CalendarIcon,
  Zap,
  MessageSquare
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
                <h3 className="font-bold text-foreground text-sm">{post.author.name}</h3>
                <p className="text-muted-foreground text-xs">{post.author.handle} • {post.timestamp}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="mt-2 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.image && (
              <div className="mt-3 rounded-xs overflow-hidden border border-border/50">
                <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/30">
              {/* Lightning Tip Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZap}
                className={`px-3 h-8 rounded-full transition-all group ${isZapped ? 'bg-orange-500/20 text-orange-600' : 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20'}`}
              >
                <img src={SatsIcon} alt="Zap" className={`w-4 h-4 mr-1.5 ${isZapped ? 'scale-125' : 'animate-pulse'}`} />
                <span className="text-xs font-bold">{zaps.toLocaleString()} sats</span>
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2 h-8">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-medium">{post.likes}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 px-2 h-8">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-medium">{post.comments}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
