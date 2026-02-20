import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VibeRater } from "./vibe-rater";
import { Sparkles, CheckCircle, Moon, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface EveningCheckInProps {
  morningData: {
    values: string[]; // The 3 things
  };
  onComplete: (eveningData: any) => void;
}

export function EveningCheckIn({ morningData, onComplete }: EveningCheckInProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [victory, setVictory] = useState("");
  const [eveningVibe, setEveningVibe] = useState(8); // Default to a good vibe

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
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF'] // Celebration colors
    });
    onComplete({
      checkedItems,
      victory,
      eveningVibe
    });
  };

  return (
     <Card className="border-none shadow-lg bg-[#F5F3FF] dark:bg-[#1A052E] border-white/20 overflow-hidden relative">
        {/* Magical background effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <CardContent className="p-8 space-y-8 relative z-10">
           <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Moon className="w-8 h-8 text-[#6600ff]" strokeWidth={1.5} />
             </div>
             <h2 className="text-3xl font-normal text-[#4D3D5C] dark:text-white font-serif">Evening Vibe Check</h2>
             <p className="text-[#4D3D5C]/80 dark:text-white/80 text-lg font-serif">Close your day with gratitude and reflection.</p>
           </div>

           {/* 3 Things Checklist */}
           <div className="space-y-4 bg-white/60 dark:bg-black/20 p-6 rounded-2xl border border-white/50 backdrop-blur-sm">
              <h3 className="text-xs font-normal text-[#4D3D5C] uppercase tracking-wider mb-4 opacity-70">Did you complete your 3 things?</h3>
              {morningData.values.map((val, idx) => (
                 <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer duration-300 ${
                        checkedItems[idx] 
                        ? 'bg-green-50/80 border-green-200 shadow-inner scale-[0.98]' 
                        : 'bg-white border-transparent hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                    }`}
                    onClick={() => handleCheck(idx)}
                 >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        checkedItems[idx] 
                        ? 'bg-green-500 border-green-500 scale-110' 
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                        {checkedItems[idx] && <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-lg font-serif transition-all duration-300 ${
                        checkedItems[idx] 
                        ? 'text-green-700 line-through opacity-60 decoration-green-500/50 decoration-2' 
                        : 'text-[#4D3D5C]'
                    }`}>
                        {val || "Undefined Goal"}
                    </span>
                 </div>
              ))}
           </div>

           {/* Victory */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-normal text-[#4D3D5C] uppercase tracking-wider opacity-70">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Your Daily Victory
                </label>
                <Input 
                    placeholder="What was your biggest win today? Celebrate it!" 
                    className="h-14 bg-white border-white/50 focus:ring-2 focus:ring-[#6600ff]/20 text-lg font-serif shadow-sm rounded-xl"
                    value={victory}
                    onChange={(e) => setVictory(e.target.value)}
                />
            </div>

           {/* Vibe Rater */}
           <div className="pt-6 border-t border-[#4D3D5C]/10">
              <h3 className="text-center text-xs font-normal text-[#4D3D5C] uppercase tracking-wider mb-6 opacity-70">How's your vibe now?</h3>
              <VibeRater value={eveningVibe} onChange={setEveningVibe} />
           </div>

           <Button 
             size="lg" 
             className="w-full bg-foreground hover:bg-foreground/90 text-background font-normal py-8 text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
             onClick={handleComplete}
           >
             <Sparkles className="w-6 h-6 mr-2" strokeWidth={2} /> Complete Day & Save
           </Button>

        </CardContent>
     </Card>
  );
}
