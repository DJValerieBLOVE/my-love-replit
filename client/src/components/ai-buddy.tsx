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
import { LOVE_CODE_AREAS, CURRENT_USER } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [chatMessage, setChatMessage] = useState("");
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[800px] sm:w-[800px] p-0 border-l shadow-2xl [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:bg-white/10 [&>button]:hover:bg-white/20">
        <div className="h-full flex flex-col bg-background">
          {/* Consolidated Header + Suggestion + Chat Block */}
          <div className="p-6 border-b bg-gradient-to-br from-[#6600ff] to-[#cc00ff] space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            {/* Magic Mentor Header */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <Sparkles className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif text-white">Magic Mentor</h3>
                <p className="text-xs text-white/90">Your accountability partner</p>
              </div>
            </div>

            {/* Quote of the Day Box */}
            <div className="bg-white border rounded-xl p-5 text-sm text-foreground shadow-lg relative overflow-hidden">
              <p className="leading-relaxed italic text-muted-foreground font-serif text-base">"Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it."</p>
              <p className="text-xs text-right mt-2 font-bold text-muted-foreground/60">— Rumi</p>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder={`Aloha ${CURRENT_USER.name.split(' ')[0]} ~ Ask me anything...`}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-white bg-[#F4F4F5] text-sm text-foreground placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-white shadow-[0_0_30px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.1)] transition-all"
                data-testid="input-chat-message"
              />
              <button 
                className="flex items-center justify-center h-12 w-12 rounded-xl shadow-lg bg-white border border-transparent transition-all z-10 relative hover:scale-105 active:scale-95"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" color="#6600ff" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <Target className="w-4 h-4" strokeWidth={1.5} /> Big Dreams
                </h3>
                <Button variant="ghost" className="px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5">Edit</Button>
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
