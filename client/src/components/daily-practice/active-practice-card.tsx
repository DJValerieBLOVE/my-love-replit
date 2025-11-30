import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Trophy, Sparkles, Moon, Sun, Heart } from "lucide-react";
import { VibeRater } from "./vibe-rater";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ActivePracticeCardProps {
  data: any;
  onComplete: (data: any) => void;
}

export function ActivePracticeCard({ data, onComplete }: ActivePracticeCardProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [victory, setVictory] = useState("");
  const [eveningVibe, setEveningVibe] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");

  const handleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    
    if (!checkedItems[index]) {
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7, x: 0.5 },
            colors: ['#10B981', '#34D399'] 
        });
    }
  };

  const handleComplete = () => {
    if (!victory || !eveningVibe) return; // Simple validation

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF']
    });

    onComplete({
      checkedItems,
      victory,
      eveningVibe,
      reflection
    });
  };

  return (
    <Card className="border-none shadow-lg bg-[#F5F3FF] dark:bg-[#1A052E] border-white/20 relative overflow-visible transition-all duration-500 group">
       {/* Subtle highlight effect */}
       <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur-sm -z-10"></div>
       <CardContent className="p-6 bg-white/50 dark:bg-[#1A052E]/90 backdrop-blur-sm rounded-xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1fr] gap-8">
            
            {/* Col 1: Meta Data (Vibes, Focus) */}
            <div className="flex flex-col justify-between space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mt-[1px]">Daily LOVE Practice</span>
                    </div>
                    <div className="text-lg text-muted-foreground font-serif">Today, {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                </div>

                <div className="space-y-2">
                    {/* Morning Vibe (Read-only) */}
                    <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10 flex justify-between items-center px-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif">Morning Vibe</div>
                        <div className="text-lg font-medium text-primary font-serif">{data.morningVibe || data.vibe}<span className="text-[10px] text-muted-foreground font-medium">/11</span></div>
                    </div>

                    {/* Evening Vibe (Interactive) */}
                    <Popover>
                        <PopoverTrigger asChild>
                             <div className="bg-white/80 dark:bg-white/5 rounded-lg p-2 text-center border border-dashed border-primary/30 hover:border-primary/60 cursor-pointer transition-colors flex justify-between items-center px-3 group/vibe">
                                <div className="text-[10px] font-bold text-[#6600ff] uppercase font-serif flex items-center gap-1">
                                    <Moon className="w-3 h-3" /> Evening Vibe
                                </div>
                                <div className={cn("text-lg font-medium font-serif", eveningVibe ? "text-[#6600ff]" : "text-muted-foreground/40")}>
                                    {eveningVibe || "?"}<span className="text-[10px] text-muted-foreground font-medium">/11</span>
                                </div>
                             </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 bg-white dark:bg-[#1A052E] border-[#6600ff]/20">
                            <div className="space-y-2 text-center">
                                <h4 className="font-serif text-[#4D3D5C]">Rate your Evening Vibe</h4>
                                <VibeRater value={eveningVibe || 5} onChange={setEveningVibe} />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Focus Area */}
                    {data.focusArea && (
                        <div className="bg-muted/20 rounded-lg p-3 border border-border/50 mt-2 space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                            <div className="text-xs font-serif text-muted-foreground italic leading-relaxed">
                            "{data.focusArea.dream || "To live fully."}"
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Big Dream: <span style={{ color: data.focusArea.color }}>{data.focusArea.name || data.focusArea}</span></div>
                                </div>
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: data.focusArea.color || '#6600ff' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Col 2: Content (Vision & Reflection Input) */}
            <div className="space-y-6 pt-[3px] flex flex-col">
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">My Vision</label>
                    <p className="text-xl font-bold font-serif text-[#4D3D5C] leading-tight">
                        "{data.vision}"
                    </p>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-[#6600ff]" /> 
                        My Reflection (Optional)
                    </label>
                    <Textarea 
                        placeholder="How did today go? Any magic moments?" 
                        className="flex-1 min-h-[120px] bg-white/60 border-primary/10 focus:border-primary/30 focus:ring-primary/20 resize-none font-serif text-muted-foreground"
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                    />
                </div>
            </div>

            {/* Col 3: Details (Action Steps & Victory Input) */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50 h-full flex flex-col">
                
                {/* 3 Daily Actions */}
                <div className="space-y-2">
                     <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Daily Actions</div>
                     <div className="space-y-2">
                        {data.values.map((val: string, idx: number) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "flex items-start gap-2 p-2 rounded-md border transition-all cursor-pointer hover:bg-white/50",
                                    checkedItems[idx] ? "bg-green-50/50 border-green-100" : "border-transparent"
                                )}
                                onClick={() => handleCheck(idx)}
                            >
                                <div className={cn(
                                    "mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                    checkedItems[idx] ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
                                )}>
                                    {checkedItems[idx] && <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium leading-tight transition-all",
                                    checkedItems[idx] ? "text-green-700 line-through opacity-60" : "text-[#4D3D5C]"
                                )}>{val}</span>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="w-full h-px bg-border/50 my-2" />

                {/* Villain (Read-only) */}
                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Villain to Defeat</div>
                    <div className="text-sm font-serif text-red-500/80 whitespace-normal">{data.villain || "Distraction"}</div>
                </div>

                {/* Victory (Input) */}
                <div className="flex-1 flex flex-col justify-end mt-auto pt-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" /> Victory
                    </label>
                    <Input 
                        placeholder="Type your win here..." 
                        className="h-10 bg-white/80 border-green-200/50 focus:border-green-500/50 focus:ring-green-500/20 text-sm font-serif text-green-700 placeholder:text-green-700/30"
                        value={victory}
                        onChange={(e) => setVictory(e.target.value)}
                    />
                    
                    {/* Complete Button - Only shows when victory is typed */}
                    {victory && (
                        <Button 
                            size="sm" 
                            className="w-full mt-3 bg-[#6600ff] hover:bg-[#5500dd] text-white animate-in fade-in slide-in-from-bottom-2"
                            onClick={handleComplete}
                            disabled={!eveningVibe}
                        >
                            <Sparkles className="w-3 h-3 mr-2" /> Save Day
                        </Button>
                    )}
                </div>
            </div>

          </div>
       </CardContent>
    </Card>
  );
}
