import { 
  Sparkles, 
  Target,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [chatMessage, setChatMessage] = useState("");
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          {/* Consolidated Header + Suggestion + Chat Block */}
          <div className="p-6 border-b bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/30 space-y-4">
            {/* Magic Mentor Header */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 shadow-lg">
                <Sparkles className="w-6 h-6 text-purple-600 fill-purple-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif text-white">Magic Mentor</h3>
                <p className="text-xs text-purple-100">Your accountability partner</p>
              </div>
            </div>

            {/* Suggestion Box */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-sm text-white">
              <p className="leading-relaxed italic">"You've been focusing a lot on <strong>Community</strong> lately. Maybe spend some time on <strong>Body</strong> today?"</p>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/20 transition-all"
                data-testid="input-chat-message"
              />
              <Button 
                size="icon" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg h-10 w-10"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
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
    </Sheet>
  );
}
