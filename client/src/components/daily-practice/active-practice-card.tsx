import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Heart, Moon, Sun, Trophy, BookOpen, ChevronDown, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivePracticeCardProps {
  data?: any; // Optional now, as it can be empty
  onComplete: (data: any) => void;
}

export function ActivePracticeCard({ data: initialData, onComplete }: ActivePracticeCardProps) {
  // Initialize state with existing data OR defaults
  const [morningVibe, setMorningVibe] = useState<string>(initialData?.morningVibe || "");
  const [eveningVibe, setEveningVibe] = useState<string>(initialData?.eveningVibe || "");
  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialData?.focusArea?.id || "");
  
  const [vision, setVision] = useState(initialData?.vision || "");
  const [reflection, setReflection] = useState(initialData?.content || "");
  
  const [values, setValues] = useState<string[]>(initialData?.values || ["", "", ""]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(initialData?.checkedItems || [false, false, false]);
  const [villain, setVillain] = useState(initialData?.villain || "");
  const [victory, setVictory] = useState(initialData?.victory || "");

  const selectedArea = LOVE_CODE_AREAS.find(a => a.id === selectedAreaId);

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const handleCheck = (index: number) => {
    // Only allow checking if there is text
    if (!values[index]) return;

    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    
    if (!checkedItems[index]) {
        confetti({
            particleCount: 30,
            spread: 40,
            origin: { y: 0.7, x: 0.5 },
            colors: ['#10B981', '#34D399'] 
        });
    }
  };

  const handleComplete = () => {
    if (!victory) return; 

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF']
    });

    onComplete({
      morningVibe,
      eveningVibe,
      focusArea: selectedArea,
      vision,
      content: reflection,
      values,
      checkedItems,
      villain,
      victory
    });
  };

  return (
    <Card className="border-none shadow-sm bg-card relative overflow-visible group">
       <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1fr] gap-8">
            
            {/* Col 1: Vibes & Focus */}
            <div className="flex flex-col space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mt-[1px]">Daily LOVE Practice</span>
                    </div>
                    <div className="text-lg text-muted-foreground font-serif">Today, {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                </div>

                <div className="space-y-3">
                    {/* Morning Vibe */}
                    <div className="bg-muted/10 rounded-lg p-3 border border-border/40 flex justify-between items-center group/morning focus-within:border-primary/30 focus-within:bg-white/50 transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif flex items-center gap-2">
                            <Sun className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                            Morning Vibe
                        </div>
                        <Input 
                            type="number" 
                            min="1" 
                            max="11"
                            placeholder="-"
                            className="w-12 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif focus-visible:ring-0 placeholder:text-muted-foreground/30"
                            value={morningVibe}
                            onChange={(e) => setMorningVibe(e.target.value)}
                        />
                    </div>

                    {/* Evening Vibe */}
                    <div className="bg-muted/10 rounded-lg p-3 border border-border/40 flex justify-between items-center group/evening focus-within:border-[#6600ff]/30 focus-within:bg-white/50 transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase font-serif flex items-center gap-2">
                            <Moon className="w-4 h-4 text-muted-foreground stroke-[1.5]" /> 
                            Evening Vibe
                        </div>
                        <Input 
                            type="number" 
                            min="1" 
                            max="11"
                            placeholder="-"
                            className="w-12 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif focus-visible:ring-0 placeholder:text-muted-foreground/30"
                            value={eveningVibe}
                            onChange={(e) => setEveningVibe(e.target.value)}
                        />
                    </div>

                    {/* Focus Area Dropdown */}
                    <div className="pt-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">My Focus</label>
                        <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                            <SelectTrigger className="w-full h-10 bg-white border-muted focus:ring-primary/20 font-serif">
                                <SelectValue placeholder="Select a Focus Area..." />
                            </SelectTrigger>
                            <SelectContent>
                                {LOVE_CODE_AREAS.map((area) => (
                                <SelectItem key={area.id} value={area.id} className="font-serif">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${area.color}`} />
                                        {area.name}
                                    </div>
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Selected Area Preview */}
                        {selectedArea && (
                            <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-border/30 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Big Dream</span>
                                    <span className="text-[10px] font-bold text-muted-foreground">{selectedArea.progress}%</span>
                                </div>
                                <p className="text-xs font-serif text-muted-foreground italic leading-relaxed mb-2">
                                    "{selectedArea.dream}"
                                </p>
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${selectedArea.progress}%`, backgroundColor: selectedArea.hex }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Col 2: Reflection (Middle) */}
            <div className="flex flex-col h-full pt-[3px]">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-muted-foreground stroke-[1.5]" /> 
                    My Blessings
                </label>
                <div className="flex-1 relative">
                     <Textarea 
                        placeholder="Count your blessings... what are you grateful for?" 
                        className="w-full h-full min-h-[300px] bg-white/50 border-muted focus:border-primary/30 focus:ring-primary/10 resize-none font-serif text-muted-foreground text-base leading-7 p-4 rounded-xl transition-all"
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                    />
                    {/* Decorative corner accent */}
                    <div className="absolute bottom-3 right-3 opacity-10 pointer-events-none">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Col 3: Details (Right) */}
            <div className="flex flex-col space-y-6 bg-muted/10 p-5 rounded-xl border border-border/40 h-fit">
                
                {/* Vision Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Vision / Intention</label>
                    <Input 
                        placeholder="What is your main intention?" 
                        className="h-9 bg-white/80 border-muted/50 focus:border-primary/30 text-sm font-serif italic placeholder:not-italic"
                        value={vision}
                        onChange={(e) => setVision(e.target.value)}
                    />
                </div>

                {/* 3 Action Steps (Fillable & Checkable) */}
                <div className="space-y-3">
                     <div className="text-[10px] font-bold text-muted-foreground uppercase flex justify-between">
                        <span>Action Steps</span>
                        <span className="text-[9px] opacity-50">Check when done</span>
                     </div>
                     <div className="space-y-2">
                        {values.map((val, idx) => (
                            <div key={idx} className="flex gap-2 items-center group">
                                <div 
                                    className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all",
                                        checkedItems[idx] 
                                            ? "bg-green-500 border-green-500 text-white" 
                                            : "border-muted-foreground/30 bg-white hover:border-primary/40"
                                    )}
                                    onClick={() => handleCheck(idx)}
                                >
                                    {checkedItems[idx] && <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />}
                                </div>
                                <Input 
                                    placeholder={`Action ${idx + 1}`}
                                    className={cn(
                                        "h-8 bg-transparent border-b border-t-0 border-x-0 border-muted/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary/50 font-serif text-sm transition-all",
                                        checkedItems[idx] && "text-green-700 line-through opacity-60 decoration-green-500/30"
                                    )}
                                    value={val}
                                    onChange={(e) => handleValueChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                     </div>
                </div>

                {/* Villain Input */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Villain (Obstacle)</label>
                    <Input 
                        placeholder="What stands in the way?" 
                        className="h-9 bg-white/50 border-muted/50 focus:border-red-300 text-sm font-serif text-red-900/80 placeholder:text-red-900/20"
                        value={villain}
                        onChange={(e) => setVillain(e.target.value)}
                    />
                </div>

                {/* Victory Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-muted-foreground stroke-[1.5]" /> 
                        Victory
                    </label>
                    <Input 
                        placeholder="Your win for the day..." 
                        className="h-9 bg-white/80 border-muted/50 focus:border-green-500/50 focus:ring-green-500/10 text-sm font-serif text-muted-foreground placeholder:text-muted-foreground/50"
                        value={victory}
                        onChange={(e) => setVictory(e.target.value)}
                    />
                </div>

                {/* Save Button */}
                <Button 
                    size="sm" 
                    className="w-full mt-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                    onClick={handleComplete}
                >
                    Save Entry
                </Button>

            </div>

          </div>
       </CardContent>
    </Card>
  );
}

