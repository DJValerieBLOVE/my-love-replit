import { 
  Bot, 
  Sparkles, 
  ChevronRight, 
  Target,
  Zap,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import BuddyAvatar from "@assets/generated_images/ai_buddy_avatar.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          {/* Ask Mentor Button - Top */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-600/10 to-pink-600/10">
            <Button 
              onClick={() => setChatOpen(true)}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all hover:shadow-lg border-0"
              data-testid="button-ask-mentor-chat"
            >
              <Sparkles className="w-4 h-4" /> Ask Mentor
            </Button>
          </div>

          {/* Header */}
          <div className="p-6 border-b bg-muted/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 shadow-lg ring-4 ring-background">
                <Sparkles className="w-8 h-8 text-purple-600 fill-purple-200" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-serif">Lumina Guide</SheetTitle>
                <SheetDescription>Your personal accountability partner</SheetDescription>
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-sm">
              "You've been focusing a lot on <strong>Community</strong> lately. Maybe spend some time on <strong>Body</strong> today?"
            </div>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Target className="w-4 h-4" /> Your 11x LOVE Code
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-7">Edit Goals</Button>
              </div>

              <div className="space-y-4">
                {LOVE_CODE_AREAS.map((area) => (
                  <div key={area.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{area.name}</span>
                      <span className="text-muted-foreground">{area.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${area.color} transition-all duration-500`} 
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

        </div>
      </SheetContent>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600 fill-purple-200" />
              </div>
              <DialogTitle className="font-serif text-lg">Lumina Chat</DialogTitle>
            </div>
            <DialogClose className="opacity-70 hover:opacity-100" />
          </DialogHeader>

          {/* Chat Messages */}
          <ScrollArea className="h-[300px] pr-4 space-y-4 mb-4">
            <div className="space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-sm max-w-xs">
                  Hey there! 👋 How are you feeling about your progress today? Let's chat about your 11x LOVE goals.
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm max-w-xs">
                  I'm struggling with Body today
                </div>
              </div>

              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-sm max-w-xs">
                  That's totally okay! Let's break it down. What specific aspect of Body feels challenging right now?
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              data-testid="input-chat-message"
            />
            <Button 
              size="icon" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
