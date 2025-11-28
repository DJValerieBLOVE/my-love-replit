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
      subtitle: "Rate your vibration (Hawkins Scale)",
      component: <VibeRater value={data.vibe} onChange={(v) => setData({...data, vibe: v})} />
    },
    {
      id: 2,
      title: "Vision",
      subtitle: "What is your focus today?",
      component: (
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground italic font-serif">"Where attention goes, energy flows."</p>
          <Textarea 
            placeholder="I am creating..." 
            className="text-xl p-6 min-h-[180px] bg-muted/30 border-muted focus:bg-background resize-none font-serif rounded-lg"
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
          <p className="text-lg text-muted-foreground italic font-serif">Name it to tame it. (CLADDD)</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {['Confusion', 'Lies', 'Apathy', 'Distraction', 'Drifting', 'Disconnection'].map(v => (
              <Button 
                key={v} 
                variant={data.villain === v ? "default" : "outline"}
                onClick={() => setData({...data, villain: v})}
                className={`rounded-lg px-6 h-10 transition-all text-base font-serif ${data.villain === v ? 'bg-primary text-white shadow-sm' : 'bg-muted/30 border-muted hover:bg-primary/5 hover:text-primary'}`}
              >
                {v}
              </Button>
            ))}
          </div>
          <Input 
            placeholder="Or name your specific resistance..." 
            className="text-xl p-6 h-14 bg-muted/30 border-muted focus:bg-background font-serif rounded-lg"
            value={data.villain}
            onChange={e => setData({...data, villain: e.target.value})}
          />
        </div>
      )
    },
    {
      id: 4,
      title: "Value",
      subtitle: "What matters most today?",
      component: (
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground italic font-serif">Anchor to your core values.</p>
          <Input 
            placeholder="Today I value..." 
            className="text-xl p-6 h-16 bg-muted/30 border-muted focus:bg-background font-serif rounded-lg"
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
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground italic font-serif">What is one small win you commit to?</p>
          <Input 
            placeholder="I will..." 
            className="text-xl p-6 h-16 bg-muted/30 border-muted focus:bg-background font-serif rounded-lg"
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
        <h2 className="text-2xl font-bold font-serif">Morning 5 V's</h2>
        <span className="text-sm font-bold text-muted-foreground">Step {step} of 5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-none shadow-lg bg-card">
            <div className="h-[2px] w-full bg-[#6600ff]" />
            <CardContent className="p-8 min-h-[400px] flex flex-col">
              <div className="mb-6 text-center">
                <h3 className="text-3xl font-serif font-bold mb-2">{currentStep.title}</h3>
                <p className="text-muted-foreground font-serif text-lg">{currentStep.subtitle}</p>
              </div>
              
              <div className="flex-1">
                {currentStep.component}
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg" 
                  className="gap-2 px-8 rounded-lg bg-[#6600ff] hover:bg-[#5500dd] text-white shadow-md font-serif font-bold"
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
