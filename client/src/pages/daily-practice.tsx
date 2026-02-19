import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VibeRater } from "@/components/daily-practice/vibe-rater";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, ArrowRight, ArrowLeft, Check, CheckCircle,
  Trophy, Heart, Flame, Eye, BookOpen, Calendar, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useNostr } from "@/contexts/nostr-context";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type DailyPracticeData = {
  id?: string;
  date: string;
  morningVibe: number | null;
  focusAreaId: string | null;
  vision: string | null;
  values: string[];
  villain: string | null;
  villainSolution: string | null;
  victory: string | null;
  morningCompleted: boolean;
  celebrations: string | null;
  lessons: string | null;
  blessings: string | null;
  dreamVibes: string | null;
  eveningVibe: number | null;
  valuesChecked: boolean[];
  eveningCompleted: boolean;
};

type PracticePhase = "morning" | "evening" | "complete" | "history";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getTimeOfDay(): "morning" | "evening" {
  const hour = new Date().getHours();
  return hour < 16 ? "morning" : "evening";
}

function MorningWizard({ data, onSave }: { data: DailyPracticeData; onSave: (d: DailyPracticeData) => void }) {
  const [step, setStep] = useState(1);
  const [vibe, setVibe] = useState(data.morningVibe || 5);
  const [focusAreaId, setFocusAreaId] = useState(data.focusAreaId || "");
  const [vision, setVision] = useState(data.vision || "");
  const [values, setValues] = useState<string[]>(data.values.length >= 3 ? data.values : ["", "", ""]);
  const [villain, setVillain] = useState(data.villain || "");
  const [villainSolution, setVillainSolution] = useState(data.villainSolution || "");
  const [victory, setVictory] = useState(data.victory || "");

  const selectedArea = LOVE_CODE_AREAS.find(a => a.id === focusAreaId);

  const handleComplete = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ["#6600ff", "#9900ff", "#cc00ff", "#FFD700"] });
    onSave({
      ...data,
      morningVibe: vibe,
      focusAreaId,
      vision,
      values,
      villain,
      villainSolution,
      victory,
      morningCompleted: true,
    });
  };

  const steps = [
    {
      title: "VIBE",
      subtitle: "How are you feeling right now? (1-11 scale)",
      content: (
        <VibeRater value={vibe} onChange={setVibe} />
      ),
    },
    {
      title: "VISION",
      subtitle: "What Big Dream are you focusing on today?",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider" data-testid="label-focus-area">Focus Area</label>
            <Select value={focusAreaId} onValueChange={setFocusAreaId}>
              <SelectTrigger className="w-full h-auto min-h-[3rem] py-2 bg-muted/30 border-muted font-serif text-left" data-testid="select-focus-area">
                <SelectValue placeholder="Select one of your 11 dimensions..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {LOVE_CODE_AREAS.map((area) => (
                  <SelectItem key={area.id} value={area.id} className="py-2 cursor-pointer" data-testid={`option-area-${area.id}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${area.color}`} />
                      <span className="text-sm font-serif">{area.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Visualize & Affirm</label>
            <Textarea
              placeholder="Write your vision or mantra for today..."
              className="min-h-[120px] bg-muted/30 border-muted resize-none font-serif"
              value={vision}
              onChange={e => setVision(e.target.value)}
              data-testid="textarea-vision"
            />
          </div>
        </div>
      ),
    },
    {
      title: "VALUE",
      subtitle: "3 action steps you will take today",
      content: (
        <div className="space-y-4">
          {values.map((val, idx) => (
            <div key={idx} className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-serif">
                {idx + 1}.
              </div>
              <Input
                placeholder={`Action step ${idx + 1}...`}
                className="h-12 pl-8 bg-muted/30 border-muted font-serif"
                value={val}
                onChange={e => {
                  const newValues = [...values];
                  newValues[idx] = e.target.value;
                  setValues(newValues);
                }}
                data-testid={`input-value-${idx}`}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "VILLAIN",
      subtitle: "What obstacle might show up today?",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">The Obstacle</label>
            <Input
              placeholder="e.g. Distraction, Doubt, Fatigue..."
              className="h-12 bg-muted/30 border-muted font-serif"
              value={villain}
              onChange={e => setVillain(e.target.value)}
              data-testid="input-villain"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Your Hero Move</label>
            <Input
              placeholder="How will you overcome it?"
              className="h-12 bg-muted/30 border-muted font-serif"
              value={villainSolution}
              onChange={e => setVillainSolution(e.target.value)}
              data-testid="input-villain-solution"
            />
          </div>
        </div>
      ),
    },
    {
      title: "VICTORY",
      subtitle: "What will today's win look like?",
      content: (
        <div className="space-y-4">
          <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">My Commitment</label>
          <Textarea
            placeholder="Today I will..."
            className="min-h-[120px] bg-muted/30 border-muted resize-none font-serif"
            value={victory}
            onChange={e => setVictory(e.target.value)}
            data-testid="textarea-victory"
          />
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-serif text-muted-foreground uppercase tracking-wider">Morning Practice</span>
        </div>
        <span className="text-sm font-serif text-muted-foreground">Step {step} of 5</span>
      </div>

      <div className="flex gap-1 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-[#6600ff]" : "bg-muted")}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#6600ff] to-[#9900ff]" />
            <CardContent className="p-8 min-h-[400px] flex flex-col">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-serif mb-2">{currentStep.title}</h3>
                <p className="text-muted-foreground font-serif">{currentStep.subtitle}</p>
              </div>

              <div className="flex-1">{currentStep.content}</div>

              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <Button variant="ghost" size="lg" className="gap-2 font-serif text-muted-foreground" onClick={() => setStep(s => s - 1)} data-testid="button-prev-step">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  onClick={step < 5 ? () => setStep(s => s + 1) : handleComplete}
                  data-testid="button-next-step"
                >
                  {step < 5 ? (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Complete Morning <Check className="w-4 h-4" /></>
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

function EveningReflection({ data, onSave }: { data: DailyPracticeData; onSave: (d: DailyPracticeData) => void }) {
  const [step, setStep] = useState(1);
  const [valuesChecked, setValuesChecked] = useState<boolean[]>(
    data.valuesChecked.length >= 3 ? data.valuesChecked : [false, false, false]
  );
  const [celebrations, setCelebrations] = useState(data.celebrations || "");
  const [lessons, setLessons] = useState(data.lessons || "");
  const [blessings, setBlessings] = useState(data.blessings || "");
  const [dreamVibes, setDreamVibes] = useState(data.dreamVibes || "");
  const [eveningVibe, setEveningVibe] = useState(data.eveningVibe || 8);

  const handleCheck = (idx: number) => {
    const newChecked = [...valuesChecked];
    newChecked[idx] = !newChecked[idx];
    setValuesChecked(newChecked);
    if (!valuesChecked[idx]) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 }, colors: ["#10B981", "#34D399"] });
    }
  };

  const handleComplete = () => {
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ["#6600ff", "#9900ff", "#FFD700", "#FF69B4"] });
    onSave({
      ...data,
      valuesChecked,
      celebrations,
      lessons,
      blessings,
      dreamVibes,
      eveningVibe,
      eveningCompleted: true,
    });
  };

  const steps = [
    {
      title: "CELEBRATIONS",
      subtitle: "Check off your action steps & celebrate wins",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Your Action Steps</label>
            {data.values.map((val, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                    valuesChecked[idx]
                      ? "bg-green-500 border-green-500 text-white scale-110"
                      : "border-muted-foreground/30 hover:border-[#6600ff]"
                  )}
                  onClick={() => handleCheck(idx)}
                  data-testid={`check-value-${idx}`}
                >
                  {valuesChecked[idx] && <Check className="w-4 h-4" strokeWidth={3} />}
                </div>
                <span className={cn("font-serif text-sm", valuesChecked[idx] && "line-through text-muted-foreground")}>
                  {val || `Action step ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Other Wins Today</label>
            <Textarea
              placeholder="What else went well today?"
              className="min-h-[100px] bg-muted/30 border-muted resize-none font-serif"
              value={celebrations}
              onChange={e => setCelebrations(e.target.value)}
              data-testid="textarea-celebrations"
            />
          </div>
        </div>
      ),
    },
    {
      title: "LESSONS",
      subtitle: "What did you learn today?",
      content: (
        <div className="space-y-4">
          <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Today's Insights</label>
          <Textarea
            placeholder="What lesson did today teach me?"
            className="min-h-[160px] bg-muted/30 border-muted resize-none font-serif"
            value={lessons}
            onChange={e => setLessons(e.target.value)}
            data-testid="textarea-lessons"
          />
        </div>
      ),
    },
    {
      title: "BLESSINGS",
      subtitle: "What are you grateful for tonight?",
      content: (
        <div className="space-y-4">
          <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Gratitude</label>
          <Textarea
            placeholder="I am grateful for..."
            className="min-h-[160px] bg-muted/30 border-muted resize-none font-serif"
            value={blessings}
            onChange={e => setBlessings(e.target.value)}
            data-testid="textarea-blessings"
          />
        </div>
      ),
    },
    {
      title: "DREAM VIBES",
      subtitle: "Set your evening intention & rate your vibe",
      content: (
        <div className="space-y-6">
          <VibeRater value={eveningVibe} onChange={setEveningVibe} />
          <div className="space-y-2">
            <label className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Dream Intention</label>
            <Textarea
              placeholder="What energy do you want to carry into sleep?"
              className="min-h-[100px] bg-muted/30 border-muted resize-none font-serif"
              value={dreamVibes}
              onChange={e => setDreamVibes(e.target.value)}
              data-testid="textarea-dream-vibes"
            />
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-serif text-muted-foreground uppercase tracking-wider">Evening Reflection</span>
        </div>
        <span className="text-sm font-serif text-muted-foreground">Step {step} of 4</span>
      </div>

      <div className="flex gap-1 mb-6">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-[#9900ff]" : "bg-muted")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#9900ff] to-[#cc00ff]" />
            <CardContent className="p-8 min-h-[400px] flex flex-col">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-serif mb-2">{currentStep.title}</h3>
                <p className="text-muted-foreground font-serif">{currentStep.subtitle}</p>
              </div>

              <div className="flex-1">{currentStep.content}</div>

              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <Button variant="ghost" size="lg" className="gap-2 font-serif text-muted-foreground" onClick={() => setStep(s => s - 1)} data-testid="button-evening-prev">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  onClick={step < 4 ? () => setStep(s => s + 1) : handleComplete}
                  data-testid="button-evening-next"
                >
                  {step < 4 ? (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Complete Day <Trophy className="w-4 h-4" /></>
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

function CompletedDaySummary({ data }: { data: DailyPracticeData }) {
  const selectedArea = LOVE_CODE_AREAS.find(a => a.id === data.focusAreaId);
  const completedCount = data.valuesChecked.filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6600ff] via-[#9900ff] to-[#cc00ff]" />
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
            <h3 className="text-2xl font-serif mb-2">Day Complete</h3>
            <p className="text-muted-foreground font-serif">You showed up for yourself today. That matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Morning</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-serif text-muted-foreground">Morning Vibe</span>
                <span className="text-lg font-serif" data-testid="text-morning-vibe">{data.morningVibe}/11</span>
              </div>
              {selectedArea && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${selectedArea.color}`} />
                    <span className="text-xs font-serif text-muted-foreground uppercase">{selectedArea.name}</span>
                  </div>
                  {data.vision && <p className="text-sm font-serif italic text-muted-foreground">"{data.vision}"</p>}
                </div>
              )}
              {data.victory && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Victory</span>
                  <p className="text-sm font-serif mt-1">{data.victory}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Evening</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-serif text-muted-foreground">Evening Vibe</span>
                <span className="text-lg font-serif" data-testid="text-evening-vibe">{data.eveningVibe}/11</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Actions Completed</span>
                <p className="text-sm font-serif mt-1" data-testid="text-completed-count">{completedCount} of {data.values.length}</p>
              </div>
              {data.blessings && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs font-serif text-muted-foreground uppercase tracking-wider">Blessings</span>
                  <p className="text-sm font-serif mt-1 italic">"{data.blessings}"</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PracticeHistory({ entries }: { entries: DailyPracticeData[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-serif text-lg">No practice history yet</p>
        <p className="font-serif text-sm mt-2">Start your Daily LOVE Practice today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {entries.map((entry) => {
        const area = LOVE_CODE_AREAS.find(a => a.id === entry.focusAreaId);
        const completed = entry.morningCompleted && entry.eveningCompleted;
        const completedCount = entry.valuesChecked.filter(Boolean).length;

        return (
          <Card key={entry.date} className="p-4 hover:shadow-sm transition-shadow" data-testid={`history-entry-${entry.date}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  completed ? "bg-green-100 text-green-600" : entry.morningCompleted ? "bg-[#F0E6FF] text-[#6600ff]" : "bg-muted text-muted-foreground"
                )}>
                  {completed ? <Check className="w-5 h-5" /> : entry.morningCompleted ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-serif">
                    {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-serif">
                    {area && (
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${area.color}`} />
                        {area.name}
                      </span>
                    )}
                    <span>Vibe: {entry.morningVibe || "?"} → {entry.eveningVibe || "?"}</span>
                    <span>{completedCount}/{entry.values.length} actions</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StreakBanner({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#6600ff]/10 to-[#9900ff]/10 rounded-lg mb-6 max-w-2xl mx-auto" data-testid="streak-banner">
      <Flame className="w-6 h-6 text-[#6600ff]" />
      <div>
        <p className="text-sm font-serif">
          {streak > 0 ? `${streak}-day streak` : "Start your streak today!"}
        </p>
        <p className="text-xs text-muted-foreground font-serif">
          {streak > 0 ? "Keep showing up for yourself!" : "Complete your morning practice to begin"}
        </p>
      </div>
    </div>
  );
}

export default function DailyPracticePage() {
  const { profile } = useNostr();
  const [todayData, setTodayData] = useState<DailyPracticeData | null>(null);
  const [history, setHistory] = useState<DailyPracticeData[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<PracticePhase>("morning");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.pubkey) {
      setIsLoading(false);
      return;
    }

    try {
      const headers: Record<string, string> = { "x-nostr-pubkey": profile.pubkey };

      const [todayRes, historyRes, streakRes] = await Promise.all([
        fetch("/api/daily-practice/today", { headers }),
        fetch("/api/daily-practice/history?limit=30", { headers }),
        fetch("/api/daily-practice/streak", { headers }),
      ]);

      const todayJson = await todayRes.json();
      const historyJson = await historyRes.json();
      const streakJson = await streakRes.json();

      if (todayJson) {
        setTodayData(todayJson);
        if (todayJson.morningCompleted && todayJson.eveningCompleted) {
          setPhase("complete");
        } else if (todayJson.morningCompleted) {
          setPhase("evening");
        } else {
          setPhase("morning");
        }
      } else {
        setTodayData({
          date: getToday(),
          morningVibe: null,
          focusAreaId: null,
          vision: null,
          values: ["", "", ""],
          villain: null,
          villainSolution: null,
          victory: null,
          morningCompleted: false,
          celebrations: null,
          lessons: null,
          blessings: null,
          dreamVibes: null,
          eveningVibe: null,
          valuesChecked: [false, false, false],
          eveningCompleted: false,
        });
        setPhase("morning");
      }

      setHistory(historyJson || []);
      setStreak(streakJson?.streak || 0);
    } catch (err) {
      console.error("[DailyPractice] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (updated: DailyPracticeData) => {
    if (!profile?.pubkey) return;

    try {
      const res = await fetch("/api/daily-practice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nostr-pubkey": profile.pubkey,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();
      setTodayData(saved);

      if (saved.morningCompleted && saved.eveningCompleted) {
        setPhase("complete");
        toast.success("Day complete! You are a LOVE warrior.");
      } else if (saved.morningCompleted) {
        setPhase("evening");
        toast.success("Morning practice saved! Come back this evening.");
      }

      const streakRes = await fetch("/api/daily-practice/streak", {
        headers: { "x-nostr-pubkey": profile.pubkey },
      });
      const streakJson = await streakRes.json();
      setStreak(streakJson?.streak || 0);

      const historyRes = await fetch("/api/daily-practice/history?limit=30", {
        headers: { "x-nostr-pubkey": profile.pubkey },
      });
      const historyJson = await historyRes.json();
      setHistory(historyJson || []);
    } catch (err) {
      console.error("[DailyPractice] Save error:", err);
      toast.error("Failed to save. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-96" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile?.pubkey) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-6 text-center py-20">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
          <h1 className="text-2xl font-serif mb-2" data-testid="text-login-prompt">Daily LOVE Practice</h1>
          <p className="text-muted-foreground font-serif">Please log in to access your Daily LOVE Practice.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif" data-testid="text-daily-practice-title">Daily LOVE Practice</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-[#F0E6FF] gap-2 font-serif"
            onClick={() => setShowHistory(!showHistory)}
            data-testid="button-toggle-history"
          >
            <Calendar className="w-4 h-4" />
            {showHistory ? "Today" : "History"}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm font-serif mb-6">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>

        <StreakBanner streak={streak} />

        {showHistory ? (
          <PracticeHistory entries={history} />
        ) : todayData ? (
          <>
            {phase === "morning" && (
              <MorningWizard data={todayData} onSave={saveData} />
            )}
            {phase === "evening" && (
              <>
                <div className="max-w-2xl mx-auto mb-6">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-serif text-green-800">Morning practice complete</p>
                      <p className="text-xs text-green-600 font-serif">
                        Vibe: {todayData.morningVibe}/11 | Focus: {LOVE_CODE_AREAS.find(a => a.id === todayData.focusAreaId)?.name || "—"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-[#6600ff] hover:bg-[#F0E6FF] font-serif"
                      onClick={() => setPhase("evening")}
                      data-testid="button-start-evening"
                    >
                      Start Evening <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
                <EveningReflection data={todayData} onSave={saveData} />
              </>
            )}
            {phase === "complete" && (
              <CompletedDaySummary data={todayData} />
            )}
          </>
        ) : null}
      </div>
    </Layout>
  );
}
