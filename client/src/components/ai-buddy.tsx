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
      <SheetContent side="right" className="w-full sm:w-[540px] p-0 border-l shadow-2xl">
        <div className="h-full flex flex-col bg-background">
          {/* Consolidated Header + Suggestion + Chat Block */}
          <div className="p-6 border-b bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/30 space-y-4">
            {/* Magic Mentor Header */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 shadow-lg shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600 fill-purple-200" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif text-white">Magic Mentor</h3>
                <p className="text-xs text-purple-100/90">Your accountability partner</p>
              </div>
            </div>

            {/* Suggestion Box */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-sm text-white shadow-sm">
              <p className="leading-relaxed italic">"You've been focusing a lot on <strong>Community</strong> lately. Maybe spend some time on <strong>Body</strong> today?"</p>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/20 transition-all"
                data-testid="input-chat-message"
              />
              <Button 
                size="icon" 
                className="h-auto w-12 bg-[#6600ff] hover:bg-[#5500dd] text-white rounded-xl shadow-lg"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <Target className="w-4 h-4" strokeWidth={1.5} /> Big Dreams
                </h3>
                <Button variant="ghost" className="px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5">Edit Big Dreams</Button>
              </div>

              <div className="space-y-4">
                {LOVE_CODE_AREAS.map((area) => (
                  <div key={area.id} className="group space-y-2 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${area.color}`} />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{area.name}</span>
                        </div>
                        <p className="text-sm font-serif text-foreground/90 line-clamp-2 leading-relaxed">"{area.dream}"</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums bg-muted/50 px-2 py-1 rounded-md">{area.progress}%</span>
                    </div>
                    
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`} 
                        style={{ width: `${area.progress}%`, backgroundColor: area.hex }}
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
