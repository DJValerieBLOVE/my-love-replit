import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Heart, Moon, Sun, Trophy, BookOpen, ChevronDown, Award, Image as ImageIcon, Plus, Eye } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivePracticeCardProps {
  data?: any; // Optional now, as it can be empty
  onComplete: (data: any) => void;
}

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Lock } from "lucide-react";

export function ActivePracticeCard({ data: initialData, onComplete }: ActivePracticeCardProps) {
  // Initialize state with existing data OR defaults
  // Ensure numbers are converted to strings for Inputs
  const [morningVibe, setMorningVibe] = useState<string>(initialData?.morningVibe ? String(initialData.morningVibe) : "");
  const [eveningVibe, setEveningVibe] = useState<string>(initialData?.eveningVibe ? String(initialData.eveningVibe) : "");
  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialData?.focusArea?.id || "");
  
  const [vision, setVision] = useState(initialData?.vision || "");
  const [gratitude, setGratitude] = useState(initialData?.gratitude || "");
  const [reflection, setReflection] = useState(initialData?.content || "");
  
  const [values, setValues] = useState<string[]>(initialData?.values || ["", "", ""]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(initialData?.checkedItems || [false, false, false]);
  const [villain, setVillain] = useState(initialData?.villain || "");
  const [tool, setTool] = useState(initialData?.tool || "");
  const [victory, setVictory] = useState(initialData?.victory || "");
  const [gratitudeImage, setGratitudeImage] = useState<string | null>(null);
  
  const [sharedClubId, setSharedClubId] = useState<string>(initialData?.sharedClubId || "private");

  // Mock Clubs Data
  const USER_CLUBS = [
    { id: "private", name: "Private Note (Only Me)" },
    { id: "club-1", name: "Wellness Warriors" },
    { id: "club-2", name: "Manifestation Circle" },
    { id: "club-3", name: "Design Club" }
  ];

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGratitudeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      id: initialData?.id,
      morningVibe,
      eveningVibe,
      focusArea: selectedArea,
      vision,
      gratitude,
      content: reflection,
      values,
      checkedItems,
      villain,
      tool,
      victory,
      sharedClubId
    });
  };

  return (
      <Card className="border-none shadow-sm bg-card relative overflow-visible group mb-16 lg:mb-0">
          <CardContent className="p-6 pl-[2px] pr-[2px] pt-[2px] pb-[2px]">
             <div className="mb-6 flex items-center gap-2 text-muted-foreground pl-[4px] pr-[4px] pt-[5px] pb-[5px]">
                 <Heart className="w-3 h-3" strokeWidth={1.5} />
                 <h2 className="text-xs font-medium">Daily LOVE Practice</h2>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
               
               {/* Col 1: Morning Alignment */}
               <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                       <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                       <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Morning Alignment</span>
                   </div>
                   
                   {/* Morning Vibe */}
                   <div className="bg-white/50 rounded-xl px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                       <div className="text-[15px] font-bold text-muted-foreground">Morning Vibe</div>
                       <Input 
                           type="text" 
                           placeholder="1-11"
                           maxLength={2}
                           className="w-16 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none"
                           value={morningVibe}
                           onChange={(e) => {
                               const val = e.target.value;
                               if (val === '' || (/^\d+$/.test(val) && parseInt(val) >= 1 && parseInt(val) <= 11)) {
                                   setMorningVibe(val);
                               }
                           }}
                       />
                   </div>

                   {/* Morning Gratitude & Image */}
                   <div className="space-y-2 flex-1 flex flex-col">
                       <label className="text-[15px] font-bold text-muted-foreground block pl-3">Morning Gratitude</label>
                       <div className="flex-1 bg-white border border-muted/50 rounded-xl overflow-hidden flex flex-col shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                           <Textarea 
                               placeholder="I am grateful for..." 
                               className="flex-1 min-h-[120px] border-none focus-visible:ring-0 text-sm font-serif resize-none p-3 shadow-none placeholder:text-muted-foreground/50"
                               value={gratitude}
                               onChange={(e) => setGratitude(e.target.value)}
                           />
                           
                           {/* Image Preview Area */}
                           {gratitudeImage && (
                               <div className="px-3 pb-3">
                                   <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border/20 group/image">
                                       <img src={gratitudeImage} alt="Gratitude" className="w-full h-full object-cover" />
                                       <Button 
                                           variant="destructive" 
                                           size="icon" 
                                           className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-full"
                                           onClick={() => setGratitudeImage(null)}
                                       >
                                           <Plus className="w-4 h-4 rotate-45" />
                                       </Button>
                                   </div>
                               </div>
                           )}

                           {/* Image Upload Button */}
                           {!gratitudeImage && (
                               <div className="p-2 border-t border-muted/20 flex justify-between items-center bg-muted/5">
                                   <div className="relative">
                                       <input 
                                           type="file" 
                                           accept="image/*" 
                                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                           onChange={handleImageUpload}
                                       />
                                       <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-2 hover:text-primary hover:bg-primary/5 px-2">
                                           <ImageIcon className="w-3.5 h-3.5" />
                                           Add Photo
                                       </Button>
                                   </div>
                                   <span className="text-[10px] text-muted-foreground/50 italic pr-2">Optional</span>
                               </div>
                           )}
                       </div>
                   </div>
               </div>

               {/* Col 2: Focus & Action (Middle) */}
               <div className="flex flex-col space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                       <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                       <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Vision</span>
                   </div>

                   {/* Focus Area */}
                   <div className="space-y-2">
                       <label className="text-[15px] font-bold text-muted-foreground block mt-2.5 pl-3">Big Dream</label>
                       <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                           <SelectTrigger className={cn(
                               "w-full bg-white border-muted/50 focus:ring-primary/20 font-serif shadow-sm text-left whitespace-normal transition-all",
                               selectedArea ? "h-auto min-h-[3rem] py-3" : "h-10"
                           )}>
                               {selectedArea ? (
                                   <div className="flex flex-col gap-2 w-full text-left">
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <span className={`w-2 h-2 rounded-full ${selectedArea.color}`} />
                                               <span className="text-[11px] font-bold text-muted-foreground uppercase font-serif">{selectedArea.name}</span>
                                           </div>
                                           <span className="text-[10px] font-bold text-muted-foreground font-serif">{selectedArea.progress}%</span>
                                       </div>
                                       
                                       <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                           <div className="h-full rounded-full" style={{ width: `${selectedArea.progress}%`, backgroundColor: selectedArea.hex }} />
                                       </div>
                                       
                                       <p className="text-xs font-serif text-muted-foreground italic leading-relaxed opacity-80 whitespace-normal">
                                           "{selectedArea.dream}"
                                       </p>
                                   </div>
                               ) : (
                                   <SelectValue placeholder="Select a Focus Area..." />
                               )}
                           </SelectTrigger>
                           <SelectContent className="max-h-[400px]">
                               {LOVE_CODE_AREAS.map((area) => (
                               <SelectItem key={area.id} value={area.id} className="font-serif py-3 focus:bg-muted/5 border-b border-border/10 last:border-0 cursor-pointer">
                                   <div className="flex flex-col gap-2 w-[260px] text-left">
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <span className={`w-2 h-2 rounded-full ${area.color}`} />
                                               <span className="text-[11px] font-bold text-muted-foreground uppercase font-serif">{area.name}</span>
                                           </div>
                                           <span className="text-[10px] font-bold text-muted-foreground font-serif">{area.progress}%</span>
                                       </div>
                                       
                                       <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                           <div className="h-full rounded-full" style={{ width: `${area.progress}%`, backgroundColor: area.hex }} />
                                       </div>
                                       
                                       <p className="text-xs font-serif text-muted-foreground italic leading-relaxed opacity-80 line-clamp-2 whitespace-normal">
                                           "{area.dream}"
                                       </p>
                                   </div>
                               </SelectItem>
                               ))}
                           </SelectContent>
                       </Select>
                   </div>

                   {/* Values (Action Steps) */}
                   <div className="space-y-3 flex-1 pt-2">
                        <div className="text-[15px] font-bold text-muted-foreground flex justify-between pl-3">
                           <span>Value (3 Actions)</span>
                        </div>
                        <div className="space-y-3">
                           {values.map((val, idx) => (
                               <div key={idx} className="flex gap-3 items-center group">
                                   <div 
                                       className={cn(
                                           "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-sm",
                                           checkedItems[idx] 
                                               ? "bg-green-500 border-green-500 text-white" 
                                               : "border-muted-foreground/20 bg-white hover:border-primary/40 hover:scale-105"
                                       )}
                                       onClick={() => handleCheck(idx)}
                                   >
                                       {checkedItems[idx] && <CheckCircle className="w-4 h-4" strokeWidth={3} />}
                                   </div>
                                   <Input 
                                       placeholder={`Action Step ${idx + 1}`}
                                       className={cn(
                                           "h-10 bg-white border-muted/30 rounded-lg px-3 focus-visible:ring-primary/10 focus-visible:border-primary/30 font-serif text-sm transition-all shadow-sm placeholder:text-muted-foreground/50",
                                           checkedItems[idx] && "text-green-700 line-through opacity-60 decoration-green-500/30 bg-green-50/30"
                                       )}
                                       value={val}
                                       onChange={(e) => handleValueChange(idx, e.target.value)}
                                   />
                               </div>
                           ))}
                        </div>
                   </div>

                    {/* Villain Input - Bottom */}
                   <div className="space-y-2 pt-4 border-t border-border/10 mt-auto">
                       <div className="space-y-2 mb-2">
                           <label className="text-[15px] font-bold text-muted-foreground pl-3 mb-1 block">Villain (Obstacle)</label>
                           <Input 
                               placeholder="What stands in the way?" 
                               className="h-9 bg-white border-muted/50 focus:border-primary/30 text-sm font-serif text-muted-foreground placeholder:text-muted-foreground/50"
                               value={villain}
                               onChange={(e) => setVillain(e.target.value)}
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[15px] font-bold text-muted-foreground pl-3 mb-1 block">Tool (Solution)</label>
                           <Input 
                               placeholder="How will I overcome it?" 
                               className="h-9 bg-white border-muted/50 focus:border-primary/30 text-sm font-serif text-muted-foreground placeholder:text-muted-foreground/50"
                               value={tool}
                               onChange={(e) => setTool(e.target.value)} 
                           />
                       </div>
                   </div>
               </div>

               {/* Col 3: Evening Review */}
               <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                       <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                       <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Evening Review</span>
                   </div>

                   {/* Evening Vibe */}
                   <div className="bg-white/50 rounded-xl px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                       <div className="text-[15px] font-bold text-muted-foreground">Evening Vibe</div>
                       <Input 
                           type="text" 
                           placeholder="1-11"
                           maxLength={2}
                           className="w-16 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif text-muted-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none"
                           value={eveningVibe}
                           onChange={(e) => {
                               const val = e.target.value;
                               if (val === '' || (/^\d+$/.test(val) && parseInt(val) >= 1 && parseInt(val) <= 11)) {
                                   setEveningVibe(val);
                               }
                           }}
                       />
                   </div>

                    {/* Victory Input */}
                   <div className="space-y-2">
                       <label className="text-[15px] font-bold text-muted-foreground flex items-center gap-1 pl-3">
                           <Trophy className="w-3 h-3 text-muted-foreground stroke-[1.5]" /> 
                           Victory
                       </label>
                       <Textarea 
                           placeholder="My daily win..." 
                           className="min-h-[36px] h-auto bg-white border-muted/50 focus:border-green-500/30 focus:ring-green-500/10 text-sm font-serif text-muted-foreground placeholder:text-muted-foreground/50 shadow-sm resize-none py-2"
                           value={victory}
                           onChange={(e) => setVictory(e.target.value)}
                       />
                   </div>

                   {/* Lessons & Blessings */}
                   <div className="flex-1 flex flex-col space-y-2 pt-2 border-t border-border/20">
                       <label className="text-[15px] font-bold text-muted-foreground block pl-3">Lessons & Blessings</label>
                        <Textarea 
                           placeholder="What did I learn? What went well?" 
                           className="flex-1 w-full min-h-[150px] bg-white border-muted/50 focus:ring-primary/10 resize-none font-serif text-muted-foreground text-sm leading-6 p-3 rounded-xl transition-all shadow-sm placeholder:text-muted-foreground/50"
                           value={reflection}
                           onChange={(e) => setReflection(e.target.value)}
                       />
                       <div className="pt-4 pb-1 space-y-2">
                           <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide pl-1">Optional: Share with Club</Label>
                           <Select value={sharedClubId} onValueChange={setSharedClubId}>
                               <SelectTrigger className={cn(
                                   "w-full h-9 text-xs font-medium transition-all",
                                   sharedClubId === 'private' 
                                       ? "bg-love-body/10 text-love-body border-love-body/10 shadow-sm" 
                                       : "bg-white border-muted/50 text-foreground"
                               )}>
                                   <div className="flex items-center gap-2">
                                       {sharedClubId === 'private' ? (
                                           <Lock className="w-3.5 h-3.5" />
                                       ) : (
                                           <Users className="w-3.5 h-3.5" />
                                       )}
                                       <SelectValue />
                                   </div>
                               </SelectTrigger>
                               <SelectContent align="end">
                                   {USER_CLUBS.map((club) => (
                                       <SelectItem key={club.id} value={club.id} className="text-xs cursor-pointer">
                                           {club.name}
                                       </SelectItem>
                                   ))}
                               </SelectContent>
                           </Select>
                       </div>

                       <Button 
                           className="w-full bg-primary hover:bg-primary/90 text-white shadow-md h-10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                           onClick={handleComplete}
                       >
                           Save Practice
                       </Button>
                   </div>
               </div>

             </div>
          </CardContent>
      </Card>
  );
}

