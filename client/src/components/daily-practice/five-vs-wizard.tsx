import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VibeRater } from "./vibe-rater";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkles, ArrowLeft } from "lucide-react";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";

interface FiveVsWizardProps {
  onComplete: () => void;
}

export function FiveVsWizard({ onComplete }: FiveVsWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    vibe: 5,
    selectedAreaId: "",
    vision: "",
    values: ["", "", ""],
    villain: "",
    villainSolution: "",
    victory: ""
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const handleAreaSelect = (areaId: string) => {
    const area = LOVE_CODE_AREAS.find(a => a.id === areaId);
    setData({
      ...data, 
      selectedAreaId: areaId,
      // Clear the vision field so user can write fresh or ask mentor
      vision: "" 
    });
  };

  const updateValue = (index: number, text: string) => {
    const newValues = [...data.values];
    newValues[index] = text;
    setData({...data, values: newValues});
  };
  
  const steps = [
    {
      id: 1,
      title: "Vibe Check",
      subtitle: "Rate your vibration (1-11)",
      component: <VibeRater value={data.vibe} onChange={(v) => setData({...data, vibe: v})} />
    },
    {
      id: 2,
      title: "Vision",
      subtitle: "What is your focus today?",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Focus on a Big Dream</label>
            <Select value={data.selectedAreaId} onValueChange={handleAreaSelect}>
              <SelectTrigger className="w-full h-auto min-h-[3rem] py-2 bg-muted/30 border-muted focus:bg-background font-serif text-left">
                <SelectValue placeholder="Select one of your 11 Big Dreams..." />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-[300px]">
                {LOVE_CODE_AREAS.map((area) => (
                  <SelectItem key={area.id} value={area.id} className="pl-2 pr-2 w-full">
                    <div className="flex flex-col gap-2 text-left w-full">
                      <div className="grid grid-cols-[1fr_45px] items-center w-full gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${area.color}`} />
                          <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider truncate">
                            {area.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-right tabular-nums" style={{ color: area.hex }}>{area.progress}%</span>
                      </div>
                      
                      <div className="h-2 w-full rounded-full overflow-hidden relative">
                        {/* Track - lighter opacity of brand color */}
                        <div className="absolute inset-0 w-full h-full opacity-20" style={{ backgroundColor: area.hex }} />
                        {/* Indicator - solid brand color */}
                        <div className="h-full rounded-full absolute top-0 left-0" style={{ width: `${area.progress}%`, backgroundColor: area.hex }} />
                      </div>

                      <span className="text-sm line-clamp-2 text-muted-foreground font-serif whitespace-normal opacity-80">"{area.dream || "No dream defined yet..."}"</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Visualize & Affirm</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-[#6600ff] hover:text-[#5500dd] hover:bg-[#6600ff]/10 px-2 gap-1.5"
                onClick={() => {
                   const mantras = [
                     "I am aligning my actions with my highest truth.",
                     "Every step I take brings this vision closer to reality.",
                     "I embody the energy of this dream right now.",
                     "The universe is conspiring to help me achieve this.",
                     "I am worthy of this dream and I claim it today."
                   ];
                   const randomMantra = mantras[Math.floor(Math.random() * mantras.length)];
                   setData({...data, vision: randomMantra});
                }}
              >
                <Sparkles className="w-3 h-3" /> Ask Magic Mentor
              </Button>
            </div>
            <Textarea 
              placeholder="Write a mantra or describe your visualization for today..." 
              className="min-h-[120px] bg-muted/30 border-muted focus:bg-background resize-none text-base md:text-base font-serif"
              value={data.vision}
              onChange={e => setData({...data, vision: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Value",
      subtitle: "3 things you will do today to achieve the vision",
      component: (
        <div className="space-y-4">
          <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">My Action Steps</label>
          {data.values.map((val, idx) => (
            <div key={idx} className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-serif font-bold">
                {idx + 1}.
              </div>
              <Input 
                placeholder={`Action step ${idx + 1}...`}
                className="h-12 pl-8 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
                value={val}
                onChange={e => updateValue(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 4,
      title: "Villain",
      subtitle: "Identify Possible Obstacles",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">The Problem (Villain)</label>
            <Input 
              placeholder="What obstacle might show up? (e.g. Distraction, Doubt, Tired, etc...)" 
              className="h-12 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
              value={data.villain}
              onChange={e => setData({...data, villain: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">The Solution (Hero Move)</label>
            <Input 
              placeholder="How will you overcome it? (e.g. Deep breath, 5 min break...)" 
              className="h-12 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
              value={data.villainSolution}
              onChange={e => setData({...data, villainSolution: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Victory",
      subtitle: "Define your VIP (Victory In Progress)",
      component: (
        <div className="space-y-4">
          <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">My Commitment</label>
          <Input 
            placeholder="I will..." 
            className="h-12 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
            value={data.victory}
            onChange={e => setData({...data, victory: e.target.value})}
          />
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-serif text-muted-foreground">Morning 5 V's</h2>
        <span className="text-sm font-serif text-muted-foreground">Step {step} of 5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-card">
            <div className="h-[2px] w-full bg-primary" />
            <CardContent className="p-8 min-h-[400px] flex flex-col">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-serif mb-2 text-muted-foreground">{currentStep.title}</h3>
                <p className="text-muted-foreground text-lg font-serif">{currentStep.subtitle}</p>
              </div>
              
              <div className="flex-1">
                {currentStep.component}
              </div>

              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2 px-4 text-muted-foreground hover:text-foreground font-serif"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div /> /* Spacer for layout */
                )}
                
                <Button 
                  size="lg" 
                  className="gap-2 px-8"
                  onClick={step < 5 ? nextStep : onComplete}
                >
                  {step < 5 ? (
                    <>Next Step <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Complete Practice <Sparkles className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
