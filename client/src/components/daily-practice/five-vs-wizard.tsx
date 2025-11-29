import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VibeRater } from "./vibe-rater";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
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
    victory: ""
  });

  const nextStep = () => setStep(s => s + 1);
  
  const handleAreaSelect = (areaId: string) => {
    const area = LOVE_CODE_AREAS.find(a => a.id === areaId);
    setData({
      ...data, 
      selectedAreaId: areaId,
      // Optional: pre-fill vision with the dream if empty
      vision: data.vision || (area?.dream || "")
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
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Select a Big Dream</label>
            <Select value={data.selectedAreaId} onValueChange={handleAreaSelect}>
              <SelectTrigger className="w-full h-12 bg-muted/30 border-muted focus:bg-background font-serif">
                <SelectValue placeholder="Choose an area to focus on..." />
              </SelectTrigger>
              <SelectContent>
                {LOVE_CODE_AREAS.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${area.color}`} />
                      {area.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Visualize the Outcome</label>
            <Textarea 
              placeholder="What are you visualizing for this outcome today? Describe it in detail..." 
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
        <h2 className="text-3xl font-serif text-foreground">Morning 5 V's</h2>
        <span className="text-sm font-serif text-muted-foreground">Step {step} of 4</span>
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
                <h3 className="text-2xl font-serif mb-2">{currentStep.title}</h3>
                <p className="text-muted-foreground text-lg font-serif">{currentStep.subtitle}</p>
              </div>
              
              <div className="flex-1">
                {currentStep.component}
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg" 
                  className="gap-2 px-8 bg-[#6600ff] hover:bg-[#5500dd] text-white font-serif shadow-sm hover:shadow-md transition-all"
                  onClick={step < 4 ? nextStep : onComplete}
                >
                  {step < 4 ? (
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
