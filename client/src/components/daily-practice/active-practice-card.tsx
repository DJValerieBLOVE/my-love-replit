import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Trophy, Sparkles, Moon, Sun } from "lucide-react";
import { VibeRater } from "./vibe-rater";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface ActivePracticeCardProps {
  data: any;
  onComplete: (data: any) => void;
}

export function ActivePracticeCard({ data, onComplete }: ActivePracticeCardProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [victory, setVictory] = useState("");
  const [eveningVibe, setEveningVibe] = useState(8);
  const [isExpanded, setIsExpanded] = useState(false); // For evening section

  const handleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    
    if (!checkedItems[index]) {
        // Small confetti burst for satisfaction
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7, x: 0.5 },
            colors: ['#10B981', '#34D399'] // Green colors
        });
    }
  };

  const handleComplete = () => {
    // Celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF']
    });

    onComplete({
      checkedItems,
      victory,
      eveningVibe
    });
  };

  return (
    <Card className="border-none shadow-lg bg-[#F5F3FF] dark:bg-[#1A052E] border-white/20 relative overflow-hidden transition-all duration-500">
      {/* Magical background effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <CardContent className="p-6 md:p-8 relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary uppercase tracking-wider text-[10px]">Today's Practice</Badge>
                <span className="text-xs font-bold text-muted-foreground uppercase">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
             </div>
             <h2 className="text-3xl font-bold font-serif text-[#4D3D5C] dark:text-white leading-tight">"{data.vision}"</h2>
             {data.focusArea && (
               <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                 <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.focusArea.color || '#6600ff' }} />
                 Focus: {data.focusArea.name || data.focusArea}
               </div>
             )}
          </div>
          
          {/* Morning Vibe Badge */}
          <div className="bg-white/60 dark:bg-white/10 p-3 rounded-xl border border-white/50 backdrop-blur-sm text-center min-w-[100px]">
             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
               <Sun className="w-3 h-3" /> Morning
             </div>
             <div className="text-2xl font-bold text-[#6600ff] dark:text-white font-serif">{data.morningVibe || data.vibe}/11</div>
          </div>
        </div>

        {/* Interactive Action Steps */}
        <div className="space-y-4">
           <h3 className="text-xs font-bold text-[#4D3D5C] uppercase tracking-wider opacity-70 ml-1">Daily Actions</h3>
           <div className="grid grid-cols-1 gap-3">
              {data.values.map((val: string, idx: number) => (
                 <div 
                    key={idx} 
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer duration-300 group",
                        checkedItems[idx] 
                        ? 'bg-green-50/80 border-green-200 shadow-inner' 
                        : 'bg-white/80 border-white/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                    )}
                    onClick={() => handleCheck(idx)}
                 >
                    <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                        checkedItems[idx] 
                        ? 'bg-green-500 border-green-500 scale-110' 
                        : 'border-gray-300 bg-transparent group-hover:border-[#6600ff]/50'
                    )}>
                        {checkedItems[idx] && <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={cn(
                        "text-lg font-serif transition-all duration-300",
                        checkedItems[idx] 
                        ? 'text-green-700 line-through opacity-60 decoration-green-500/50 decoration-2' 
                        : 'text-[#4D3D5C]'
                    )}>
                        {val}
                    </span>
                 </div>
              ))}
           </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Evening Reflection Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#4D3D5C] font-serif flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[#6600ff]" /> Evening Reflection
                </h3>
                {!isExpanded && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#6600ff] hover:text-[#5500dd] hover:bg-[#6600ff]/10"
                        onClick={() => setIsExpanded(true)}
                    >
                        Ready to complete day?
                    </Button>
                )}
            </div>

            {/* Content - Always visible but maybe greyed out if not expanded? No, let's just show it. User wants it "fillable". */}
            {/* Actually, let's make it fully interactive always. No "expand" needed really, but maybe "Complete Day" button is the focus. */}
            
            <div className="space-y-6 bg-white/40 dark:bg-black/20 rounded-2xl p-6 border border-white/30">
                 {/* Victory Input */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#4D3D5C] uppercase tracking-wider opacity-70">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Your Daily Victory
                    </label>
                    <Input 
                        placeholder="What was your biggest win today? Celebrate it!" 
                        className="h-12 bg-white/80 border-white/50 focus:ring-2 focus:ring-[#6600ff]/20 text-base font-serif shadow-sm rounded-xl transition-all focus:scale-[1.01]"
                        value={victory}
                        onChange={(e) => setVictory(e.target.value)}
                    />
                </div>

                {/* Vibe Rater */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-[#4D3D5C] uppercase tracking-wider opacity-70 block mb-4">
                        Evening Vibe Check
                    </label>
                    <VibeRater value={eveningVibe} onChange={setEveningVibe} />
                </div>
            </div>

            {/* Complete Button */}
            <Button 
                size="lg" 
                className="w-full bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold py-6 text-lg rounded-xl shadow-[0_4px_14px_0_rgba(102,0,255,0.39)] hover:shadow-[0_6px_20px_rgba(102,0,255,0.23)] hover:scale-[1.01] transition-all duration-200 active:scale-95"
                onClick={handleComplete}
            >
                <Sparkles className="w-5 h-5 mr-2" /> Complete Day & Save
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
