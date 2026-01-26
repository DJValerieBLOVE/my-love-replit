import { 
  Sparkles, 
  Target,
  Send,
  Loader2,
  AlertCircle
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
import { useState, useRef, useEffect } from "react";
import { useNostr } from "@/contexts/nostr-context";
import { sendAiMessage, type ChatMessage } from "@/lib/api";
import { toast } from "sonner";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usageLimits, setUsageLimits] = useState<{ used: number; limit: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, isConnected } = useNostr();
  const userName = profile?.name?.split(' ')[0] || "Friend";
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!chatMessage.trim()) return;
    
    if (!isConnected) {
      toast.error("Please login to chat with Magic Mentor");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: chatMessage.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await sendAiMessage(updatedMessages);
      
      setMessages([...updatedMessages, { 
        role: "assistant", 
        content: response.response 
      }]);
      
      if (response.limits) {
        setUsageLimits(response.limits);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
      setMessages(updatedMessages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[800px] sm:w-[800px] p-0 border-l shadow-2xl [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button_svg]:stroke-white [&>button]:z-50">
        <div className="h-full flex flex-col bg-background">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-br from-[#6600ff] to-[#cc00ff] space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <Sparkles className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif text-white">Magic Mentor</h3>
                <p className="text-xs text-[#E6E6FA]">Powered by Claude Haiku 4.5</p>
              </div>
            </div>

            {usageLimits && (
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>{usageLimits.used}/{usageLimits.limit} daily messages used</span>
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${(usageLimits.used / usageLimits.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder={`Aloha ${userName} ~ Ask me anything...`}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-white bg-[#F4F4F5] text-sm text-[#4D3D5C] placeholder:text-[#4D3D5C] focus:outline-none focus:ring-2 focus:ring-white shadow-[0_0_30px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50"
                data-testid="input-chat-message"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !chatMessage.trim()}
                className="flex items-center justify-center h-12 w-12 rounded-xl shadow-lg bg-white border border-transparent transition-all z-10 relative hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" color="#6600ff" />
                ) : (
                  <Send className="w-5 h-5" color="#6600ff" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Chat Messages or Goals */}
          <ScrollArea className="flex-1">
            {messages.length > 0 ? (
              <div className="p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-[#6600ff] to-[#cc00ff] text-white" 
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3" />
                          <span>Magic Mentor</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Welcome Message */}
                <div className="bg-muted/50 p-4 rounded-xl border">
                  <p className="text-sm text-muted-foreground italic">
                    "Hello {userName}! I'm your Magic Mentor - your personal AI coach on this journey of growth. I know about your journal entries, your Big Dreams, and your progress. Ask me anything about your goals, challenges, or next steps!"
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                    <Target className="w-4 h-4" strokeWidth={1.5} /> Big Dreams
                  </h3>
                  <Button variant="ghost" className="px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5">Edit</Button>
                </div>

                <div className="space-y-4">
                  {LOVE_CODE_AREAS.slice(0, 5).map((area) => (
                    <div key={area.id} className="group space-y-2 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${area.color}`} />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{area.name}</span>
                          </div>
                          <p className="text-sm font-serif text-[#4D3D5C] line-clamp-2 leading-relaxed">"{area.dream}"</p>
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
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
