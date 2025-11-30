import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles, Image as ImageIcon, Smile } from "lucide-react";
import { CURRENT_USER } from "@/lib/mock-data";

interface CreatePostProps {
  placeholder?: string;
}

export function CreatePost({ placeholder = "Share something with the community..." }: CreatePostProps) {
  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4 flex gap-4">
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={CURRENT_USER.avatar} />
          <AvatarFallback>{CURRENT_USER.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder={placeholder}
            className="w-full bg-muted/50 rounded-full px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-serif placeholder:text-muted-foreground/70"
          />
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </div>
            <Button className="rounded-full px-6 font-bold bg-love-body text-white border border-transparent transition-all">Post</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
