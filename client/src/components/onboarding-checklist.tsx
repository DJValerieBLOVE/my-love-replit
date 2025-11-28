import { useState } from "react";
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  PartyPopper
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Step {
  id: string;
  label: string;
  isCompleted: boolean;
}

interface OnboardingSection {
  id: string;
  title: string;
  completed: boolean;
  steps: Step[];
}

interface Props {
  data: OnboardingSection[];
  className?: string;
}

export function OnboardingChecklist({ data: initialData, className }: Props) {
  const [sections, setSections] = useState(initialData);
  const [expanded, setExpanded] = useState<string | null>("step-1");

  const totalSteps = sections.reduce((acc, section) => acc + section.steps.length, 0);
  const completedSteps = sections.reduce((acc, section) => 
    acc + section.steps.filter(s => s.isCompleted).length, 0
  );
  const progress = Math.round((completedSteps / totalSteps) * 100);

  const toggleStep = (sectionId: string, stepId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      
      const newSteps = section.steps.map(step => {
        if (step.id !== stepId) return step;
        return { ...step, isCompleted: !step.isCompleted };
      });
      
      const allCompleted = newSteps.every(s => s.isCompleted);
      
      if (allCompleted && !section.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      return {
        ...section,
        steps: newSteps,
        completed: allCompleted
      };
    }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {progress === 100 ? (
        <div className="text-center p-8 bg-primary/10 rounded-md border-2 border-primary/20 animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold mb-2">All Set! 🎉</h3>
          <p className="text-muted-foreground">You've completed all onboarding tasks.</p>
        </div>
      ) : (
        <Card className="border-none shadow-md overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-serif font-bold text-2xl">Welcome Checklist</h3>
                <p className="text-base text-muted-foreground" style={{ fontSize: "16px" }}>Get set up for success</p>
              </div>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-primary/10 [&>div]:bg-primary" />
          </div>

          <div className="divide-y">
            {sections.map((section) => (
              <div key={section.id} className="bg-card">
                <button
                  onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{section.steps.filter(s => s.isCompleted).length}/{section.steps.length} lessons</span>
                    {expanded === section.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {expanded === section.id && (
                  <div className="bg-muted/30 px-4 pb-4 pt-2 space-y-1">
                    {section.steps.map((step) => (
                      <div 
                        key={step.id}
                        onClick={() => toggleStep(section.id, step.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer group transition-all"
                      >
                        {step.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-primary fill-primary/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        )}
                        <span className={cn(
                          "transition-colors font-medium",
                          step.isCompleted ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"
                        )} style={{ fontSize: "16px" }}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
