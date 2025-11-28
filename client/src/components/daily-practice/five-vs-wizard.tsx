import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VibeRater } from "./vibe-rater";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";

interface FiveVsWizardProps {
  onComplete: () => void;
}

export function FiveVsWizard({ onComplete }: FiveVsWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    vibe: 5,
    vision: "",
    villain: "",
    value: "",
    victory: ""
  });

  const nextStep = () => setStep(s => s + 1);
  
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
        <div className="space-y-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Vision</label>
          <Textarea 
            placeholder="I am creating..." 
            className="min-h-[120px] bg-muted/30 border-muted focus:bg-background resize-none text-base md:text-base font-serif"
            value={data.vision}
            onChange={e => setData({...data, vision: e.target.value})}
          />
        </div>
      )
    },
    {
      id: 3,
      title: "Villain",
      subtitle: "Who is trying to stop you?",
      component: (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {['Confusion', 'Lies', 'Apathy', 'Distraction', 'Drifting', 'Disconnection'].map(v => (
              <Button 
                key={v} 
                variant={data.villain === v ? "default" : "ghost"}
                onClick={() => setData({...data, villain: v})}
                className={`rounded-full px-4 h-8 text-xs font-medium uppercase tracking-wide ${data.villain === v ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary bg-muted/30'}`}
              >
                {v}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Specific Resistance</label>
            <Input 
              placeholder="Name your villain..." 
              className="h-12 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
              value={data.villain}
              onChange={e => setData({...data, villain: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Value",
      subtitle: "What matters most today?",
      component: (
        <div className="space-y-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Core Value</label>
          <Input 
            placeholder="Today I value..." 
            className="h-12 bg-muted/30 border-muted focus:bg-background text-base md:text-base font-serif"
            value={data.value}
            onChange={e => setData({...data, value: e.target.value})}
          />
        </div>
      )
    },
    {
      id: 5,
      title: "Victory",
      subtitle: "Define your VIP (Victory In Progress)",
      component: (
        <div className="space-y-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Commitment</label>
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
        <h2 className="text-2xl font-serif font-bold text-foreground">Morning 5 V's</h2>
        <span className="text-sm font-medium text-muted-foreground">Step {step} of 5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
            <div className="h-[2px] w-full bg-primary" />
            <CardContent className="p-8 min-h-[400px] flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold mb-2">{currentStep.title}</h3>
                <p className="text-muted-foreground text-base">{currentStep.subtitle}</p>
              </div>
              
              <div className="flex-1">
                {currentStep.component}
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg" 
                  className="gap-2 px-8 bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold shadow-sm hover:shadow-md transition-all"
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
