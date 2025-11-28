import { 
  Bot, 
  Sparkles, 
  ChevronRight, 
  Target,
  Zap
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
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import BuddyAvatar from "@assets/generated_images/ai_buddy_avatar.png";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <div className="hidden lg:block p-4 mt-4 mx-3 bg-gradient-to-br from-purple-900/10 to-primary/10 rounded-xs group cursor-pointer hover:bg-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-6 h-6 text-purple-600 fill-purple-200" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Lumina Guide</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> 
                  Ready to help
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>11x LOVE Balance</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-1.5 bg-background/50 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:via-purple-500 [&>div]:to-cyan-500" />
            </div>
          </div>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
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

          {/* Chat Input Area (Mock) */}
          <div className="p-4 border-t bg-background mt-auto">
            <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
              <Zap className="w-4 h-4" /> Check-in with Guide
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
